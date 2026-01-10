import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/reports/sales
 * Get sales report data with filters
 *
 * Query params:
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - salespersonId: Filter by salesperson
 * - manufacturer: Filter by trailer manufacturer
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get current user and check permissions
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser?.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const role = currentUser.profile.role;
    const canAccessReports = currentUser.profile.canAccessReports ?? false;

    // Only owners, directors, managers, or users with report access can view
    if (!["owner", "director", "manager"].includes(role) && !canAccessReports) {
      return NextResponse.json(
        { error: "Permission denied. You don't have access to sales reports." },
        { status: 403 }
      );
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const salespersonId = searchParams.get("salespersonId");
    const manufacturer = searchParams.get("manufacturer");

    // 4. Build filter
    const where: any = {
      status: "sold",
    };

    if (startDate || endDate) {
      where.deliveryDate = {};
      if (startDate) {
        where.deliveryDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.deliveryDate.lte = new Date(endDate);
      }
    }

    if (salespersonId) {
      where.soldByUserId = salespersonId;
    }

    if (manufacturer) {
      where.trailerManufacturer = manufacturer;
    }

    // 5. Fetch deals
    const deals = await prisma.deal.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        trailer: {
          select: {
            id: true,
            vin: true,
            stockNumber: true,
            manufacturer: true,
            category: true,
          },
        },
      },
      orderBy: { deliveryDate: "desc" },
    });

    // 6. Calculate summary stats
    const totalSales = deals.length;
    const totalRevenue = deals.reduce((sum, deal) => sum + (deal.finalPrice || 0), 0);
    const totalCost = deals.reduce((sum, deal) => sum + (deal.trailerCost || 0), 0);
    const totalProfit = deals.reduce((sum, deal) => sum + (deal.profit || 0), 0);
    const avgMargin = totalCost > 0 ? ((totalProfit / totalCost) * 100) : 0;

    // 7. Get unique manufacturers for filter dropdown
    const manufacturers = await prisma.deal.findMany({
      where: { status: "sold", trailerManufacturer: { not: null } },
      select: { trailerManufacturer: true },
      distinct: ["trailerManufacturer"],
    });

    // 8. Get salespeople for filter dropdown
    const salespeople = await prisma.user.findMany({
      where: {
        profile: {
          role: { in: ["owner", "director", "manager", "salesperson"] },
          isActive: true,
        },
      },
      select: {
        id: true,
        name: true,
        profile: {
          select: {
            repCode: true,
          },
        },
      },
    });

    // 9. Group by salesperson for leaderboard
    const salesBySalesperson: Record<string, { name: string; repCode: string; count: number; revenue: number; profit: number }> = {};

    for (const deal of deals) {
      if (deal.soldByUserId && deal.soldByName) {
        if (!salesBySalesperson[deal.soldByUserId]) {
          salesBySalesperson[deal.soldByUserId] = {
            name: deal.soldByName,
            repCode: deal.soldByRepCode || "",
            count: 0,
            revenue: 0,
            profit: 0,
          };
        }
        salesBySalesperson[deal.soldByUserId].count++;
        salesBySalesperson[deal.soldByUserId].revenue += deal.finalPrice || 0;
        salesBySalesperson[deal.soldByUserId].profit += deal.profit || 0;
      }
    }

    const leaderboard = Object.entries(salesBySalesperson)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      deals: deals.map((deal) => ({
        id: deal.id,
        dealNumber: deal.dealNumber,
        customerName: `${deal.customer?.firstName || ""} ${deal.customer?.lastName || ""}`.trim(),
        customerId: deal.customer?.id,
        soldByName: deal.soldByName,
        soldByRepCode: deal.soldByRepCode,
        deliveryDate: deal.deliveryDate,
        finalPrice: deal.finalPrice,
        trailerCost: deal.trailerCost,
        profit: deal.profit,
        profitMargin: deal.profitMargin,
        trailerManufacturer: deal.trailerManufacturer,
        trailerCategory: deal.trailerCategory,
        trailerSize: deal.trailerSize,
        trailerVin: deal.trailerVin,
        trailerStockNumber: deal.trailerStockNumber,
        dealType: deal.dealType,
        notes: deal.notes,
      })),
      summary: {
        totalSales,
        totalRevenue,
        totalCost,
        totalProfit,
        avgMargin: avgMargin.toFixed(1),
      },
      leaderboard,
      filters: {
        manufacturers: manufacturers
          .map((m) => m.trailerManufacturer)
          .filter(Boolean) as string[],
        salespeople: salespeople.map((s) => ({
          id: s.id,
          name: s.name,
          repCode: s.profile?.repCode,
        })),
      },
    });
  } catch (error: any) {
    console.error("[reports/sales] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch sales report" },
      { status: 500 }
    );
  }
}
