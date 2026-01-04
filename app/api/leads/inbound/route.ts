import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-scoring";

export const dynamic = "force-dynamic";

// Credit range mapping for lead scoring
const CREDIT_RANGE_SCORES: Record<string, number> = {
  excellent_780_plus: 30,
  good_700_779: 25,
  fair_650_699: 15,
  below_average_620_649: 10,
  rebuilding_below_620: 5,
};

// Recommended path based on credit range
const RECOMMENDED_PATHS: Record<string, string> = {
  excellent_780_plus: "rock_solid",
  good_700_779: "rock_solid",
  fair_650_699: "rock_solid", // Primary is still rock solid, with RTO as secondary
  below_average_620_649: "rock_solid",
  rebuilding_below_620: "lease_to_own", // RTO becomes highlighted
};

/**
 * POST /api/leads/inbound
 *
 * Receives leads from the Remotive website pre-qualification form.
 *
 * Expected payload:
 * {
 *   firstName: string,
 *   lastName: string,
 *   email: string,
 *   phone: string,
 *   zip: string,          // TODO: Confirm field name (zip vs zipcode) once Remotive Cody responds
 *   creditRange: string,
 *   repCode?: string,
 *   source?: string,
 *   sourcePage?: string,
 *   ctaClicked?: string,
 *   recommendedPath?: string
 * }
 *
 * Integration Status:
 * - [x] Core lead creation
 * - [x] Rep code validation
 * - [x] Manager auto-assignment
 * - [x] Duplicate detection
 * - [x] Activity Timeline logging
 * - [ ] API key authentication (waiting for Remotive auth preference)
 * - [ ] Notification emails (can add when needed)
 * - [ ] Field name confirmation (zip vs zipcode)
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // TODO: Validate auth header once Remotive auth preference confirmed
    // Options: API key header, HMAC signature, or shared secret
    // const apiKey = req.headers.get("x-api-key");
    // if (apiKey !== process.env.LEADS_INBOUND_API_KEY) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await req.json();

    // Log raw request for debugging
    console.log("📥 Inbound lead received:", {
      timestamp: new Date().toISOString(),
      payload: { ...body, phone: body.phone ? "***" : null }, // Mask phone in logs
    });

    // 1. Validate required fields
    const { firstName, lastName, email, phone, zip } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Either email or phone is required" },
        { status: 400 }
      );
    }

    // 2. Normalize fields
    const normalizedEmail = email?.toLowerCase().trim() || null;
    const normalizedPhone = phone?.replace(/\D/g, "") || null; // Remove non-digits
    const normalizedName = `${firstName.trim()} ${lastName.trim()}`.toLowerCase();

    // 3. Extract optional fields with defensive defaults
    // These defaults prevent failed submissions during early testing
    const creditRange = body.creditRange ?? "unknown";
    const repCode = body.repCode ?? null;
    const source = body.source ?? "website";
    const sourcePage = body.sourcePage ?? "/get-approved"; // TODO: Confirm route name once Remotive Cody responds
    const ctaClicked = body.ctaClicked ?? null;
    const recommendedPath = body.recommendedPath ??
      (creditRange && creditRange !== "unknown" ? RECOMMENDED_PATHS[creditRange] : null) ??
      "unknown";

    // TODO: Normalize zip vs zipcode once frontend confirmed
    const zipCode = body.zip ?? body.zipcode ?? null;

    // 4. Check for duplicates (email OR phone OR exact name match)
    const duplicateChecks = [];

    if (normalizedEmail) {
      duplicateChecks.push({ email: normalizedEmail });
    }
    if (normalizedPhone) {
      duplicateChecks.push({ phone: normalizedPhone });
    }

    let existingLead = null;
    let duplicateType: string | null = null;

    if (duplicateChecks.length > 0) {
      existingLead = await prisma.customer.findFirst({
        where: {
          OR: duplicateChecks,
        },
        include: {
          activities: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (existingLead) {
        if (existingLead.email === normalizedEmail) {
          duplicateType = "email";
        } else if (existingLead.phone === normalizedPhone) {
          duplicateType = "phone";
        }
      }
    }

    // Also check for exact name match if no email/phone duplicate
    if (!existingLead) {
      const nameMatch = await prisma.customer.findFirst({
        where: {
          AND: [
            { firstName: { equals: firstName.trim(), mode: "insensitive" } },
            { lastName: { equals: lastName.trim(), mode: "insensitive" } },
          ],
        },
      });
      if (nameMatch) {
        existingLead = nameMatch;
        duplicateType = "name";
      }
    }

    // 5. Look up rep code and get assignment info
    let assignedToId: string | null = null;
    let assignedToName: string | null = null;
    let managerId: string | null = null;
    let managerName: string | null = null;
    let isUnassigned = false;

    if (repCode) {
      const repProfile = await prisma.userProfile.findUnique({
        where: { repCode },
        include: {
          user: true,
          manager: {
            include: { profile: true },
          },
        },
      });

      if (repProfile) {
        assignedToId = repProfile.userId;
        assignedToName = `${repProfile.firstName || ""} ${repProfile.lastName || ""}`.trim() ||
                         repProfile.user.name ||
                         repProfile.user.email ||
                         "Unknown Rep";

        // Get manager info
        if (repProfile.managerId) {
          managerId = repProfile.managerId;
          const managerProfile = await prisma.userProfile.findUnique({
            where: { userId: repProfile.managerId },
          });
          if (managerProfile) {
            managerName = `${managerProfile.firstName || ""} ${managerProfile.lastName || ""}`.trim();
          }
        }

        console.log(`✅ Rep code ${repCode} validated:`, { assignedToName, managerName });
      } else {
        console.log(`⚠️ Invalid rep code: ${repCode}`);
        isUnassigned = true;
      }
    } else {
      // No rep code = free lead → Directors/Owners only
      isUnassigned = true;
    }

    // 6. If unassigned, find Directors/Owners for visibility
    // (These leads won't have an assignedToId, they'll be handled via permission system)
    if (isUnassigned) {
      console.log("📋 Lead is unassigned - will be visible to Directors/Owners only");

      // Log the Directors/Owners for reference
      const leadership = await prisma.userProfile.findMany({
        where: {
          role: { in: ["owner", "director"] },
          isActive: true,
        },
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      console.log("👥 Available Directors/Owners:", leadership.map(l =>
        `${l.firstName} ${l.lastName} (${l.role})`
      ));
    }

    // 7. Handle duplicate scenario
    if (existingLead && duplicateType) {
      console.log(`⚠️ Duplicate detected (${duplicateType}):`, {
        existingLeadId: existingLead.id,
        existingName: `${existingLead.firstName} ${existingLead.lastName}`,
        existingAssignedTo: existingLead.assignedToId,
      });

      // Different rep trying to claim same lead?
      const isDifferentRep = assignedToId && existingLead.assignedToId &&
                            assignedToId !== existingLead.assignedToId;

      if (isDifferentRep) {
        // Lock the existing lead for manager review
        await prisma.customer.update({
          where: { id: existingLead.id },
          data: {
            duplicateStatus: "pending_review",
            lockedForReview: true,
            lockedAt: new Date(),
            lockReason: `Duplicate ${duplicateType} - new rep ${repCode} attempted to claim`,
          },
        });

        // Create activity log for the duplicate attempt
        await prisma.activity.create({
          data: {
            customerId: existingLead.id,
            userId: assignedToId,
            type: "escalation",
            subject: "Duplicate Lead Detected",
            description: `New submission from ${firstName} ${lastName} (${normalizedEmail || normalizedPhone}) matched existing lead. ` +
                        `Original rep: ${existingLead.assignedToId}. New rep attempting: ${assignedToId}. ` +
                        `Match type: ${duplicateType}. Lead locked for manager review.`,
          },
        });

        // TODO: Send notifications to:
        // 1. Original rep
        // 2. New rep
        // 3. Manager of new rep

        return NextResponse.json({
          success: true,
          duplicate: true,
          message: "Lead already exists and has been flagged for manager review",
          existingLeadId: existingLead.id,
          matchType: duplicateType,
          status: "pending_review",
        });
      }

      // Same rep or unassigned lead - just update with new info
      const updatedLead = await prisma.customer.update({
        where: { id: existingLead.id },
        data: {
          // Update credit info if provided
          ...(creditRange && creditRange !== "unknown" && { creditRange }),
          ...(recommendedPath && recommendedPath !== "unknown" && { recommendedPath }),
          ...(sourcePage && { sourcePage }),
          ...(ctaClicked && { ctaClicked }),
          // Update contact info if we have new data
          ...(zipCode && { zipcode: zipCode }),
          lastActivityAt: new Date(),
        },
      });

      // Log the re-submission
      await prisma.activity.create({
        data: {
          customerId: existingLead.id,
          type: "note",
          subject: "Lead Re-submitted",
          description: `Customer re-submitted pre-qualification form. ` +
                      `Credit range: ${creditRange || "not provided"}. ` +
                      `CTA clicked: ${ctaClicked || "not provided"}.`,
        },
      });

      return NextResponse.json({
        success: true,
        duplicate: true,
        message: "Lead updated with new information",
        leadId: existingLead.id,
        matchType: duplicateType,
      });
    }

    // 8. Calculate lead score
    const baseScore = creditRange ? (CREDIT_RANGE_SCORES[creditRange] || 0) : 0;
    const leadScore = Math.min(100, baseScore + 20); // Base + bonus for submitting form

    // Determine temperature based on score
    let temperature = "warm";
    if (leadScore >= 70) temperature = "hot";
    else if (leadScore >= 40) temperature = "warm";
    else if (leadScore >= 20) temperature = "cold";
    else temperature = "cold";

    // Determine priority
    let priority = "medium";
    if (creditRange === "excellent_780_plus" || creditRange === "good_700_779") {
      priority = "high";
    } else if (creditRange === "rebuilding_below_620") {
      priority = "medium"; // Still valuable, just different path
    }

    // 9. Create the new lead
    const newLead = await prisma.customer.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        zipcode: zipCode,

        // Assignment
        assignedToId,
        assignedToName: assignedToName || managerName, // Use manager name if no rep
        salesRepName: assignedToName,
        repCode,

        // Lead info
        source,
        sourcePage,
        status: "new",

        // Pre-qualification data (only store actual values, not "unknown")
        creditRange: creditRange !== "unknown" ? creditRange : null,
        recommendedPath: recommendedPath !== "unknown" ? recommendedPath : null,
        ctaClicked,

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
        description: `New lead from pre-qualification form.\n` +
                    `Source: ${source}\n` +
                    `Page: ${sourcePage}\n` +
                    `Credit Range: ${creditRange || "Not selected"}\n` +
                    `Recommended Path: ${recommendedPath}\n` +
                    `Rep Code: ${repCode || "None (free lead)"}\n` +
                    `Response timer started.`,
      },
    });

    // Create credit range note if selected
    if (creditRange) {
      const tierLabels: Record<string, string> = {
        excellent_780_plus: "Excellent (780+)",
        good_700_779: "Good (700-779)",
        fair_650_699: "Fair (650-699)",
        below_average_620_649: "Below Average (620-649)",
        rebuilding_below_620: "Rebuilding (Below 620)",
      };

      await prisma.activity.create({
        data: {
          customerId: newLead.id,
          type: "note",
          subject: "Credit Tier Self-Selected",
          description: `Customer self-selected credit tier: ${tierLabels[creditRange] || creditRange}`,
        },
      });
    }

    // 11. TODO: Send notifications
    // - If rep assigned: notify rep of new lead
    // - If unassigned: notify Directors/Owners
    // - Start response timer countdown

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Lead processed in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      leadId: newLead.id,
      assigned: {
        repId: assignedToId,
        repName: assignedToName,
        managerId,
        managerName,
        isUnassigned,
      },
      scoring: {
        leadScore,
        temperature,
        priority,
      },
      processingTimeMs: processingTime,
    });

  } catch (error: any) {
    console.error("❌ Inbound lead error:", error);

    return NextResponse.json(
      {
        error: "Failed to process lead",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads/inbound
 *
 * Health check endpoint for the inbound lead API.
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/leads/inbound",
    description: "Inbound lead API for Remotive website integration",
    acceptedMethods: ["POST"],
    expectedPayload: {
      firstName: "string (required)",
      lastName: "string (required)",
      email: "string (required if no phone)",
      phone: "string (required if no email)",
      zip: "string (optional)",
      creditRange: "string (optional) - excellent_780_plus, good_700_779, fair_650_699, below_average_620_649, rebuilding_below_620",
      repCode: "string (optional) - REP code from URL param",
      source: "string (optional) - defaults to 'website'",
      sourcePage: "string (optional) - defaults to '/get-approved'",
      ctaClicked: "string (optional) - which CTA button was clicked",
      recommendedPath: "string (optional) - rock_solid or lease_to_own",
    },
    timestamp: new Date().toISOString(),
  });
}
