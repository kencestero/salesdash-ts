import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        user: null,
        profile: null,
      });
    }

    if (!user.profile) {
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        profile: null,
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      profile: {
        id: user.profile.id,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        phone: user.profile.phone,
        city: user.profile.city,
        zip: user.profile.zip,
        zipcode: user.profile.zipcode,
        role: user.profile.role,
        repCode: user.profile.repCode,
        managerId: user.profile.managerId,
        status: user.profile.status,
        salespersonCode: user.profile.salespersonCode,
        member: user.profile.member,
        avatarUrl: user.profile.avatarUrl,
        coverUrl: user.profile.coverUrl,
        about: user.profile.about,
        timezone: user.profile.timezone,
        website: user.profile.website,
        createdAt: user.profile.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
