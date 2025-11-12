/**
 * CRM Manager Dashboard API
 *
 * GET /api/crm/dashboard
 * Returns comprehensive metrics for managers and owners
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPermissionContext, applyPermissionFilter } from "@/lib/crm-permissions";

export const dynamic = "force-dynamic";

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

    // Apply role-based filter
    const permissionFilter = applyPermissionFilter(context);

    // Fetch all customers within permission scope
    const customers = await prisma.customer.findMany({
      where: permissionFilter,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        leadScore: true,
        temperature: true,
        priority: true,
        daysInStage: true,
        responseTime: true,
        lastActivityAt: true,
        assignedToId: true,
        assignedToName: true,
        salesRepName: true,
        applied: true,
        trailerSize: true,
        financingType: true,
        createdAt: true,
      },
    });

    // Calculate metrics
    const totalLeads = customers.length;

    // Leads by status
    const leadsByStatus = {
      new: customers.filter((c) => c.status === "new").length,
      contacted: customers.filter((c) => c.status === "contacted").length,
      qualified: customers.filter((c) => c.status === "qualified").length,
      applied: customers.filter((c) => c.status === "applied").length,
      approved: customers.filter((c) => c.status === "approved").length,
      won: customers.filter((c) => c.status === "won").length,
      dead: customers.filter((c) => c.status === "dead").length,
    };

    // Leads by temperature
    const leadsByTemperature = {
      hot: customers.filter((c) => c.temperature === "hot").length,
      warm: customers.filter((c) => c.temperature === "warm").length,
      cold: customers.filter((c) => c.temperature === "cold").length,
      dead: customers.filter((c) => c.temperature === "dead").length,
    };

    // Leads by priority
    const leadsByPriority = {
      urgent: customers.filter((c) => c.priority === "urgent").length,
      high: customers.filter((c) => c.priority === "high").length,
      medium: customers.filter((c) => c.priority === "medium").length,
      low: customers.filter((c) => c.priority === "low").length,
    };

    // Hot leads (score 70+)
    const hotLeads = customers.filter((c) => c.leadScore >= 70);

    // Stale leads (7+ days no activity)
    const staleLeads = customers.filter((c) => {
      if (!c.lastActivityAt) return true;
      const daysSinceActivity = Math.floor(
        (Date.now() - new Date(c.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceActivity >= 7;
    });

    // Average response time
    const responseTimes = customers
      .filter((c) => c.responseTime !== null)
      .map((c) => c.responseTime as number);

    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : null;

    // Team performance (group by rep)
    const teamPerformance: Record<string, any> = {};

    customers.forEach((customer) => {
      const repName = customer.salesRepName || customer.assignedToName || "Unassigned";

      if (!teamPerformance[repName]) {
        teamPerformance[repName] = {
          repName,
          totalLeads: 0,
          hotLeads: 0,
          wonLeads: 0,
          appliedLeads: 0,
          avgScore: 0,
          staleLeads: 0,
        };
      }

      teamPerformance[repName].totalLeads++;

      if (customer.leadScore >= 70) {
        teamPerformance[repName].hotLeads++;
      }

      if (customer.status === "won") {
        teamPerformance[repName].wonLeads++;
      }

      if (customer.applied) {
        teamPerformance[repName].appliedLeads++;
      }

      teamPerformance[repName].avgScore += customer.leadScore;

      if (customer.lastActivityAt) {
        const daysSinceActivity = Math.floor(
          (Date.now() - new Date(customer.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceActivity >= 7) {
          teamPerformance[repName].staleLeads++;
        }
      }
    });

    // Calculate averages and conversion rates
    Object.keys(teamPerformance).forEach((repName) => {
      const rep = teamPerformance[repName];
      rep.avgScore = Math.round(rep.avgScore / rep.totalLeads);
      rep.conversionRate =
        rep.totalLeads > 0 ? ((rep.wonLeads / rep.totalLeads) * 100).toFixed(1) : "0.0";
      rep.applyRate =
        rep.totalLeads > 0 ? ((rep.appliedLeads / rep.totalLeads) * 100).toFixed(1) : "0.0";
    });

    // Convert to array and sort by total leads
    const teamPerformanceArray = Object.values(teamPerformance).sort(
      (a, b) => b.totalLeads - a.totalLeads
    );

    // Recent activities (last 20)
    const recentActivities = await prisma.activity.findMany({
      where: {
        customer: {
          ...permissionFilter,
        },
      },
      select: {
        id: true,
        type: true,
        subject: true,
        description: true,
        createdAt: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // New leads today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const newLeadsToday = customers.filter(
      (c) => new Date(c.createdAt) >= todayStart
    ).length;

    // Applied today
    const appliedToday = customers.filter((c) => {
      if (!c.applied) return false;
      // This is approximate - would need dateApplied to be accurate
      return true;
    }).length;

    return NextResponse.json({
      overview: {
        totalLeads,
        newLeadsToday,
        appliedToday,
        avgResponseTime,
      },
      leadsByStatus,
      leadsByTemperature,
      leadsByPriority,
      hotLeads: hotLeads.slice(0, 10).map((lead) => ({
        id: lead.id,
        name: `${lead.firstName} ${lead.lastName}`,
        phone: lead.phone,
        leadScore: lead.leadScore,
        temperature: lead.temperature,
        status: lead.status,
        daysInStage: lead.daysInStage,
        salesRepName: lead.salesRepName,
      })),
      staleLeads: staleLeads.slice(0, 10).map((lead) => ({
        id: lead.id,
        name: `${lead.firstName} ${lead.lastName}`,
        phone: lead.phone,
        leadScore: lead.leadScore,
        lastActivityAt: lead.lastActivityAt,
        salesRepName: lead.salesRepName,
      })),
      teamPerformance: teamPerformanceArray,
      recentActivities: recentActivities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        subject: activity.subject,
        description: activity.description,
        customerName: activity.customer
          ? `${activity.customer.firstName} ${activity.customer.lastName}`
          : "Unknown",
        createdAt: activity.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
