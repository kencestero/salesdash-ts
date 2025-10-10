import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY: Debug endpoint to get verification URLs
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const token = await prisma.verificationToken.findFirst({
    where: { identifier: email },
    orderBy: { expires: "desc" },
  });

  if (!token) {
    return NextResponse.json({ error: "No token found" }, { status: 404 });
  }

  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token.token}`;

  return NextResponse.json({
    email,
    verificationUrl,
    expires: token.expires,
  });
}
