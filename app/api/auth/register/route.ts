import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { generateUniqueSalespersonCode } from "@/lib/salespersonCode";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, phone, zipcode, email, password } =
      await req.json();

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !phone ||
      !zipcode ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Get role from cookie (set during join code validation)
    const cookieStore = cookies();
    const roleFromCookie = cookieStore.get("join_role")?.value || "salesperson";
    const joinVerified = cookieStore.get("join_ok")?.value === "1";

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

    // Generate unique salesperson code based on role
    const salespersonCode = await generateUniqueSalespersonCode(
      roleFromCookie,
      prisma
    );

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

    // Create user profile with ALL registration data
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        phone,
        zipcode,
        salespersonCode,
        role: roleFromCookie,
        member: joinVerified, // true if join code was validated
      },
    });

    // TODO: Send verification email with token
    // For now, we'll return the token in the response (in production, send via email)

    return NextResponse.json(
      {
        message: "Account created! Please verify your email.",
        salespersonCode, // Return the code so user knows their tracking code
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
