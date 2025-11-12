/**
 * Automated Follow-Ups Cron Job
 * Runs every hour to check for overdue tasks and create new follow-ups
 *
 * Vercel Cron: Hourly at :00
 */

import { NextRequest, NextResponse } from "next/server";
import { sendOverdueTaskReminders, detectStaleLeads } from "@/lib/follow-up-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("⏰ Starting follow-up automation cron job...");

    // Send reminders for overdue tasks
    const remindersSent = await sendOverdueTaskReminders();
    console.log(`✅ Sent ${remindersSent} overdue task reminders`);

    // Detect and escalate stale leads
    const escalationsCreated = await detectStaleLeads();
    console.log(`✅ Created ${escalationsCreated} stale lead escalations`);

    console.log("⏰ Follow-up automation cron job completed");

    return NextResponse.json({
      success: true,
      remindersSent,
      escalationsCreated,
    });
  } catch (error) {
    console.error("❌ Follow-up automation cron job failed:", error);
    return NextResponse.json(
      { error: "Failed to run follow-up automation" },
      { status: 500 }
    );
  }
}
