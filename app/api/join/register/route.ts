import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * NEW FLOW: "Verify First, Then Create Account"
 *
 * 1. Validate inputs
 * 2. Check if email already exists in User table
 * 3. Create PendingUser record (NOT User yet!)
 * 4. Send verification email
 * 5. If email fails → delete PendingUser and return error
 * 6. User account only created when they click verification link
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, zipcode, email, password, managerId, status } = body;

    console.log('=== Registration Request (NEW FLOW) ===');
    console.log('Email:', email);
    console.log('Name:', firstName, lastName);
    console.log('Manager ID:', managerId || 'None');
    console.log('Status:', status || 'employee');

    // 1. Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Check if validation cookie exists
    const cookieStore = cookies();
    const joinOk = cookieStore.get("join_ok")?.value;
    const joinRole = cookieStore.get("join_role")?.value;

    console.log('Join validation:', { joinOk, joinRole });

    if (!joinOk) {
      return NextResponse.json(
        { message: "Secret code not validated. Please validate the code first." },
        { status: 401 }
      );
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Check if user already exists in User table
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered. Please sign in instead." },
        { status: 400 }
      );
    }

    // 4. Check if there's an existing pending registration for this email
    // If yes, delete it and create a new one (allows re-signup if email failed)
    const existingPendingUser = await prisma.pendingUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingPendingUser) {
      console.log('🔄 Deleting old pending registration for:', email);
      await prisma.pendingUser.delete({
        where: { email },
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Generate secure verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 7. Create PendingUser record (NOT User account yet!)
    console.log('📝 Creating PendingUser record...');
    const pendingUser = await prisma.pendingUser.create({
      data: {
        email: normalizedEmail,
        hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        zipcode: zipcode || null,
        role: joinRole || "salesperson",
        managerId: managerId || null,
        status: status || "employee",
        token,
        expiresAt,
      },
    });

    console.log('✅ PendingUser created:', pendingUser.id);
    console.log('⏰ Expires at:', expiresAt);

    // 8. Generate verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;
    console.log('🔗 Verification URL:', verificationUrl);

    // 9. Send verification email - THIS IS CRITICAL
    console.log('📧 Attempting to send verification email...');
    console.log('🔍 RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'EXISTS' : 'MISSING');

    if (!process.env.RESEND_API_KEY) {
      // Dev fallback: allow manual verify link instead of failing
      console.warn('⚠️ RESEND_API_KEY missing – dev fallback enabled');
      
      // We already created PendingUser above; return the verification URL for manual click in non-prod.
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          ok: true,
          message: "Dev mode: copy the verification link and open it to complete signup.",
          verificationUrl,
          email,
        });
      }
      
      // Production: clean up and error (keeps current behavior)
      await prisma.pendingUser.delete({ where: { id: pendingUser.id } });
      return NextResponse.json(
        { message: "Email service not configured.", error: "EMAIL_SERVICE_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    try {
      const { sendVerificationEmail } = await import('@/lib/email/resend-service');

      const result = await sendVerificationEmail(
        email,
        `${firstName} ${lastName}`,
        verificationUrl,
        24 // 24 hours expiry
      );

      console.log('✅ Verification email sent successfully!', result);

    } catch (emailError: any) {
      // Email sending failed - DELETE the pending user and return error
      console.error('❌ Failed to send verification email:', emailError.message);
      console.error('🗑️ Deleting PendingUser since email failed...');

      await prisma.pendingUser.delete({
        where: { id: pendingUser.id },
      });

      return NextResponse.json(
        {
          message: "Failed to send verification email. Please try again.",
          error: "EMAIL_SEND_FAILED",
          details: emailError.message
        },
        { status: 500 }
      );
    }

    // 10. Clear validation cookies
    cookieStore.delete("join_ok");
    cookieStore.delete("join_role");

    // 11. Success! Tell user to check email
    return NextResponse.json({
      ok: true,
      message: "Please check your email to verify your account. The verification link will expire in 24 hours.",
      email,
      // DO NOT expose token in production
      ...(process.env.NODE_ENV === 'development' && { verificationUrl }),
    });

  } catch (error: any) {
    console.error("❌ Registration error:", error);
    return NextResponse.json(
      {
        message: "Failed to create account. Please try again.",
        error: error.message
      },
      { status: 500 }
    );
  }
}
