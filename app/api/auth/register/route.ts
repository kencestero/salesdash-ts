import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, phone, email, password } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !phone || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Create user (but not verified yet)
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        emailVerified: null, // Not verified yet
        password: hashedPassword,
      },
    });

    // Store verification token and user data temporarily
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: verificationExpiry,
      },
    });

    // Store additional user data (phone, firstName, lastName) in a temporary table or session
    // For now, we'll use the UserProfile table with a pending flag
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        role: "salesperson", // Default, will be updated based on join code
        member: false, // Not a member until email is verified
        // TODO: Add phone, firstName, lastName fields to UserProfile schema
      },
    });

    // TODO: Send verification email with token
    // For now, we'll return the token in the response (in production, send via email)

    return NextResponse.json(
      {
        message: "Account created! Please verify your email.",
        verificationToken, // Remove this in production
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Failed to create account" },
      { status: 500 }
    );
  }
}
