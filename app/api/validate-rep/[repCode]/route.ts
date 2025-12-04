import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest, props: { params: Promise<{ repCode: string }> }) {
  const params = await props.params;
  try {
    const { repCode } = params;

    if (!repCode) {
      return NextResponse.json(
        { error: "Rep code is required" },
        { status: 400 }
      );
    }

    // Look up the rep code in the database
    const userProfile = await prisma.userProfile.findUnique({
      where: { repCode },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "Invalid representative code" },
        { status: 404 }
      );
    }

    // Return rep information
    return NextResponse.json({
      valid: true,
      repCode,
      repName: `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || userProfile.user.name || "Sales Representative",
      userId: userProfile.userId,
    });
  } catch (error) {
    console.error("Error validating rep code:", error);
    return NextResponse.json(
      { error: "Failed to validate representative code" },
      { status: 500 }
    );
  }
}
