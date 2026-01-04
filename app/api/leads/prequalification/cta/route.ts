import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/leads/prequalification/cta
 *
 * Tracks which CTA (Call-to-Action) button the user clicked.
 * Called when user clicks a lender button on the Remotive website.
 *
 * Headers:
 * - Content-Type: application/json
 * - X-API-Key: {SALESHUB_API_KEY}
 *
 * Request Body:
 * {
 *   leadId: string,
 *   ctaClicked: string (e.g., "Continue with RockSolid", "Continue with ClickLease")
 * }
 *
 * Response:
 * { success: true }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Validate API Key
    const apiKey = req.headers.get("x-api-key");
    const expectedKey = process.env.SALESHUB_API_KEY;

    // Allow requests if no key configured (dev mode) OR key matches
    if (expectedKey && apiKey !== expectedKey) {
      console.log("❌ Invalid API key attempt for CTA tracking");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { leadId, ctaClicked } = body;

    // 2. Validate required fields
    if (!leadId) {
      return NextResponse.json(
        { success: false, message: "leadId is required" },
        { status: 400 }
      );
    }

    if (!ctaClicked) {
      return NextResponse.json(
        { success: false, message: "ctaClicked is required" },
        { status: 400 }
      );
    }

    console.log(`📥 CTA click tracked: ${ctaClicked} for lead ${leadId}`);

    // 3. Find the lead
    const lead = await prisma.customer.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      console.log(`⚠️ Lead not found: ${leadId}`);
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    // 4. Update the lead with CTA clicked
    await prisma.customer.update({
      where: { id: leadId },
      data: {
        ctaClicked,
        lastActivityAt: new Date(),
      },
    });

    // 5. Create activity log for CTA click
    await prisma.activity.create({
      data: {
        customerId: leadId,
        type: "note",
        subject: "Lender CTA Clicked",
        description: `Customer clicked: "${ctaClicked}"`,
      },
    });

    console.log(`✅ CTA tracked for lead ${leadId}: ${ctaClicked}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ CTA tracking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to track CTA click",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads/prequalification/cta
 *
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/leads/prequalification/cta",
    description: "Track CTA button clicks for pre-qualification leads",
    methods: ["POST"],
    authentication: "X-API-Key header with SALESHUB_API_KEY",
    requestBody: {
      leadId: "string - the lead ID from prequalification response",
      ctaClicked: "string - the button label clicked (e.g., 'Continue with RockSolid')",
    },
    response: {
      success: "boolean",
    },
    timestamp: new Date().toISOString(),
  });
}
