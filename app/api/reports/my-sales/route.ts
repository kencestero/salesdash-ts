import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/reports/my-sales
 * Get personal sales report for the current user
 *
 * Query params:
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - manufacturer: Filter by trailer manufacturer
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser?.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const manufacturer = searchParams.get("manufacturer");

    // 4. Build filter - ONLY show current user's sales
    const where: any = {
      status: "sold",
      soldByUserId: currentUser.id, // Only their sales
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

    // 7. Calculate commission (20% of profit)
    const commissionRate = 0.20;
    const totalCommission = totalProfit * commissionRate;

    // 8. Get unique manufacturers for filter dropdown (from user's sales only)
    const manufacturers = await prisma.deal.findMany({
      where: {
        status: "sold",
        soldByUserId: currentUser.id,
        trailerManufacturer: { not: null }
      },
      select: { trailerManufacturer: true },
      distinct: ["trailerManufacturer"],
    });

    // 9. Calculate monthly breakdown (current year)
    const currentYear = new Date().getFullYear();
    const monthlyStats = await prisma.deal.groupBy({
      by: ["deliveryDate"],
      where: {
        status: "sold",
        soldByUserId: currentUser.id,
        deliveryDate: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        },
      },
      _count: { id: true },
      _sum: { finalPrice: true, profit: true },
    });

    // Aggregate by month
    const monthlyBreakdown: { month: number; sales: number; revenue: number; profit: number; commission: number }[] = [];
    const monthMap = new Map<number, { sales: number; revenue: number; profit: number }>();

    for (const stat of monthlyStats) {
      if (stat.deliveryDate) {
        const month = stat.deliveryDate.getMonth();
        const existing = monthMap.get(month) || { sales: 0, revenue: 0, profit: 0 };
        monthMap.set(month, {
          sales: existing.sales + (stat._count.id || 0),
          revenue: existing.revenue + (stat._sum.finalPrice || 0),
          profit: existing.profit + (stat._sum.profit || 0),
        });
      }
    }

    for (let i = 0; i < 12; i++) {
      const data = monthMap.get(i) || { sales: 0, revenue: 0, profit: 0 };
      monthlyBreakdown.push({
        month: i,
        sales: data.sales,
        revenue: data.revenue,
        profit: data.profit,
        commission: data.profit * commissionRate,
      });
    }

    return NextResponse.json({
      repInfo: {
        name: currentUser.name,
        repCode: currentUser.profile.repCode,
        email: currentUser.email,
      },
      deals: deals.map((deal) => ({
        id: deal.id,
        dealNumber: deal.dealNumber,
        customerName: `${deal.customer?.firstName || ""} ${deal.customer?.lastName || ""}`.trim(),
        customerId: deal.customer?.id,
        deliveryDate: deal.deliveryDate,
        finalPrice: deal.finalPrice,
        trailerCost: deal.trailerCost,
        profit: deal.profit,
        profitMargin: deal.profitMargin,
        commission: (deal.profit || 0) * commissionRate,
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
        totalCommission,
        avgMargin: avgMargin.toFixed(1),
        commissionRate: (commissionRate * 100).toFixed(0),
      },
      monthlyBreakdown,
      filters: {
        manufacturers: manufacturers
          .map((m) => m.trailerManufacturer)
          .filter(Boolean) as string[],
      },
    });
  } catch (error: any) {
    console.error("[reports/my-sales] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch personal sales report" },
      { status: 500 }
    );
  }
}
