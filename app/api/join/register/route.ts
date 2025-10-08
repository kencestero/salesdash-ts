import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, zipcode, email, password } = body;

    console.log('=== Registration Request ===');
    console.log('Email:', email);
    console.log('Name:', firstName, lastName);

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

    // 3. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered. Please sign in instead." },
        { status: 400 }
      );
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create user and profile in a transaction
    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        emailVerified: new Date(), // Auto-verify for now
      },
    });

    console.log('✅ User created:', user.id);

    // Generate unique salesperson code
    const salespersonCode = `REP${Date.now().toString().slice(-5)}`;

    await prisma.userProfile.create({
      data: {
        userId: user.id,
        firstName: firstName,
        lastName: lastName,
        phone: phone || null,
        zipcode: zipcode || null,
        salespersonCode: salespersonCode,
        role: joinRole || "salesperson",
        member: true, // Mark as verified member
      },
    });

    console.log('✅ UserProfile created');

    // 6. Clear validation cookies
    cookieStore.delete("join_ok");
    cookieStore.delete("join_role");

    return NextResponse.json({
      ok: true,
      message: "Account created successfully",
      userId: user.id,
    });

  } catch (error) {
    console.error("❌ Registration error:", error);
    return NextResponse.json(
      { message: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
