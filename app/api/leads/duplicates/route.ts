import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/leads/duplicates
 *
 * Get all leads pending duplicate review.
 * Only accessible by managers, directors, and owners.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user with profile
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser?.profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const role = currentUser.profile.role;

    // Only managers+ can review duplicates
    if (!["owner", "director", "manager"].includes(role || "")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Build query based on role
    let whereClause: any = {
      duplicateStatus: "pending_review",
      lockedForReview: true,
    };

    // Managers can only see duplicates for their team
    if (role === "manager") {
      // Get team member IDs
      const teamMembers = await prisma.userProfile.findMany({
        where: { managerId: currentUser.id },
        select: { userId: true },
      });
      const teamMemberIds = [currentUser.id, ...teamMembers.map(t => t.userId)];

      whereClause.assignedToId = { in: teamMemberIds };
    }

    const duplicates = await prisma.customer.findMany({
      where: whereClause,
      include: {
        activities: {
          where: { type: "escalation" },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { lockedAt: "desc" },
    });

    // Enrich with additional context
    const enrichedDuplicates = await Promise.all(
      duplicates.map(async (lead) => {
        // Get original lead info if this is a duplicate
        let originalLead = null;
        if (lead.duplicateOfId) {
          originalLead = await prisma.customer.findUnique({
            where: { id: lead.duplicateOfId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              assignedToId: true,
              assignedToName: true,
            },
          });
        }

        // Get rep info for the new lead
        let newRepInfo = null;
        if (lead.assignedToId) {
          const profile = await prisma.userProfile.findUnique({
            where: { userId: lead.assignedToId },
            select: {
              firstName: true,
              lastName: true,
              repCode: true,
            },
          });
          newRepInfo = profile;
        }

        return {
          ...lead,
          originalLead,
          newRepInfo,
        };
      })
    );

    return NextResponse.json({
      duplicates: enrichedDuplicates,
      count: enrichedDuplicates.length,
    });

  } catch (error: any) {
    console.error("Error fetching duplicates:", error);
    return NextResponse.json(
      { error: "Failed to fetch duplicates", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads/duplicates
 *
 * Process a duplicate review decision.
 *
 * Body:
 * {
 *   leadId: string,
 *   decision: "keep_original" | "reassign_to_new" | "merge",
 *   notes?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser?.profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const role = currentUser.profile.role;
    if (!["owner", "director", "manager"].includes(role || "")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { leadId, decision, notes } = body;

    if (!leadId || !decision) {
      return NextResponse.json(
        { error: "leadId and decision are required" },
        { status: 400 }
      );
    }

    if (!["keep_original", "reassign_to_new", "merge"].includes(decision)) {
      return NextResponse.json(
        { error: "Invalid decision. Must be keep_original, reassign_to_new, or merge" },
        { status: 400 }
      );
    }

    // Get the lead
    const lead = await prisma.customer.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (lead.duplicateStatus !== "pending_review") {
      return NextResponse.json(
        { error: "Lead is not pending review" },
        { status: 400 }
      );
    }

    const reviewerName = `${currentUser.profile.firstName || ""} ${currentUser.profile.lastName || ""}`.trim() ||
                        currentUser.email;

    // Process the decision
    switch (decision) {
      case "keep_original": {
        // Keep the original owner, just unlock the lead
        await prisma.customer.update({
          where: { id: leadId },
          data: {
            duplicateStatus: "resolved",
            lockedForReview: false,
            lockReason: null,
            reviewedByUserId: currentUser.id,
            reviewDecision: "keep_original",
            reviewedAt: new Date(),
          },
        });

        // Log the decision
        await prisma.activity.create({
          data: {
            customerId: leadId,
            userId: currentUser.id,
            type: "note",
            subject: "Duplicate Review - Keep Original",
            description: `Manager ${reviewerName} reviewed duplicate lead and decided to keep original assignment. ` +
                        `${notes ? `Notes: ${notes}` : ""}`,
          },
        });

        break;
      }

      case "reassign_to_new": {
        // Parse the lock reason to get the new rep's code
        // lockReason format: "Duplicate email - new rep REP00001 attempted to claim"
        const repCodeMatch = lead.lockReason?.match(/new rep (REP\d+)/);
        const newRepCode = repCodeMatch?.[1];

        if (newRepCode) {
          // Look up the new rep
          const newRepProfile = await prisma.userProfile.findUnique({
            where: { repCode: newRepCode },
            include: { user: true },
          });

          if (newRepProfile) {
            // Update lead assignment
            await prisma.customer.update({
              where: { id: leadId },
              data: {
                assignedToId: newRepProfile.userId,
                assignedToName: `${newRepProfile.firstName || ""} ${newRepProfile.lastName || ""}`.trim() ||
                               newRepProfile.user.email,
                repCode: newRepCode,
                duplicateStatus: "resolved",
                lockedForReview: false,
                lockReason: null,
                reviewedByUserId: currentUser.id,
                reviewDecision: "reassign_to_new",
                reviewedAt: new Date(),
              },
            });

            // Log the reassignment
            await prisma.activity.create({
              data: {
                customerId: leadId,
                userId: currentUser.id,
                type: "note",
                subject: "Duplicate Review - Reassigned to New Rep",
                description: `Manager ${reviewerName} reviewed duplicate lead and reassigned to ${newRepProfile.firstName} ${newRepProfile.lastName} (${newRepCode}). ` +
                            `${notes ? `Notes: ${notes}` : ""}`,
              },
            });
          }
        } else {
          return NextResponse.json(
            { error: "Could not determine new rep from lock reason" },
            { status: 400 }
          );
        }

        break;
      }

      case "merge": {
        // Merge with original lead (if duplicateOfId exists)
        if (!lead.duplicateOfId) {
          return NextResponse.json(
            { error: "No original lead to merge with" },
            { status: 400 }
          );
        }

        const originalLead = await prisma.customer.findUnique({
          where: { id: lead.duplicateOfId },
        });

        if (!originalLead) {
          return NextResponse.json(
            { error: "Original lead not found" },
            { status: 400 }
          );
        }

        // Transfer activities to original lead
        await prisma.activity.updateMany({
          where: { customerId: leadId },
          data: { customerId: lead.duplicateOfId },
        });

        // Merge notes
        const mergedNotes = [
          originalLead.notes || "",
          "[MERGED FROM DUPLICATE]",
          lead.notes || "",
        ].filter(Boolean).join("\n");

        const mergedManagerNotes = [
          originalLead.managerNotes || "",
          "[MERGED FROM DUPLICATE]",
          lead.managerNotes || "",
        ].filter(Boolean).join("\n");

        // Update original lead with any new info
        await prisma.customer.update({
          where: { id: lead.duplicateOfId },
          data: {
            notes: mergedNotes || null,
            managerNotes: mergedManagerNotes || null,
            // Keep the higher lead score
            leadScore: Math.max(originalLead.leadScore, lead.leadScore),
            // Update credit range if new one provided
            ...(lead.creditRange && { creditRange: lead.creditRange }),
            ...(lead.recommendedPath && { recommendedPath: lead.recommendedPath }),
            lastActivityAt: new Date(),
          },
        });

        // Log the merge on original lead
        await prisma.activity.create({
          data: {
            customerId: lead.duplicateOfId,
            userId: currentUser.id,
            type: "note",
            subject: "Lead Merged",
            description: `Duplicate lead merged by ${reviewerName}. ` +
                        `Merged from: ${lead.firstName} ${lead.lastName} (${lead.email || lead.phone}). ` +
                        `${notes ? `Notes: ${notes}` : ""}`,
          },
        });

        // Delete the duplicate
        await prisma.customer.delete({
          where: { id: leadId },
        });

        return NextResponse.json({
          success: true,
          decision: "merge",
          mergedIntoLeadId: lead.duplicateOfId,
          message: "Lead successfully merged",
        });
      }
    }

    // TODO: Send notifications to all parties
    // - Original rep (if different from new assignment)
    // - New rep (if reassigned)
    // - The manager who made the decision

    return NextResponse.json({
      success: true,
      decision,
      leadId,
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("Error processing duplicate review:", error);
    return NextResponse.json(
      { error: "Failed to process review", details: error.message },
      { status: 500 }
    );
  }
}
