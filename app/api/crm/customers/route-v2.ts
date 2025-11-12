/**
 * CRM Customers API with Role-Based Permissions & Bidirectional Sync
 *
 * NEW VERSION with VinSolutions-level features:
 * - Role-based permission matrix
 * - Bidirectional Google Sheets sync
 * - Lead scoring
 * - Activity tracking
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPermissionContext, checkCRMPermission, applyPermissionFilter } from "@/lib/crm-permissions";
import { syncCustomerToSheet } from "@/lib/google-sheets-sync";
import { notifyNewLeadAssigned } from "@/lib/notifications";
import { calculateLeadScore, getLeadTemperature } from "@/lib/lead-scoring";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/crm/customers - List customers with ROLE-BASED FILTERING
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build permission context
    const context = await buildPermissionContext(session.user.email);
    if (!context) {
      return NextResponse.json({ error: "User profile not found" }, { status: 403 });
    }

    // Check view permission
    const canView = await checkCRMPermission(context, "view");
    if (!canView.allowed) {
      return NextResponse.json({ error: canView.reason || "Permission denied" }, { status: 403 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const temperature = searchParams.get("temperature");
    const priority = searchParams.get("priority");

    // Apply role-based filter
    const permissionFilter = applyPermissionFilter(context);

    // Build where clause
    const where: any = {
      ...permissionFilter,
    };

    if (status) {
      where.status = status;
    }

    if (temperature) {
      where.temperature = temperature;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { companyName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch customers with related data
    const customers = await prisma.customer.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        companyName: true,
        status: true,
        source: true,
        assignedToId: true,
        assignedToName: true,
        salesRepName: true,
        leadScore: true,
        temperature: true,
        priority: true,
        daysInStage: true,
        responseTime: true,
        lastActivityAt: true,
        lastContactedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            deals: true,
            activities: true,
            quotes: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" }, // Urgent first
        { leadScore: "desc" }, // High scores first
        { lastActivityAt: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST /api/crm/customers - Create new customer with PERMISSIONS & SYNC
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build permission context
    const context = await buildPermissionContext(session.user.email);
    if (!context) {
      return NextResponse.json({ error: "User profile not found" }, { status: 403 });
    }

    // Check create permission
    const canCreate = await checkCRMPermission(context, "create");
    if (!canCreate.allowed) {
      return NextResponse.json({ error: canCreate.reason || "Permission denied" }, { status: 403 });
    }

    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      street,
      city,
      state,
      zipcode,
      companyName,
      source,
      assignedToId,
      assignedToName,
      salesRepName,
      status,
      tags,
      notes,
      managerNotes,
      repNotes,
      trailerSize,
      stockNumber,
      financingType,
      applied,
    } = body;

    // Check if customer already exists
    if (email) {
      const existing = await prisma.customer.findUnique({
        where: { email },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Customer with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Create customer with advanced tracking fields
    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        street,
        city,
        state,
        zipcode,
        companyName,
        source: source || "manual_entry",
        assignedToId: assignedToId || context.userId, // Default to creator
        assignedToName,
        salesRepName,
        status: status || "new",
        tags: tags || [],
        notes,
        managerNotes,
        repNotes,
        trailerSize,
        stockNumber,
        financingType,
        applied: applied || false,
        // Advanced tracking
        leadScore: 0, // Will be calculated by scoring utility
        temperature: "warm",
        priority: "medium",
        daysInStage: 0,
        lastActivityAt: new Date(),
        syncStatus: "pending", // Mark for sync
      },
    });

    // Create initial activity log
    await prisma.activity.create({
      data: {
        customerId: customer.id,
        userId: context.userId,
        type: "note",
        subject: "Customer Created",
        description: `New customer added to CRM by ${context.userEmail}`,
        status: "completed",
        completedAt: new Date(),
      },
    });

    // 🚀 BIDIRECTIONAL SYNC: Push to Google Sheets
    try {
      const synced = await syncCustomerToSheet(customer);
      if (synced) {
        // Update sync status
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            syncStatus: "synced",
            lastSyncedToSheets: new Date(),
          },
        });
      }
    } catch (syncError) {
      console.error("Failed to sync to Google Sheets (non-blocking):", syncError);
      // Don't fail the whole request if sync fails
    }

    // 📧 SEND EMAIL NOTIFICATION: Notify assigned rep about new lead
    try {
      // Calculate lead score and temperature
      const { score } = calculateLeadScore(customer);
      const temperature = getLeadTemperature(score);

      // Get assigned rep's info
      const assignedRep = await prisma.user.findUnique({
        where: { id: customer.assignedToId || context.userId },
        include: { profile: true },
      });

      if (assignedRep?.email && assignedRep.profile) {
        await notifyNewLeadAssigned({
          repEmail: assignedRep.email,
          repName: assignedRep.profile.firstName || assignedRep.email,
          leadName: `${customer.firstName} ${customer.lastName}`,
          leadPhone: customer.phone,
          leadEmail: customer.email,
          leadScore: score,
          temperature,
          trailerSize: customer.trailerSize,
        });
        console.log(`✅ Notification sent to ${assignedRep.email} for new lead`);
      }
    } catch (notifError) {
      console.error("Failed to send notification (non-blocking):", notifError);
      // Don't fail the whole request if notification fails
    }

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
