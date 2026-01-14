/**
 * Complete Signup API for Onboarding Flow
 *
 * This endpoint:
 * 1. Validates the signup code (one-time, not expired)
 * 2. Creates a PendingUser record
 * 3. Sends verification email
 * 4. Marks signup code as used (after successful email)
 *
 * Uses the same "Verify First, Then Create Account" pattern as /api/join/register
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SignupData {
  signupCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SignupData = await req.json();

    console.log("=== Onboarding Complete Signup ===");
    console.log("Email:", body.email);
    console.log("Name:", body.firstName, body.lastName);
    console.log("Signup Code:", body.signupCode);

    // 1. Validate required fields
    if (!body.signupCode || !body.firstName || !body.lastName ||
        !body.email || !body.password || !body.phone ||
        !body.address || !body.city || !body.state || !body.zipcode) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = body.email.toLowerCase().trim();

    // 2. Validate signup code
    const signupCode = await prisma.signupCode.findUnique({
      where: { code: body.signupCode.toUpperCase() },
      include: { onboardingToken: true },
    });

    if (!signupCode) {
      return NextResponse.json(
        { success: false, error: "Invalid signup code" },
        { status: 404 }
      );
    }

    if (signupCode.used) {
      return NextResponse.json(
        { success: false, error: "This signup code has already been used" },
        { status: 410 }
      );
    }

    if (new Date() > signupCode.expiresAt) {
      return NextResponse.json(
        { success: false, error: "This signup code has expired. Please contact the company owner for a new onboarding link." },
        { status: 410 }
      );
    }

    // 3. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered. Please sign in instead." },
        { status: 400 }
      );
    }

    // 4. Delete any existing pending registration for this email
    const existingPendingUser = await prisma.pendingUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingPendingUser) {
      console.log("Deleting old pending registration for:", normalizedEmail);
      await prisma.pendingUser.delete({
        where: { email: normalizedEmail },
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // 6. Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 7. Create PendingUser record
    console.log("Creating PendingUser record...");
    const pendingUser = await prisma.pendingUser.create({
      data: {
        email: normalizedEmail,
        hashedPassword,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        zipcode: body.zipcode,
        role: "salesperson", // All onboarded reps are salespersons
        managerId: null, // Will be assigned later if needed
        status: "employee",
        token,
        expiresAt,
      },
    });

    console.log("PendingUser created:", pendingUser.id);

    // 8. Update SignupCode with address info (for recordkeeping)
    await prisma.signupCode.update({
      where: { id: signupCode.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        state: body.state,
        // Note: Full address stored in a separate user address field if needed
      },
    });

    // 9. Generate verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;
    console.log("Verification URL:", verificationUrl);

    // 10. Send verification email
    console.log("Attempting to send verification email...");

    if (!process.env.RESEND_API_KEY) {
      // Dev fallback
      console.warn("RESEND_API_KEY missing - dev fallback enabled");

      if (process.env.NODE_ENV !== "production") {
        // Mark signup code as used even in dev
        await prisma.signupCode.update({
          where: { id: signupCode.id },
          data: {
            used: true,
            usedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: "Dev mode: copy the verification link and open it to complete signup.",
          verificationUrl,
          email: normalizedEmail,
        });
      }

      // Production without email - clean up and error
      await prisma.pendingUser.delete({ where: { id: pendingUser.id } });
      return NextResponse.json(
        { success: false, error: "Email service not configured" },
        { status: 503 }
      );
    }

    try {
      const { sendVerificationEmail } = await import("@/lib/email/resend-service");

      await sendVerificationEmail(
        normalizedEmail,
        `${body.firstName} ${body.lastName}`,
        verificationUrl,
        24 // 24 hours expiry
      );

      console.log("Verification email sent successfully!");
    } catch (emailError: any) {
      // Email failed - delete pending user and return error
      console.error("Failed to send verification email:", emailError.message);

      await prisma.pendingUser.delete({
        where: { id: pendingUser.id },
      });

      return NextResponse.json(
        { success: false, error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    // 11. Mark signup code as used (AFTER successful email send)
    await prisma.signupCode.update({
      where: { id: signupCode.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    // Also mark the onboarding token as used
    if (signupCode.onboardingToken) {
      await prisma.onboardingToken.update({
        where: { id: signupCode.onboardingToken.id },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });
    }

    console.log("Signup code marked as used");

    // 12. Success response
    return NextResponse.json({
      success: true,
      message: "Please check your email to verify your account. The verification link will expire in 24 hours.",
      email: normalizedEmail,
    });
  } catch (error: any) {
    console.error("Onboarding signup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
