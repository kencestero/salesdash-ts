import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      city,
      zipcode,
      about,
      timezone,
      website,
      avatarUrl,
      coverUrl,
    } = body;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Update profile
    const updatedProfile = await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
        ...(zipcode !== undefined && { zipcode }),
        ...(about !== undefined && { about }),
        ...(timezone !== undefined && { timezone }),
        ...(website !== undefined && { website }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(coverUrl !== undefined && { coverUrl }),
      },
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
