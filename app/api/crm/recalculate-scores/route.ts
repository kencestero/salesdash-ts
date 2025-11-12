/**
 * Utility API: Recalculate Lead Scores
 *
 * Run this to update all customer lead scores, temperatures, and priorities
 * Can be called manually or via cron job
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateLeadScore,
  getLeadTemperature,
  determinePriority,
  calculateDaysInStage,
} from "@/lib/lead-scoring";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user?.profile || !["owner", "director", "manager"].includes(user.profile.role)) {
      return NextResponse.json(
        { error: "Only managers and above can recalculate scores" },
        { status: 403 }
      );
    }

    console.log("🔄 Starting lead score recalculation...");
    const startTime = Date.now();

    // Fetch all customers
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        applied: true,
        hasAppliedCredit: true,
        lastActivityAt: true,
        stockNumber: true,
        financingType: true,
        createdAt: true,
        updatedAt: true,
        status: true,
      },
    });

    console.log(`📊 Found ${customers.length} customers to process`);

    let updated = 0;
    let errors = 0;

    // Process each customer
    for (const customer of customers) {
      try {
        // Calculate new score
        const { score } = calculateLeadScore(customer);
        const temperature = getLeadTemperature(score);
        const priority = determinePriority(customer, score);
        const daysInStage = calculateDaysInStage(customer);

        // Update customer
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            leadScore: score,
            temperature,
            priority,
            daysInStage,
          },
        });

        updated++;

        if (updated % 50 === 0) {
          console.log(`✅ Processed ${updated}/${customers.length} customers...`);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error processing customer ${customer.id}:`, error);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n═══════════════════════════════════════════");
    console.log("  ✅ Lead Score Recalculation Complete!");
    console.log("═══════════════════════════════════════════");
    console.log(`📊 Total Customers:    ${customers.length}`);
    console.log(`✅ Successfully Updated: ${updated}`);
    console.log(`❌ Errors:             ${errors}`);
    console.log(`⏱️  Duration:           ${duration}s`);
    console.log("═══════════════════════════════════════════\n");

    return NextResponse.json({
      success: true,
      message: "Lead scores recalculated",
      stats: {
        total: customers.length,
        updated,
        errors,
        duration: `${duration}s`,
      },
    });
  } catch (error) {
    console.error("💥 Fatal error in lead score recalculation:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
