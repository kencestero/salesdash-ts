import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/badges - Get all available badges with user's earned status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Target user is either specified or current user
    const targetUserId = userId || currentUser.id;

    // Get all badges
    const allBadges = await prisma.badge.findMany({
      where: { isActive: true },
      orderBy: [
        { category: "asc" },
        { sortOrder: "asc" }
      ]
    });

    // Get user's earned badges
    const earnedBadges = await prisma.userBadge.findMany({
      where: { userId: targetUserId },
      select: {
        badgeId: true,
        earnedAt: true,
        metadata: true
      }
    });

    const earnedMap = new Map(
      earnedBadges.map(b => [b.badgeId, { earnedAt: b.earnedAt, metadata: b.metadata }])
    );

    // Get user's stats for progress calculation
    const stats = await prisma.salesStats.findUnique({
      where: { userId: targetUserId }
    });

    // Format badges with earned status and progress
    const badges = allBadges.map(badge => {
      const earned = earnedMap.get(badge.id);
      let progress = 0;
      let progressText = "";

      if (!earned && badge.requirement && stats) {
        // Calculate progress based on category
        if (badge.category === "sales_milestone") {
          progress = Math.min(100, (stats.totalUnitsSold / badge.requirement) * 100);
          progressText = `${stats.totalUnitsSold}/${badge.requirement} units`;
        } else if (badge.category === "trailer_type" && badge.trailerType) {
          const count = getTrailerTypeCount(stats, badge.trailerType);
          progress = Math.min(100, (count / badge.requirement) * 100);
          progressText = `${count}/${badge.requirement} ${badge.trailerType}`;
        } else if (badge.category === "trailer_size" && badge.trailerType) {
          const count = getTrailerSizeCount(stats, badge.trailerType);
          progress = Math.min(100, (count / badge.requirement) * 100);
          progressText = `${count}/${badge.requirement} ${badge.trailerType}`;
        }
      }

      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        category: badge.category,
        requirement: badge.requirement,
        trailerType: badge.trailerType,
        earned: !!earned,
        earnedAt: earned?.earnedAt || null,
        progress: earned ? 100 : progress,
        progressText: earned ? "Earned!" : progressText
      };
    });

    // Group by category
    const grouped = badges.reduce((acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    }, {} as Record<string, typeof badges>);

    return NextResponse.json({
      badges,
      grouped,
      summary: {
        total: allBadges.length,
        earned: earnedBadges.length,
        progress: Math.round((earnedBadges.length / allBadges.length) * 100)
      }
    });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}

// Helper functions
function getTrailerTypeCount(stats: any, trailerType: string): number {
  const typeMap: Record<string, string> = {
    "Enclosed": "enclosedCount",
    "Utility": "utilityCount",
    "Dump": "dumpCount",
    "Flatbed": "flatbedCount"
  };
  const key = typeMap[trailerType];
  return key ? (stats[key] || 0) : 0;
}

function getTrailerSizeCount(stats: any, size: string): number {
  const sizeMap: Record<string, string> = {
    "6x10": "size6x10Count",
    "6x12": "size6x12Count",
    "7x14": "size7x14Count",
    "7x16": "size7x16Count",
    "8x16": "size8x16Count",
    "8x20": "size8x20Count",
    "8x24": "size8x24Count"
  };
  const key = sizeMap[size];
  return key ? (stats[key] || 0) : 0;
}
