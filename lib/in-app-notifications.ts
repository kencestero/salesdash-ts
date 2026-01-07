/**
 * In-App Notification Service
 * Handles in-app notifications with user preferences
 */

import { prisma } from "@/lib/prisma";
import { NotificationType, Notification, NotificationPreference } from "@prisma/client";
import { sendEmailNotification } from "./notifications";

const NOTIFICATION_PREFERENCE_MAP: Record<NotificationType, keyof NotificationPreference | null> = {
  CUSTOMER_ASSIGNED: "customerAssigned",
  CREDIT_APP_SUBMITTED: "creditAppUpdates",
  CREDIT_APP_APPROVED: "creditAppUpdates",
  CREDIT_APP_DECLINED: "creditAppUpdates",
  FOLLOW_UP_DUE: "followUpReminders",
  DUPLICATE_DETECTED: "duplicateAlerts",
  STATUS_CHANGED: "statusChanges",
  SYSTEM_ANNOUNCEMENT: "systemAnnouncements",
  TIP: "tipsAndTricks",
  MEETING: "systemAnnouncements",
  NEW_FEATURE: "tipsAndTricks",
  WELCOME: null,
};

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  skipEmail?: boolean;
}

interface NotificationResult {
  success: boolean;
  notification?: Notification;
  emailSent?: boolean;
  error?: string;
}

export async function getOrCreatePreferences(userId: string): Promise<NotificationPreference> {
  let prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (!prefs) prefs = await prisma.notificationPreference.create({ data: { userId } });
  return prefs;
}

export async function isNotificationEnabled(
  userId: string,
  type: NotificationType,
  channel: "inApp" | "email"
): Promise<boolean> {
  const prefs = await getOrCreatePreferences(userId);
  if (channel === "inApp" && !prefs.inAppEnabled) return false;
  if (channel === "email" && !prefs.emailEnabled) return false;
  const prefField = NOTIFICATION_PREFERENCE_MAP[type];
  if (prefField === null) return true;
  return prefs[prefField] as boolean;
}

export async function createNotification(params: CreateNotificationParams): Promise<NotificationResult> {
  const { userId, type, title, message, data, actionUrl, skipEmail } = params;
  try {
    const inAppEnabled = await isNotificationEnabled(userId, type, "inApp");
    if (!inAppEnabled) return { success: true, notification: undefined, emailSent: false };

    const notification = await prisma.notification.create({
      data: { userId, type, title, message, data: data as object, actionUrl },
    });

    let emailSent = false;
    if (!skipEmail) {
      const emailEnabled = await isNotificationEnabled(userId, type, "email");
      if (emailEnabled) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
        if (user?.email) {
          const dashboardUrl = process.env.NEXTAUTH_URL || "https://remotivelogistics.com";
          emailSent = await sendEmailNotification({
            to: user.email,
            subject: `[Remotive] ${title}`,
            html: generateEmailHtml({ title, message, actionUrl: actionUrl ? `${dashboardUrl}${actionUrl}` : undefined, userName: user.name || "there" }),
          });
          if (emailSent) {
            await prisma.notification.update({ where: { id: notification.id }, data: { emailSent: true, emailSentAt: new Date() } });
          }
        }
      }
    }
    return { success: true, notification, emailSent };
  } catch (error) {
    console.error("Failed to create notification:", error);
    return { success: false, error: String(error) };
  }
}

function generateEmailHtml(params: { title: string; message: string; actionUrl?: string; userName: string }): string {
  const { title, message, actionUrl, userName } = params;
  const dashboardUrl = process.env.NEXTAUTH_URL || "https://remotivelogistics.com";
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui;"><table width="100%" style="background:#0a0a0a;padding:40px 20px;"><tr><td align="center"><table style="max-width:600px;background:#131313;border-radius:12px;"><tr><td style="background:linear-gradient(135deg,#E96114,#09213C);padding:30px;text-align:center;"><h1 style="margin:0;color:#fff;">Remotive SalesHub</h1></td></tr><tr><td style="padding:40px 30px;"><p style="color:#888;">Hey ${userName},</p><h2 style="color:#fff;">${title}</h2><p style="color:#ccc;">${message}</p>${actionUrl ? `<a href="${actionUrl}" style="display:inline-block;background:#E96114;color:#fff;padding:14px 28px;border-radius:8px;">View in Dashboard</a>` : ""}</td></tr><tr><td style="padding:20px;border-top:1px solid #222;text-align:center;"><p style="color:#666;font-size:12px;">Remotive Logistics<br><a href="${dashboardUrl}/en/user-profile/settings" style="color:#E96114;">Manage preferences</a></p></td></tr></table></td></tr></table></body></html>`;
}

// CRM Notification Functions
export async function notifyCustomerAssigned(p: { recipientUserId: string; customerId: string; customerName: string; assignedBy: string }): Promise<NotificationResult> {
  return createNotification({ userId: p.recipientUserId, type: "CUSTOMER_ASSIGNED", title: "New Customer Assigned", message: `${p.customerName} has been assigned to you by ${p.assignedBy}. Time to make contact!`, data: p, actionUrl: `/en/crm/customers/${p.customerId}` });
}

export async function notifyCreditAppUpdate(p: { recipientUserId: string; creditAppId: string; customerName: string; status: "submitted" | "approved" | "declined" }): Promise<NotificationResult> {
  const t: Record<string, NotificationType> = { submitted: "CREDIT_APP_SUBMITTED", approved: "CREDIT_APP_APPROVED", declined: "CREDIT_APP_DECLINED" };
  const titles: Record<string, string> = { submitted: "Credit Application Submitted", approved: "Credit Application Approved!", declined: "Credit Application Declined" };
  const msgs: Record<string, string> = { submitted: `${p.customerName} submitted a credit application.`, approved: `${p.customerName}'s credit application approved!`, declined: `${p.customerName}'s credit application was declined.` };
  return createNotification({ userId: p.recipientUserId, type: t[p.status], title: titles[p.status], message: msgs[p.status], data: p, actionUrl: "/en/crm/customers" });
}

export async function notifyFollowUpDue(p: { recipientUserId: string; customerId: string; customerName: string; daysSinceContact: number }): Promise<NotificationResult> {
  return createNotification({ userId: p.recipientUserId, type: "FOLLOW_UP_DUE", title: "Follow-up Reminder", message: `It's been ${p.daysSinceContact} days since you contacted ${p.customerName}. Time to follow up!`, data: p, actionUrl: `/en/crm/customers/${p.customerId}` });
}

export async function notifyDuplicateDetected(p: { originalOwnerId: string; customerId: string; customerName: string; attemptedByName: string }): Promise<NotificationResult> {
  return createNotification({ userId: p.originalOwnerId, type: "DUPLICATE_DETECTED", title: "Duplicate Customer Alert", message: `${p.attemptedByName} tried to add ${p.customerName}, but they're already your customer.`, data: p, actionUrl: `/en/crm/customers/${p.customerId}` });
}

export async function notifyStatusChanged(p: { recipientUserId: string; customerId: string; customerName: string; oldStatus: string; newStatus: string; changedByName: string }): Promise<NotificationResult> {
  return createNotification({ userId: p.recipientUserId, type: "STATUS_CHANGED", title: "Customer Status Changed", message: `${p.changedByName} changed ${p.customerName}'s status from "${p.oldStatus}" to "${p.newStatus}".`, data: p, actionUrl: `/en/crm/customers/${p.customerId}` });
}

export async function sendSystemAnnouncement(p: { title: string; message: string; recipientUserIds?: string[]; actionUrl?: string }): Promise<{ sent: number; failed: number }> {
  let ids = p.recipientUserIds;
  if (!ids) { const u = await prisma.user.findMany({ select: { id: true } }); ids = u.map(x => x.id); }
  let sent = 0, failed = 0;
  for (const id of ids) { const r = await createNotification({ userId: id, type: "SYSTEM_ANNOUNCEMENT", title: p.title, message: p.message, actionUrl: p.actionUrl }); if (r.success) sent++; else failed++; }
  return { sent, failed };
}

export async function sendTip(p: { userId: string; title: string; message: string; actionUrl?: string }): Promise<NotificationResult> {
  return createNotification({ userId: p.userId, type: "TIP", title: p.title, message: p.message, actionUrl: p.actionUrl, skipEmail: true });
}

// Notification Queries
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function getNotifications(userId: string, opts: { limit?: number; offset?: number; unreadOnly?: boolean } = {}): Promise<Notification[]> {
  const { limit = 20, offset = 0, unreadOnly = false } = opts;
  return prisma.notification.findMany({ where: { userId, ...(unreadOnly ? { read: false } : {}) }, orderBy: { createdAt: "desc" }, take: limit, skip: offset });
}

export async function markAsRead(notificationId: string, userId: string): Promise<boolean> {
  try { await prisma.notification.update({ where: { id: notificationId, userId }, data: { read: true, readAt: new Date() } }); return true; } catch { return false; }
}

export async function markAllAsRead(userId: string): Promise<number> {
  const r = await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true, readAt: new Date() } });
  return r.count;
}
