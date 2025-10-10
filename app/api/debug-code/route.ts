import { NextResponse } from "next/server";
import { getAllTodayCodes } from "@/lib/joinCode";

export async function GET() {
  const codes = getAllTodayCodes();

  return NextResponse.json({
    codes,
    authSecretExists: !!process.env.AUTH_SECRET,
    authSecretLength: process.env.AUTH_SECRET?.length || 0,
    authSecretFirst4: process.env.AUTH_SECRET?.substring(0, 4) || 'missing',
  });
}
