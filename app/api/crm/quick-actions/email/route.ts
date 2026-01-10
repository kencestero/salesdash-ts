/**
 * Quick Action: Send Email API
 * POST /api/crm/quick-actions/email
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmailNotification } from "@/lib/notifications";
import { calculateResponseTimeOnFirstContact } from "@/lib/crm-permissions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { customerId, to, subject, body: emailBody } = body;

    if (!customerId || !to || !subject || !emailBody) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        assignedToId: true,
        managerId: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // === PERMISSION CHECK: Verify user can access this customer ===
    const role = user.profile?.role || "salesperson";
    const isCRMAdmin = user.profile?.canAdminCRM ?? false;
    const isOwnerOrDirector = ["owner", "director"].includes(role);

    if (!isOwnerOrDirector && !isCRMAdmin) {
      if (role === "salesperson") {
        // Salespeople can only email their own customers
        if (customer.assignedToId !== user.id) {
          return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }
      } else if (role === "manager") {
        // Managers can email their team's customers or customers where they are the manager
        const teamMembers = await prisma.userProfile.findMany({
          where: { managerId: user.id },
          select: { userId: true },
        });
        const teamMemberIds = teamMembers.map((m) => m.userId);
        teamMemberIds.push(user.id); // Include self

        const canAccess =
          teamMemberIds.includes(customer.assignedToId || "") ||
          customer.managerId === user.id;

        if (!canAccess) {
          return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }
      }
    }

    // Send email
    const sent = await sendEmailNotification({
      to,
      subject,
      text: emailBody,
    });

    if (!sent) {
      throw new Error("Failed to send email");
    }

    // Log activity
    await prisma.activity.create({
      data: {
        customerId,
        userId: user.id,
        type: "email",
        subject: `Email: ${subject}`,
        description: emailBody,
        status: "completed",
        completedAt: new Date(),
      },
    });

    // Update last activity timestamp and calculate responseTime if first contact
    const responseTime = await calculateResponseTimeOnFirstContact(customerId);
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        lastActivityAt: new Date(),
        lastContactedAt: new Date(),
        ...(responseTime !== undefined && { responseTime }),
      },
    });

    console.log(`✅ Quick email sent to ${to} by ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
