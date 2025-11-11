import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, response: NextResponse) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileData = {
    id: session.user.id,
    avatar: session.user.image,
    fullName: session.user.name,
    email: session.user.email,
    bio: "User",
    role: "user",
    status: "online",
  };

  return NextResponse.json(profileData, { status: 200 });
}
