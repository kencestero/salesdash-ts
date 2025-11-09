import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueSalespersonCode } from "@/lib/salespersonCode";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Email Verification Endpoint - NEW FLOW
 *
 * This endpoint is called when user clicks the verification link in their email.
 * It creates the actual User account from the PendingUser record.
 *
 * Flow:
 * 1. Get token from URL query params
 * 2. Look up PendingUser by token
 * 3. Check if token expired
 * 4. If valid:
 *    - Create User account
 *    - Create UserProfile
 *    - Delete PendingUser
 *    - Redirect to login with success message
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    console.log('=== Email Verification Request ===');
    console.log('Token:', token ? `${token.substring(0, 10)}...` : 'MISSING');

    if (!token) {
      return NextResponse.redirect(
        new URL("/en/auth/verify-email?error=missing_token", req.url)
      );
    }

    // 1. Find the pending user by token
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { token },
    });

    if (!pendingUser) {
      console.error('❌ Invalid token - PendingUser not found');
      return NextResponse.redirect(
        new URL("/en/auth/verify-email?error=invalid_token", req.url)
      );
    }

    console.log('✅ PendingUser found:', pendingUser.email);

    // 2. Check if token expired
    if (pendingUser.expiresAt < new Date()) {
      console.error('❌ Token expired for:', pendingUser.email);

      // Delete the expired pending user
      await prisma.pendingUser.delete({
        where: { token },
      });

      return NextResponse.redirect(
        new URL("/en/auth/verify-email?error=expired_token", req.url)
      );
    }

    // 3. Check if user already exists (shouldn't happen, but safety check)
    const existingUser = await prisma.user.findUnique({
      where: { email: pendingUser.email },
    });

    if (existingUser) {
      console.warn('⚠️ User already exists for:', pendingUser.email);

      // Clean up the pending user
      await prisma.pendingUser.delete({
        where: { token },
      });

      // Redirect to login - they're already registered
      return NextResponse.redirect(
        new URL("/en/auth/login?message=already_verified", req.url)
      );
    }

    // 4. Generate unique salesperson code and rep code
    console.log('🔢 Generating salesperson code...');
    const salespersonCode = await generateUniqueSalespersonCode(
      pendingUser.role,
      prisma
    );
    console.log('✅ Salesperson code:', salespersonCode);

    // Generate rep code: "REP" + 6 random digits or "REP000000" for freelancers
    let repCode: string;
    if (pendingUser.status === "freelancer") {
      repCode = "REP000000";
    } else {
      // Generate unique 6-digit code
      let isUnique = false;
      repCode = "";
      while (!isUnique) {
        const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
        repCode = `REP${randomDigits}`;

        // Check if this code already exists
        const existing = await prisma.userProfile.findUnique({
          where: { repCode },
        });
        if (!existing) {
          isUnique = true;
        }
      }
    }
    console.log('✅ Rep code:', repCode);

    // 5. Create User account and UserProfile in a transaction
    console.log('📝 Creating User account and profile...');

    const user = await prisma.$transaction(async (tx) => {
      // Create User
      const newUser = await tx.user.create({
        data: {
          email: pendingUser.email,
          name: `${pendingUser.firstName} ${pendingUser.lastName}`,
          password: pendingUser.hashedPassword,
          emailVerified: new Date(), // Mark as verified immediately
        },
      });

      console.log('✅ User created:', newUser.id);

      // Create UserProfile
      await tx.userProfile.create({
        data: {
          userId: newUser.id,
          firstName: pendingUser.firstName,
          lastName: pendingUser.lastName,
          phone: pendingUser.phone,
          zipcode: pendingUser.zipcode,
          salespersonCode: salespersonCode,
          role: pendingUser.role,
          member: true, // They're a verified member now
          repCode: repCode,
          managerId: pendingUser.managerId,
          status: pendingUser.status,
        },
      });

      console.log('✅ UserProfile created');

      // Delete the pending user record
      await tx.pendingUser.delete({
        where: { id: pendingUser.id },
      });

      console.log('🗑️ PendingUser deleted');

      return newUser;
    });

    console.log('🎉 Email verification complete for:', user.email);

    // 6. Redirect to login with success message
    return NextResponse.redirect(
      new URL("/en/auth/login?verified=true", req.url)
    );

  } catch (error: any) {
    console.error("❌ Email verification error:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    // Return more detailed error for debugging
    const errorMessage = encodeURIComponent(error.message || "Unknown error");
    return NextResponse.redirect(
      new URL(`/en/auth/verify-email?error=verification_failed&details=${errorMessage}`, req.url)
    );
  }
}
