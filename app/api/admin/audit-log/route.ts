import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildPermissionContext,
  canAccessAuditLog,
} from "@/lib/crm-permissions";

export const dynamic = "force-dynamic";

// GET /api/admin/audit-log - Get audit log entries with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    const context = await buildPermissionContext(session.user.email);
    if (!context) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    if (!canAccessAuditLog(context)) {
      return NextResponse.json(
        { error: "You don't have permission to view the audit log" },
        { status: 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Build where clause
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate + "T23:59:59.999Z");
      }
    }

    // Fetch logs with pagination
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 100), // Cap at 100
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Get unique action types for filter dropdown
    const actionTypes = await prisma.auditLog.groupBy({
      by: ["action"],
      _count: { action: true },
    });

    // Get unique entity types for filter dropdown
    const entityTypes = await prisma.auditLog.groupBy({
      by: ["entityType"],
      _count: { entityType: true },
    });

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
      hasMore: offset + logs.length < total,
      filters: {
        actionTypes: actionTypes.map((a) => a.action),
        entityTypes: entityTypes.map((e) => e.entityType),
      },
    });
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit log" },
      { status: 500 }
    );
  }
}

// GET /api/admin/audit-log/export - Export audit log as CSV
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    const context = await buildPermissionContext(session.user.email);
    if (!context) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    if (!canAccessAuditLog(context)) {
      return NextResponse.json(
        { error: "You don't have permission to export the audit log" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { filters } = body;

    // Build where clause from filters
    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = filters.action;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate + "T23:59:59.999Z");
    }

    // Fetch all matching logs (max 10000)
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    // Generate CSV
    const headers = [
      "Timestamp",
      "User",
      "Email",
      "Action",
      "Entity Type",
      "Entity ID",
      "Old Value",
      "New Value",
      "IP Address",
    ];

    const rows = logs.map((log) => [
      log.createdAt.toISOString(),
      log.userName || "",
      log.userEmail,
      log.action,
      log.entityType,
      log.entityId,
      JSON.stringify(log.oldValue || {}),
      JSON.stringify(log.newValue || {}),
      log.ipAddress || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Create audit log entry for this export
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    await prisma.auditLog.create({
      data: {
        userId: currentUser?.id || "unknown",
        userEmail: session.user.email,
        userName: currentUser?.name,
        action: "export",
        entityType: "AuditLog",
        entityId: "bulk_export",
        newValue: {
          exportedCount: logs.length,
          filters,
        } as object,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
      },
    });

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="audit-log-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting audit log:", error);
    return NextResponse.json(
      { error: "Failed to export audit log" },
      { status: 500 }
    );
  }
}
