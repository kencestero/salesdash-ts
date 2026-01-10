/**
 * Bulk Export API
 * POST /api/crm/bulk-actions/export
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPermissionContext, checkCRMPermission, applyPermissionFilter } from "@/lib/crm-permissions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const context = await buildPermissionContext(session.user.email);
    if (!context) {
      return NextResponse.json({ error: "User profile not found" }, { status: 403 });
    }

    const body = await req.json();
    const { customerIds } = body;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: "customerIds array is required" },
        { status: 400 }
      );
    }

    // Check export permission
    const canExport = await checkCRMPermission(context, "export");
    if (!canExport.allowed) {
      return NextResponse.json(
        { error: "You don't have permission to export leads" },
        { status: 403 }
      );
    }

    // Fetch customers - APPLY PERMISSION FILTER to prevent data leak
    const permissionFilter = applyPermissionFilter(context);
    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
        ...permissionFilter, // Only export customers user has access to
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        companyName: true,
        street: true,
        city: true,
        state: true,
        zipcode: true,
        status: true,
        leadScore: true,
        temperature: true,
        priority: true,
        trailerSize: true,
        stockNumber: true,
        financingType: true,
        applied: true,
        salesRepName: true,
        managerNotes: true,
        repNotes: true,
        createdAt: true,
        lastActivityAt: true,
      },
    });

    // Convert to CSV
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Company",
      "Street",
      "City",
      "State",
      "Zip",
      "Status",
      "Lead Score",
      "Temperature",
      "Priority",
      "Trailer Size",
      "Stock Number",
      "Financing",
      "Applied",
      "Sales Rep",
      "Manager Notes",
      "Rep Notes",
      "Created At",
      "Last Activity",
    ];

    const csvRows = [
      headers.join(","),
      ...customers.map((customer) => {
        const row = [
          customer.firstName || "",
          customer.lastName || "",
          customer.email || "",
          customer.phone || "",
          customer.companyName || "",
          customer.street || "",
          customer.city || "",
          customer.state || "",
          customer.zipcode || "",
          customer.status,
          customer.leadScore,
          customer.temperature,
          customer.priority,
          customer.trailerSize || "",
          customer.stockNumber || "",
          customer.financingType || "",
          customer.applied ? "Yes" : "No",
          customer.salesRepName || "",
          customer.managerNotes || "",
          customer.repNotes || "",
          customer.createdAt.toISOString(),
          customer.lastActivityAt?.toISOString() || "",
        ];

        // Escape commas and quotes
        return row
          .map((field) => {
            const str = String(field);
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(",");
      }),
    ];

    const csv = csvRows.join("\n");

    console.log(`✅ Bulk export: ${customers.length} leads exported`);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error in bulk export:", error);
    return NextResponse.json(
      { error: "Failed to export leads" },
      { status: 500 }
    );
  }
}
