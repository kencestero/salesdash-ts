/**
 * Quick Action: Send SMS API
 * POST /api/crm/quick-actions/sms
 *
 * NOTE: This is a placeholder endpoint. To actually send SMS:
 * 1. Sign up for Twilio (https://www.twilio.com/)
 * 2. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to .env
 * 3. Install: pnpm add twilio
 * 4. Uncomment the Twilio integration code below
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateResponseTimeOnFirstContact } from "@/lib/crm-permissions";

export const dynamic = "force-dynamic";

// Uncomment to use Twilio:
// import twilio from 'twilio';
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

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
    const { customerId, to, body: smsBody } = body;

    if (!customerId || !to || !smsBody) {
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
        phone: true,
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
        // Salespeople can only SMS their own customers
        if (customer.assignedToId !== user.id) {
          return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }
      } else if (role === "manager") {
        // Managers can SMS their team's customers or customers where they are the manager
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

    // TODO: Integrate Twilio for real SMS sending
    // Uncomment this code when you have Twilio credentials:
    /*
    const message = await twilioClient.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    console.log(`✅ SMS sent: ${message.sid}`);
    */

    // For now, just log the SMS (development mode)
    console.log(`📱 SMS would be sent to ${to}:`);
    console.log(`   ${smsBody}`);

    // Log activity
    await prisma.activity.create({
      data: {
        customerId,
        userId: user.id,
        type: "sms",
        subject: `SMS to ${to}`,
        description: smsBody,
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

    console.log(`✅ SMS logged (not actually sent - needs Twilio integration)`);

    return NextResponse.json({
      success: true,
      message: "SMS logged successfully (Twilio integration required for actual sending)",
    });
  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json(
      { error: "Failed to send SMS" },
      { status: 500 }
    );
  }
}
