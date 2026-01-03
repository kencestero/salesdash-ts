import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Simple API key check (uses same key as inventory import for now)
function validateApiKey(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const apiKey = req.headers.get("x-api-key");
  const expectedKey = process.env.LEADS_API_KEY || process.env.INVENTORY_API_KEY;

  if (!expectedKey) {
    console.warn("[leads/prequalification] No API key configured - allowing request");
    return true; // Allow if no key configured (dev mode)
  }

  // Check Authorization: Bearer <key> or X-API-Key header
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7) === expectedKey;
  }

  return apiKey === expectedKey;
}

/**
 * POST /api/leads/prequalification
 *
 * Receives pre-qualification leads from marketing site
 * Creates Customer record with rep/manager assignment
 */
export async function POST(req: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(req)) {
      console.error("[leads/prequalification] Invalid API key");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      zipcode,
      creditBand,
      source,
      pageUrl,
      repCode,
      // Optional enrichment fields for future
      trailerType,
      trailerSize,
      city,
      state,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, email, phone" },
        { status: 400 }
      );
    }

    console.log("[leads/prequalification] Received lead:", {
      name: `${firstName} ${lastName}`,
      email,
      phone,
      zipcode,
      creditBand,
      source,
      repCode: repCode || "(none)",
      pageUrl,
    });

    // Look up rep by repCode if provided
    let assignedRepId: string | null = null;
    let assignedRepName: string | null = null;
    let assignedManagerId: string | null = null;
    let assignedManagerName: string | null = null;

    if (repCode) {
      const repProfile = await prisma.userProfile.findUnique({
        where: { repCode },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (repProfile?.user) {
        assignedRepId = repProfile.userId;
        assignedRepName = repProfile.user.name || repProfile.user.email || null;

        console.log("[leads/prequalification] Found rep:", {
          repCode,
          repId: assignedRepId,
          repName: assignedRepName,
        });

        // Look up manager if rep has one assigned
        if (repProfile.managerId) {
          const managerUser = await prisma.user.findUnique({
            where: { id: repProfile.managerId },
            select: { id: true, name: true, email: true },
          });

          if (managerUser) {
            assignedManagerId = managerUser.id;
            assignedManagerName = managerUser.name || managerUser.email || null;

            console.log("[leads/prequalification] Assigned manager:", {
              managerId: assignedManagerId,
              managerName: assignedManagerName,
            });
          }
        }
      } else {
        console.warn("[leads/prequalification] Rep code not found:", repCode);
      }
    }

    // Check if customer already exists
    const existing = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone: phone.replace(/\D/g, "") }, // Normalize phone
        ],
      },
    });

    if (existing) {
      console.log("[leads/prequalification] Customer already exists:", existing.id);

      // Update existing customer with new info if repCode provided
      if (repCode && !existing.assignedToId) {
        await prisma.customer.update({
          where: { id: existing.id },
          data: {
            assignedToId: assignedRepId,
            salesRepName: assignedRepName,
            assignedToName: assignedManagerName,
            notes: existing.notes
              ? `${existing.notes}\n\n[${new Date().toISOString()}] Re-submitted via ${source || 'prequalification'}`
              : `[${new Date().toISOString()}] Re-submitted via ${source || 'prequalification'}`,
          },
        });
      }

      return NextResponse.json({
        success: true,
        customerId: existing.id,
        isNew: false,
        message: "Customer already exists - updated with latest info",
      });
    }

    // Create new customer record
    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone: phone.replace(/\D/g, ""), // Store normalized phone
        zipcode,
        city: city || null,
        state: state || null,
        status: "lead",
        source: source || "get-approved",
        temperature: creditBand === "excellent" || creditBand === "good" ? "hot" : "warm",
        priority: creditBand === "excellent" ? "high" : "medium",
        creditAppStatus: "not_started",
        // Rep assignment
        assignedToId: assignedRepId,
        salesRepName: assignedRepName,
        assignedToName: assignedManagerName,
        // Trailer preferences (if provided)
        trailerType: trailerType || null,
        trailerSize: trailerSize || null,
        // Notes with source tracking
        notes: `Credit Band: ${creditBand || "unknown"}\nSource: ${source || "get-approved"}\nPage URL: ${pageUrl || "N/A"}${repCode ? `\nRep Code: ${repCode}` : ""}`,
        lastContactedAt: new Date(),
      },
    });

    console.log("[leads/prequalification] Created customer:", {
      customerId: customer.id,
      name: `${firstName} ${lastName}`,
      assignedRep: assignedRepName,
      assignedManager: assignedManagerName,
    });

    // Create activity log for lead creation
    await prisma.activity.create({
      data: {
        customerId: customer.id,
        type: "note",
        subject: "Lead Created via Pre-Qualification",
        description: `New lead from ${source || "get-approved"} form.\nCredit Band: ${creditBand || "unknown"}${repCode ? `\nRep Code: ${repCode}` : ""}`,
        status: "completed",
        completedAt: new Date(),
      },
    });

    // TODO: Send notification email to assigned rep
    // TODO: Send notification to manager if high-priority lead
    console.log("[leads/prequalification] NOTIFICATION: New lead assigned to", assignedRepName || "unassigned");

    return NextResponse.json({
      success: true,
      customerId: customer.id,
      isNew: true,
      assignedTo: {
        repId: assignedRepId,
        repName: assignedRepName,
        managerId: assignedManagerId,
        managerName: assignedManagerName,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error("[leads/prequalification] Error:", error);
    return NextResponse.json(
      { error: "Failed to process lead", details: error?.message },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/leads/prequalification",
    method: "POST",
    requiredFields: ["firstName", "lastName", "email", "phone"],
    optionalFields: ["zipcode", "creditBand", "source", "pageUrl", "repCode", "trailerType", "trailerSize", "city", "state"],
  });
}
