/**
 * Badge Checker - Automatically awards badges based on sales milestones
 *
 * This module should be called after every sale to check if the user
 * has earned any new badges.
 */

import { prisma } from "@/lib/prisma";

interface BadgeCheckResult {
  newBadges: Array<{
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    category: string;
  }>;
  totalBadges: number;
}

/**
 * Check and award badges for a user based on their current stats
 */
export async function checkAndAwardBadges(userId: string): Promise<BadgeCheckResult> {
  const newBadges: BadgeCheckResult["newBadges"] = [];

  // Get user's current stats
  const salesStats = await prisma.salesStats.findUnique({
    where: { userId }
  });

  if (!salesStats) {
    return { newBadges: [], totalBadges: 0 };
  }

  // Get user's existing badges
  const existingBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true }
  });

  const existingBadgeIds = new Set(existingBadges.map(b => b.badgeId));

  // Get all available badges
  const allBadges = await prisma.badge.findMany({
    where: { isActive: true }
  });

  // Check each badge
  for (const badge of allBadges) {
    // Skip if already earned
    if (existingBadgeIds.has(badge.id)) continue;

    let earned = false;

    switch (badge.category) {
      case "sales_milestone":
        // Check total units sold
        if (badge.requirement && salesStats.totalUnitsSold >= badge.requirement) {
          earned = true;
        }
        break;

      case "trailer_type":
        // Check specific trailer type counts
        if (badge.requirement && badge.trailerType) {
          const typeCount = getTrailerTypeCount(salesStats, badge.trailerType);
          if (typeCount >= badge.requirement) {
            earned = true;
          }
        }
        break;

      case "trailer_size":
        // Check specific trailer size counts
        if (badge.requirement && badge.trailerType) {
          const sizeCount = getTrailerSizeCount(salesStats, badge.trailerType);
          if (sizeCount >= badge.requirement) {
            earned = true;
          }
        }
        break;

      case "certification":
        // Certification badges are awarded separately via training completion
        break;

      case "experience":
        // Experience badges like "30 Day Streak" require special tracking
        // These are checked separately
        break;
    }

    if (earned) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
          metadata: {
            awardedAt: new Date().toISOString(),
            stats: {
              totalUnitsSold: salesStats.totalUnitsSold,
              monthlyUnits: salesStats.monthlyUnits
            }
          }
        }
      });

      newBadges.push({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        category: badge.category
      });
    }
  }

  const totalBadges = existingBadges.length + newBadges.length;

  return { newBadges, totalBadges };
}

/**
 * Check if user qualifies for Academy Certified badge
 */
export async function checkAcademyCertification(userId: string): Promise<boolean> {
  // Define required training modules
  const requiredModules = [
    "Sales Fundamentals",
    "Finance Options",
    "Product Knowledge",
    "Customer Service",
    "CRM Training"
  ];

  // Get completed modules
  const completedModules = await prisma.trainingCompletion.findMany({
    where: {
      userId,
      moduleName: { in: requiredModules }
    },
    select: { moduleName: true }
  });

  const completedSet = new Set(completedModules.map(m => m.moduleName));

  // Check if all required modules are completed
  const allCompleted = requiredModules.every(m => completedSet.has(m));

  if (allCompleted) {
    // Find the Academy Certified badge
    const badge = await prisma.badge.findFirst({
      where: {
        name: "Academy Certified Rep",
        isActive: true
      }
    });

    if (badge) {
      // Check if already earned
      const existing = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: badge.id
          }
        }
      });

      if (!existing) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
            metadata: {
              awardedAt: new Date().toISOString(),
              modulesCompleted: requiredModules
            }
          }
        });
        return true;
      }
    }
  }

  return false;
}

/**
 * Get trailer type count from stats
 */
function getTrailerTypeCount(stats: any, trailerType: string): number {
  const typeMap: Record<string, keyof typeof stats> = {
    "Enclosed": "enclosedCount",
    "Utility": "utilityCount",
    "Dump": "dumpCount",
    "Flatbed": "flatbedCount"
  };

  const key = typeMap[trailerType];
  return key ? (stats[key] || 0) : 0;
}

/**
 * Get trailer size count from stats
 */
function getTrailerSizeCount(stats: any, size: string): number {
  const sizeMap: Record<string, keyof typeof stats> = {
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

/**
 * Update sales stats for a user (call after each sale)
 */
export async function updateSalesStats(
  userId: string,
  sale: {
    trailerType?: string;
    trailerSize?: string;
    revenue?: number;
    profit?: number;
  }
): Promise<void> {
  // Get or create stats
  let stats = await prisma.salesStats.findUnique({
    where: { userId }
  });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (!stats) {
    // Create initial stats
    stats = await prisma.salesStats.create({
      data: {
        userId,
        totalUnitsSold: 0,
        totalRevenue: 0,
        totalProfit: 0,
        avgDealSize: 0,
        monthlyUnits: 0,
        yearlyUnits: 0
      }
    });
  }

  // Build update data
  const updateData: any = {
    totalUnitsSold: { increment: 1 },
    monthlyUnits: { increment: 1 },
    yearlyUnits: { increment: 1 },
    lastSaleAt: now
  };

  if (!stats.firstSaleAt) {
    updateData.firstSaleAt = now;
  }

  if (sale.revenue) {
    updateData.totalRevenue = { increment: sale.revenue };
    // Recalculate average
    const newTotal = stats.totalRevenue + sale.revenue;
    const newCount = stats.totalUnitsSold + 1;
    updateData.avgDealSize = newTotal / newCount;
  }

  if (sale.profit) {
    updateData.totalProfit = { increment: sale.profit };
  }

  // Update type counts
  if (sale.trailerType) {
    const typeField = getTypeField(sale.trailerType);
    if (typeField) {
      updateData[typeField] = { increment: 1 };
    }
  }

  // Update size counts
  if (sale.trailerSize) {
    const sizeField = getSizeField(sale.trailerSize);
    if (sizeField) {
      updateData[sizeField] = { increment: 1 };
    }
  }

  await prisma.salesStats.update({
    where: { userId },
    data: updateData
  });

  // Check for new badges
  await checkAndAwardBadges(userId);
}

function getTypeField(type: string): string | null {
  const map: Record<string, string> = {
    "Enclosed": "enclosedCount",
    "Utility": "utilityCount",
    "Dump": "dumpCount",
    "Flatbed": "flatbedCount"
  };
  return map[type] || "otherCount";
}

function getSizeField(size: string): string | null {
  // Normalize size string (e.g., "8.5 x 20" -> "8x20")
  const normalized = size.replace(/\s/g, "").replace("8.5", "8").replace("7.5", "7");

  const map: Record<string, string> = {
    "6x10": "size6x10Count",
    "6x12": "size6x12Count",
    "7x14": "size7x14Count",
    "7x16": "size7x16Count",
    "8x16": "size8x16Count",
    "8x20": "size8x20Count",
    "8x24": "size8x24Count"
  };

  return map[normalized] || "otherSizeCount";
}
