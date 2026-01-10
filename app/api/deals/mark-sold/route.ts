import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateDealNumber,
  extractColorFromFeatures,
  formatTrailerSize,
} from "@/lib/deal-number";

/**
 * POST /api/deals/mark-sold
 * Mark a deal as sold with full tracking
 *
 * Permission: owner, director, or canAdminCRM=true
 *
 * Body:
 * - customerId: string (required)
 * - trailerId: string (optional - for inventory sync)
 * - soldByUserId: string (required - salesperson who made the sale)
 * - deliveryDate: string ISO date (required)
 * - finalPrice: number (required - sale price)
 * - vin: string (optional - override VIN)
 * - dealType: string (optional - default "cash")
 * - notes: string (optional)
 */
export async function POST(req: NextRequest) {
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
    const canAdminCRM = currentUser.profile.canAdminCRM ?? false;

    // Only owners, directors, or CRM admins can mark as sold
    if (!["owner", "director"].includes(role) && !canAdminCRM) {
      return NextResponse.json(
        { error: "Permission denied. Only Directors, Owners, and CRM Admins can mark deals as sold." },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await req.json();
    const {
      customerId,
      trailerId,
      soldByUserId,
      deliveryDate,
      finalPrice,
      vin,
      dealType = "cash",
      notes,
    } = body;

    // 4. Validate required fields
    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }
    if (!soldByUserId) {
      return NextResponse.json({ error: "Sold By (salesperson) is required" }, { status: 400 });
    }
    if (!deliveryDate) {
      return NextResponse.json({ error: "Delivery date is required" }, { status: 400 });
    }
    if (!finalPrice || finalPrice <= 0) {
      return NextResponse.json({ error: "Valid sale price is required" }, { status: 400 });
    }

    // 5. Get salesperson info for denormalized fields
    const salesperson = await prisma.user.findUnique({
      where: { id: soldByUserId },
      include: { profile: true },
    });

    if (!salesperson) {
      return NextResponse.json({ error: "Salesperson not found" }, { status: 404 });
    }

    const soldByName = salesperson.name || `${salesperson.profile?.firstName || ""} ${salesperson.profile?.lastName || ""}`.trim();
    const soldByRepCode = salesperson.profile?.repCode || null;

    // 6. Get trailer info for auto-population (if trailerId provided)
    let trailerData: any = {};
    let trailer = null;

    if (trailerId) {
      trailer = await prisma.trailer.findUnique({
        where: { id: trailerId },
      });

      if (trailer) {
        // Check if trailer is already sold
        if (trailer.status === "sold") {
          return NextResponse.json(
            { error: "This trailer has already been marked as sold" },
            { status: 400 }
          );
        }

        const features = trailer.features || [];
        const color = extractColorFromFeatures(features as string[]);
        const size = formatTrailerSize(trailer.length, trailer.width);

        trailerData = {
          trailerVin: vin || trailer.vin,
          trailerCost: trailer.cost,
          trailerManufacturer: trailer.manufacturer,
          trailerCategory: trailer.category,
          trailerSize: size,
          trailerAxles: trailer.axles,
          trailerColor: color,
          trailerHeight: trailer.height,
          trailerStockNumber: trailer.stockNumber,
        };
      }
    } else if (vin) {
      // If no trailerId but VIN provided, use VIN only
      trailerData.trailerVin = vin;
    }

    // 7. Calculate profit
    const cost = trailerData.trailerCost || 0;
    const profit = cost > 0 ? finalPrice - cost : null;
    const profitMargin = cost > 0 ? ((finalPrice - cost) / cost) * 100 : null;

    // 8. Generate deal number
    const dealNumber = await generateDealNumber();

    // 9. Create the deal record
    const deal = await prisma.deal.create({
      data: {
        customerId,
        trailerId: trailerId || null,
        dealNumber,
        status: "sold",
        dealType,
        offeredPrice: finalPrice,
        finalPrice,
        salespersonId: soldByUserId,
        closedAt: new Date(deliveryDate),
        notes,

        // Mark as Sold fields
        deliveryDate: new Date(deliveryDate),
        soldByUserId,
        soldByRepCode,
        soldByName,

        // Trailer snapshot
        ...trailerData,

        // Profit tracking
        profit,
        profitMargin,

        // Audit
        markedSoldAt: new Date(),
        markedSoldBy: currentUser.id,
      },
    });

    // 10. Update trailer status if linked
    if (trailerId && trailer) {
      await prisma.trailer.update({
        where: { id: trailerId },
        data: {
          status: "sold",
          soldAt: new Date(),
          soldBy: soldByUserId,
        },
      });
    }

    // 11. Create activity log
    await prisma.activity.create({
      data: {
        customerId,
        userId: currentUser.id,
        type: "note",
        subject: `Deal ${dealNumber} marked as sold`,
        description: `Sale completed by ${soldByName} (${soldByRepCode || "N/A"}). Final price: $${finalPrice.toLocaleString()}. Delivery date: ${new Date(deliveryDate).toLocaleDateString()}.`,
        status: "completed",
        completedAt: new Date(),
      },
    });

    // 12. Update customer status to "won"
    await prisma.customer.update({
      where: { id: customerId },
      data: { status: "won" },
    });

    console.log(`[deals/mark-sold] Deal ${dealNumber} created for customer ${customerId}`);

    return NextResponse.json({
      success: true,
      deal,
      dealNumber,
      message: `Deal ${dealNumber} has been marked as sold`,
    });
  } catch (error: any) {
    console.error("[deals/mark-sold] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mark deal as sold" },
      { status: 500 }
    );
  }
}
