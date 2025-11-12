/**
 * Lead Deduplication Engine
 * Detects and merges duplicate customer records
 */

import { prisma } from "@/lib/prisma";

export interface DuplicateGroup {
  matchType: "exact-email" | "exact-phone" | "similar-name";
  confidence: "high" | "medium" | "low";
  leads: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    createdAt: Date;
    leadScore: number;
    status: string;
  }>;
}

/**
 * Find duplicate leads in the database
 */
export async function findDuplicates(): Promise<DuplicateGroup[]> {
  const duplicateGroups: DuplicateGroup[] = [];

  // 1. Find exact email matches
  const emailDuplicates = await prisma.customer.groupBy({
    by: ["email"],
    where: {
      email: { not: null },
    },
    _count: {
      email: true,
    },
    having: {
      email: {
        _count: {
          gt: 1,
        },
      },
    },
  });

  for (const group of emailDuplicates) {
    const leads = await prisma.customer.findMany({
      where: { email: group.email! },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        leadScore: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });

    duplicateGroups.push({
      matchType: "exact-email",
      confidence: "high",
      leads,
    });
  }

  // 2. Find exact phone matches
  const phoneDuplicates = await prisma.customer.groupBy({
    by: ["phone"],
    where: {
      phone: { not: null },
    },
    _count: {
      phone: true,
    },
    having: {
      phone: {
        _count: {
          gt: 1,
        },
      },
    },
  });

  for (const group of phoneDuplicates) {
    // Skip if already found by email
    const alreadyFound = duplicateGroups.some((dg) =>
      dg.leads.some((lead) => lead.phone === group.phone)
    );
    if (alreadyFound) continue;

    const leads = await prisma.customer.findMany({
      where: { phone: group.phone! },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        leadScore: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });

    duplicateGroups.push({
      matchType: "exact-phone",
      confidence: "high",
      leads,
    });
  }

  // 3. Find similar name matches (case-insensitive, ignoring spaces)
  const allCustomers = await prisma.customer.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      createdAt: true,
      leadScore: true,
      status: true,
    },
  });

  const nameGroups = new Map<string, typeof allCustomers>();

  for (const customer of allCustomers) {
    const normalizedName = `${customer.firstName} ${customer.lastName}`
      .toLowerCase()
      .replace(/\s+/g, "");

    if (!nameGroups.has(normalizedName)) {
      nameGroups.set(normalizedName, []);
    }

    nameGroups.get(normalizedName)!.push(customer);
  }

  for (const [name, leads] of nameGroups) {
    if (leads.length > 1) {
      // Skip if already found by email or phone
      const alreadyFound = duplicateGroups.some((dg) =>
        dg.leads.some((lead) => leads.some((l) => l.id === lead.id))
      );
      if (alreadyFound) continue;

      duplicateGroups.push({
        matchType: "similar-name",
        confidence: "medium",
        leads,
      });
    }
  }

  return duplicateGroups;
}

/**
 * Merge multiple duplicate leads into one master record
 */
export async function mergeDuplicates(
  masterLeadId: string,
  duplicateLeadIds: string[]
): Promise<void> {
  const masterLead = await prisma.customer.findUnique({
    where: { id: masterLeadId },
  });

  if (!masterLead) {
    throw new Error("Master lead not found");
  }

  for (const duplicateId of duplicateLeadIds) {
    if (duplicateId === masterLeadId) continue;

    const duplicate = await prisma.customer.findUnique({
      where: { id: duplicateId },
      include: {
        activities: true,
        deals: true,
        quotes: true,
      },
    });

    if (!duplicate) continue;

    // Transfer activities
    await prisma.activity.updateMany({
      where: { customerId: duplicateId },
      data: { customerId: masterLeadId },
    });

    // Transfer deals
    await prisma.deal.updateMany({
      where: { customerId: duplicateId },
      data: { customerId: masterLeadId },
    });

    // Transfer quotes
    await prisma.quote.updateMany({
      where: { customerId: duplicateId },
      data: { customerId: masterLeadId },
    });

    // Merge notes
    const mergedNotes = [
      masterLead.notes,
      duplicate.notes ? `[MERGED] ${duplicate.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const mergedManagerNotes = [
      masterLead.managerNotes,
      duplicate.managerNotes ? `[MERGED] ${duplicate.managerNotes}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const mergedRepNotes = [
      masterLead.repNotes,
      duplicate.repNotes ? `[MERGED] ${duplicate.repNotes}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    // Merge tags
    const mergedTags = Array.from(
      new Set([...(masterLead.tags || []), ...(duplicate.tags || [])])
    );

    // Update master lead with merged data
    await prisma.customer.update({
      where: { id: masterLeadId },
      data: {
        notes: mergedNotes || masterLead.notes,
        managerNotes: mergedManagerNotes || masterLead.managerNotes,
        repNotes: mergedRepNotes || masterLead.repNotes,
        tags: mergedTags,
        // Keep the highest lead score
        leadScore: Math.max(masterLead.leadScore, duplicate.leadScore),
        // Keep the most recent activity timestamp
        lastActivityAt:
          !masterLead.lastActivityAt || !duplicate.lastActivityAt
            ? masterLead.lastActivityAt || duplicate.lastActivityAt
            : masterLead.lastActivityAt > duplicate.lastActivityAt
            ? masterLead.lastActivityAt
            : duplicate.lastActivityAt,
      },
    });

    // Log merge activity
    await prisma.activity.create({
      data: {
        customerId: masterLeadId,
        userId: masterLead.assignedToId!,
        type: "note",
        subject: "Lead Merged",
        description: `Merged duplicate lead: ${duplicate.firstName} ${duplicate.lastName} (${duplicate.email || duplicate.phone})`,
        status: "completed",
        completedAt: new Date(),
      },
    });

    // Delete duplicate
    await prisma.customer.delete({
      where: { id: duplicateId },
    });

    console.log(`✅ Merged duplicate lead ${duplicateId} into ${masterLeadId}`);
  }
}

/**
 * Auto-detect duplicate on customer creation (prevention)
 */
export async function checkForDuplicateOnCreate(
  email?: string | null,
  phone?: string | null,
  firstName?: string,
  lastName?: string
): Promise<string | null> {
  // Check exact email match
  if (email) {
    const existingByEmail = await prisma.customer.findFirst({
      where: { email },
    });

    if (existingByEmail) {
      return `Duplicate found: A lead with email ${email} already exists.`;
    }
  }

  // Check exact phone match
  if (phone) {
    const existingByPhone = await prisma.customer.findFirst({
      where: { phone },
    });

    if (existingByPhone) {
      return `Duplicate found: A lead with phone ${phone} already exists.`;
    }
  }

  // Check similar name (case-insensitive)
  if (firstName && lastName) {
    const existingByName = await prisma.customer.findFirst({
      where: {
        firstName: { equals: firstName, mode: "insensitive" },
        lastName: { equals: lastName, mode: "insensitive" },
      },
    });

    if (existingByName) {
      return `Possible duplicate: A lead named ${firstName} ${lastName} already exists. Please verify before creating.`;
    }
  }

  return null; // No duplicates found
}
