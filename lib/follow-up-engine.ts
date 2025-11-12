/**
 * Automated Follow-Up Engine
 * Creates and schedules follow-up tasks based on lead status and time elapsed
 */

import { prisma } from "@/lib/prisma";
import { notifyNewLeadAssigned } from "@/lib/notifications";

export interface FollowUpRule {
  status: string;
  daysAfter: number;
  taskType: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
}

/**
 * Follow-up rules for different lead statuses
 */
export const FOLLOW_UP_RULES: FollowUpRule[] = [
  // NEW leads - immediate follow-up required
  {
    status: "new",
    daysAfter: 0,
    taskType: "call",
    subject: "Initial Contact Required",
    description: "Make first contact with new lead. Introduce yourself and qualify their needs.",
    priority: "urgent",
  },
  {
    status: "new",
    daysAfter: 1,
    taskType: "call",
    subject: "Follow-Up: First Contact Attempt",
    description: "Second attempt to reach new lead if no response from first contact.",
    priority: "high",
  },

  // CONTACTED leads - keep momentum
  {
    status: "contacted",
    daysAfter: 1,
    taskType: "email",
    subject: "Send Product Information",
    description: "Send email with trailer options matching their requirements.",
    priority: "high",
  },
  {
    status: "contacted",
    daysAfter: 3,
    taskType: "call",
    subject: "Check-In Call",
    description: "Follow up to see if they reviewed the information and answer questions.",
    priority: "medium",
  },

  // QUALIFIED leads - push toward application
  {
    status: "qualified",
    daysAfter: 1,
    taskType: "task",
    subject: "Send Credit Application",
    description: "Send credit application link and financing information.",
    priority: "high",
  },
  {
    status: "qualified",
    daysAfter: 3,
    taskType: "call",
    subject: "Application Status Check",
    description: "Call to see if they need help with credit application.",
    priority: "medium",
  },
  {
    status: "qualified",
    daysAfter: 7,
    taskType: "call",
    subject: "Final Follow-Up",
    description: "Last attempt to move qualified lead forward before marking cold.",
    priority: "low",
  },

  // APPLIED leads - stay on top of approval process
  {
    status: "applied",
    daysAfter: 1,
    taskType: "task",
    subject: "Check Application Status",
    description: "Check with finance department on application status.",
    priority: "high",
  },
  {
    status: "applied",
    daysAfter: 3,
    taskType: "call",
    subject: "Update Customer on Application",
    description: "Call customer with update on their credit application.",
    priority: "medium",
  },

  // APPROVED leads - close the deal!
  {
    status: "approved",
    daysAfter: 0,
    taskType: "call",
    subject: "Congratulations Call - Move to Close",
    description: "Call immediately to congratulate and schedule delivery/pickup.",
    priority: "urgent",
  },
  {
    status: "approved",
    daysAfter: 1,
    taskType: "task",
    subject: "Finalize Paperwork",
    description: "Prepare and send final purchase documents.",
    priority: "high",
  },
  {
    status: "approved",
    daysAfter: 3,
    taskType: "call",
    subject: "Close Deal",
    description: "Final call to complete transaction and arrange delivery.",
    priority: "urgent",
  },
];

/**
 * Create follow-up tasks for a customer based on their current status
 */
export async function createFollowUpTasks(customerId: string): Promise<number> {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        activities: {
          where: {
            type: { in: ["call", "email", "task"] },
            status: { in: ["pending", "scheduled"] },
          },
        },
      },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Find applicable rules for current status
    const applicableRules = FOLLOW_UP_RULES.filter(
      (rule) => rule.status === customer.status
    );

    let tasksCreated = 0;

    for (const rule of applicableRules) {
      // Calculate due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + rule.daysAfter);
      dueDate.setHours(9, 0, 0, 0); // Set to 9 AM

      // Check if similar task already exists
      const existingTask = customer.activities.find(
        (activity) =>
          activity.subject === rule.subject &&
          activity.status !== "completed"
      );

      if (existingTask) {
        console.log(`Task already exists: ${rule.subject}`);
        continue;
      }

      // Create follow-up task
      await prisma.activity.create({
        data: {
          customerId,
          userId: customer.assignedToId!,
          type: rule.taskType,
          subject: rule.subject,
          description: rule.description,
          status: "scheduled",
          dueDate,
          priority: rule.priority,
        },
      });

      tasksCreated++;
      console.log(`✅ Created follow-up: ${rule.subject} (due in ${rule.daysAfter} days)`);
    }

    return tasksCreated;
  } catch (error) {
    console.error("Error creating follow-up tasks:", error);
    return 0;
  }
}

/**
 * Check for overdue tasks and send reminders
 */
export async function sendOverdueTaskReminders(): Promise<number> {
  try {
    const now = new Date();

    // Find overdue tasks
    const overdueTasks = await prisma.activity.findMany({
      where: {
        status: "scheduled",
        dueDate: {
          lt: now,
        },
      },
      include: {
        customer: true,
        user: true,
      },
    });

    let remindersSent = 0;

    for (const task of overdueTasks) {
      if (!task.user?.email || !task.customer) continue;

      // Send reminder notification (reuse new lead notification template for now)
      await notifyNewLeadAssigned({
        repEmail: task.user.email,
        repName: task.user.profile?.firstName || task.user.email,
        leadName: `${task.customer.firstName} ${task.customer.lastName}`,
        leadPhone: task.customer.phone,
        leadEmail: task.customer.email,
        leadScore: task.customer.leadScore,
        temperature: task.customer.temperature,
        trailerSize: task.customer.trailerSize,
      });

      // Mark task as "past due"
      await prisma.activity.update({
        where: { id: task.id },
        data: {
          status: "overdue",
        },
      });

      remindersSent++;
      console.log(`✅ Sent overdue reminder for task: ${task.subject}`);
    }

    return remindersSent;
  } catch (error) {
    console.error("Error sending overdue task reminders:", error);
    return 0;
  }
}

/**
 * Auto-create follow-ups when lead status changes
 */
export async function onStatusChange(customerId: string, newStatus: string): Promise<void> {
  try {
    console.log(`Creating follow-ups for customer ${customerId} (new status: ${newStatus})`);

    // Cancel old follow-ups that are no longer relevant
    await prisma.activity.updateMany({
      where: {
        customerId,
        status: "scheduled",
      },
      data: {
        status: "cancelled",
      },
    });

    // Create new follow-ups for the new status
    await createFollowUpTasks(customerId);
  } catch (error) {
    console.error("Error in onStatusChange:", error);
  }
}

/**
 * Detect stale leads and escalate to manager
 */
export async function detectStaleLeads(): Promise<number> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const staleLeads = await prisma.customer.findMany({
      where: {
        status: { notIn: ["won", "dead"] },
        OR: [
          { lastActivityAt: { lt: sevenDaysAgo } },
          { lastActivityAt: null },
        ],
      },
      include: {
        activities: {
          where: {
            type: "escalation",
            createdAt: { gte: sevenDaysAgo },
          },
        },
      },
    });

    let escalationsCreated = 0;

    for (const lead of staleLeads) {
      // Skip if already escalated in last 7 days
      if (lead.activities.length > 0) continue;

      // Create escalation task for manager
      const manager = await prisma.user.findFirst({
        where: {
          profile: {
            role: { in: ["owner", "director", "manager"] },
          },
        },
      });

      if (!manager) continue;

      await prisma.activity.create({
        data: {
          customerId: lead.id,
          userId: manager.id,
          type: "escalation",
          subject: "Stale Lead Alert",
          description: `Lead ${lead.firstName} ${lead.lastName} has had no activity for 7+ days. Please review and take action.`,
          status: "pending",
          priority: "high",
        },
      });

      escalationsCreated++;
      console.log(`✅ Escalated stale lead: ${lead.firstName} ${lead.lastName}`);
    }

    return escalationsCreated;
  } catch (error) {
    console.error("Error detecting stale leads:", error);
    return 0;
  }
}
