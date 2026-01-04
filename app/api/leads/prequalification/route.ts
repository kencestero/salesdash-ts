import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Credit range mapping from Remotive website format to SalesHub format
const CREDIT_RANGE_MAP: Record<string, string> = {
  "780+": "excellent_780_plus",
  "700_779": "good_700_779",
  "650_699": "fair_650_699",
  "620_649": "below_average_620_649",
  "below_620": "rebuilding_below_620",
};

// Lead scoring based on credit range
const CREDIT_RANGE_SCORES: Record<string, number> = {
  "780+": 30,
  "700_779": 25,
  "650_699": 15,
  "620_649": 10,
  "below_620": 5,
};

/**
 * POST /api/leads/prequalification
 *
 * Receives pre-qualification leads from Remotive Logistics website.
 * Official endpoint for remotivelogistics.com/get-approved integration.
 *
 * Headers:
 * - Content-Type: application/json
 * - X-API-Key: {SALESHUB_API_KEY}
 *
 * Request Body (per Cody's spec):
 * {
 *   firstName: string,
 *   lastName: string,
 *   email: string,
 *   phone: string (10 digits, no formatting),
 *   zip: string,
 *   creditRange: "780+" | "700_779" | "650_699" | "620_649" | "below_620",
 *   repCode: string | null (null if organic lead),
 *   source: string (default "website"),
 *   sourcePage: string (default "/get-approved"),
 *   recommendedPath: "rock_solid" | "clicklease"
 * }
 *
 * Response (Success):
 * { success: true, leadId: string, message: string }
 *
 * Response (Error):
 * { success: false, message: string }
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Validate API Key
    const apiKey = req.headers.get("x-api-key");
    const expectedKey = process.env.SALESHUB_API_KEY;

    // Allow requests if no key configured (dev mode) OR key matches
    if (expectedKey && apiKey !== expectedKey) {
      console.log("❌ Invalid API key attempt");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Log raw request for debugging (mask sensitive data)
    console.log("📥 Prequalification lead received:", {
      timestamp: new Date().toISOString(),
      payload: {
        ...body,
        phone: body.phone ? "***" : null,
        email: body.email ? "***@***" : null,
      },
    });

    // 2. Validate required fields (per Cody's spec)
    const { firstName, lastName, email, phone, zip } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: "First name and last name are required" },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, message: "Either email or phone is required" },
        { status: 400 }
      );
    }

    // 3. Normalize fields
    const normalizedEmail = email?.toLowerCase().trim() || null;
    const normalizedPhone = phone?.replace(/\D/g, "") || null;

    // 4. Extract optional fields (per Cody's spec)
    const creditRange = body.creditRange || null;
    const repCode = body.repCode || null;
    const source = body.source || "website";
    const sourcePage = body.sourcePage || "/get-approved";
    const recommendedPath = body.recommendedPath || null;

    // Map credit range to internal format
    const mappedCreditRange = creditRange ? CREDIT_RANGE_MAP[creditRange] || creditRange : null;

    // 5. Check for duplicates (email OR phone)
    const duplicateChecks = [];
    if (normalizedEmail) {
      duplicateChecks.push({ email: normalizedEmail });
    }
    if (normalizedPhone) {
      duplicateChecks.push({ phone: normalizedPhone });
    }

    let existingLead = null;
    if (duplicateChecks.length > 0) {
      existingLead = await prisma.customer.findFirst({
        where: { OR: duplicateChecks },
      });
    }

    // 6. Look up rep by repCode
    let assignedToId: string | null = null;
    let assignedToName: string | null = null;

    if (repCode) {
      const repProfile = await prisma.userProfile.findUnique({
        where: { repCode },
        include: { user: true },
      });

      if (repProfile) {
        assignedToId = repProfile.userId;
        assignedToName =
          `${repProfile.firstName || ""} ${repProfile.lastName || ""}`.trim() ||
          repProfile.user.name ||
          repProfile.user.email ||
          "Unknown Rep";

        console.log(`✅ Rep code ${repCode} matched to: ${assignedToName}`);
      } else {
        console.log(`⚠️ Rep code ${repCode} not found - lead will be unassigned`);
      }
    } else {
      console.log("📋 No rep code - organic lead");
    }

    // 7. Handle duplicate scenario
    if (existingLead) {
      console.log(`⚠️ Duplicate lead detected: ${existingLead.id}`);

      // Update existing lead with new info
      await prisma.customer.update({
        where: { id: existingLead.id },
        data: {
          ...(mappedCreditRange && { creditRange: mappedCreditRange }),
          ...(recommendedPath && { recommendedPath }),
          ...(sourcePage && { sourcePage }),
          ...(zip && { zipcode: zip }),
          lastActivityAt: new Date(),
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          customerId: existingLead.id,
          type: "note",
          subject: "Lead Re-submitted",
          description: `Customer re-submitted pre-qualification form. Credit range: ${creditRange || "not provided"}.`,
        },
      });

      return NextResponse.json({
        success: true,
        leadId: existingLead.id,
        message: "Lead updated (existing customer)",
      });
    }

    // 8. Calculate lead score
    const baseScore = creditRange ? CREDIT_RANGE_SCORES[creditRange] || 0 : 0;
    const leadScore = Math.min(100, baseScore + 20); // +20 for submitting form

    // Determine temperature
    let temperature = "warm";
    if (leadScore >= 70) temperature = "hot";
    else if (leadScore < 40) temperature = "cold";

    // Determine priority
    let priority = "medium";
    if (creditRange === "780+" || creditRange === "700_779") {
      priority = "high";
    }

    // 9. Create the new lead
    const newLead = await prisma.customer.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        zipcode: zip || null,

        // Assignment
        assignedToId,
        assignedToName,
        salesRepName: assignedToName,
        repCode,

        // Lead info
        source,
        sourcePage,
        status: "new",

        // Pre-qualification data
        creditRange: mappedCreditRange,
        recommendedPath,

        // Scoring
        leadScore,
        temperature,
        priority,
        daysInStage: 0,

        // Metadata
        lastActivityAt: new Date(),
      },
    });

    console.log(`✅ New lead created: ${newLead.id}`);

    // 10. Create initial activity
    await prisma.activity.create({
      data: {
        customerId: newLead.id,
        userId: assignedToId,
        type: "note",
        subject: "Lead Created via Website",
        description:
          `New lead from pre-qualification form.\n` +
          `Source: ${source}\n` +
          `Page: ${sourcePage}\n` +
          `Credit Range: ${creditRange || "Not selected"}\n` +
          `Recommended Path: ${recommendedPath || "Not determined"}\n` +
          `Rep Code: ${repCode || "None (organic lead)"}`,
      },
    });

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Lead processed in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      leadId: newLead.id,
      message: "Lead created successfully",
    });
  } catch (error: any) {
    console.error("❌ Prequalification lead error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process lead",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads/prequalification
 *
 * Health check and API documentation endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/leads/prequalification",
    description: "Remotive Logistics website pre-qualification lead API",
    methods: ["POST"],
    authentication: "X-API-Key header with SALESHUB_API_KEY",
    requestBody: {
      firstName: "string (required)",
      lastName: "string (required)",
      email: "string (required if no phone)",
      phone: "string - 10 digits (required if no email)",
      zip: "string (optional)",
      creditRange: "780+ | 700_779 | 650_699 | 620_649 | below_620 (optional)",
      repCode: "string or null - rep's code for attribution (optional)",
      source: "string - default 'website' (optional)",
      sourcePage: "string - default '/get-approved' (optional)",
      recommendedPath: "rock_solid | clicklease (optional)",
    },
    response: {
      success: "boolean",
      leadId: "string - the created/updated lead ID",
      message: "string - status message",
    },
    timestamp: new Date().toISOString(),
  });
}
