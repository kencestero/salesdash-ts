import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildPermissionContext,
  canAccessCRMSettings,
} from "@/lib/crm-permissions";

export const dynamic = "force-dynamic";

// Default CRM Settings - used to seed initial values
const DEFAULT_SETTINGS: Array<{
  key: string;
  value: unknown;
  category: string;
  description: string;
}> = [
  // Assignment Rules
  {
    key: "require_rep_for_contacted",
    value: false,
    category: "assignment",
    description: "Require rep assignment before marking as Contacted",
  },
  {
    key: "require_rep_for_qualified",
    value: true,
    category: "assignment",
    description: "Require rep assignment before marking as Qualified",
  },
  {
    key: "lock_reassignment",
    value: false,
    category: "assignment",
    description: "Only Owner/Director can reassign leads",
  },
  {
    key: "steal_protection",
    value: true,
    category: "assignment",
    description: "Prevent reps from taking others' assigned leads",
  },

  // SLA & Notifications
  {
    key: "sla_new_lead_seconds",
    value: 90,
    category: "sla",
    description: "Target response time for new leads (in seconds)",
  },
  {
    key: "escalation_enabled",
    value: true,
    category: "sla",
    description: "Enable escalation when SLA is breached",
  },
  {
    key: "escalation_minutes",
    value: 5,
    category: "sla",
    description: "Minutes before escalating unresponded leads",
  },
  {
    key: "escalation_chain",
    value: ["manager", "director"],
    category: "sla",
    description: "Who gets notified on escalation (in order)",
  },
  {
    key: "notification_channels",
    value: ["in_app", "email"],
    category: "sla",
    description: "How to send notifications",
  },

  // Required Fields by Status
  {
    key: "required_for_qualified",
    value: ["phone", "email"],
    category: "required_fields",
    description: "Fields required to mark as Qualified",
  },
  {
    key: "required_for_applied",
    value: ["trailerType", "financingType"],
    category: "required_fields",
    description: "Fields required to mark as Applied",
  },
  {
    key: "required_for_won",
    value: ["trailerSize", "stockNumber"],
    category: "required_fields",
    description: "Fields required to mark as Won",
  },
  {
    key: "require_lost_reason",
    value: true,
    category: "required_fields",
    description: "Require lost reason when marking as Dead",
  },

  // Import Settings
  {
    key: "dedupe_on_import",
    value: "skip",
    category: "import",
    description: "Duplicate handling: skip, merge, or create",
  },
  {
    key: "dedupe_match_fields",
    value: ["email", "phone"],
    category: "import",
    description: "Fields to match duplicates on",
  },
  {
    key: "default_lead_source",
    value: "Google Sheets",
    category: "import",
    description: "Default source for imported leads",
  },
  {
    key: "auto_lock_duplicates",
    value: true,
    category: "import",
    description: "Lock potential duplicates for admin review",
  },
];

// GET /api/crm/settings - Get all CRM settings
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

    const access = canAccessCRMSettings(context);
    if (!access.canView) {
      return NextResponse.json(
        { error: "You don't have permission to view CRM settings" },
        { status: 403 }
      );
    }

    // Get all settings from database
    let settings = await prisma.cRMSetting.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    // If no settings exist, seed with defaults
    if (settings.length === 0) {
      await prisma.cRMSetting.createMany({
        data: DEFAULT_SETTINGS.map((s) => ({
          key: s.key,
          value: s.value as object,
          category: s.category,
          description: s.description,
        })),
      });

      settings = await prisma.cRMSetting.findMany({
        orderBy: [{ category: "asc" }, { key: "asc" }],
      });
    }

    // Group settings by category
    const groupedSettings: Record<string, typeof settings> = {};
    for (const setting of settings) {
      if (!groupedSettings[setting.category]) {
        groupedSettings[setting.category] = [];
      }
      groupedSettings[setting.category].push(setting);
    }

    return NextResponse.json({
      settings,
      groupedSettings,
      canEdit: access.canEdit,
    });
  } catch (error) {
    console.error("Error fetching CRM settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch CRM settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/crm/settings - Update CRM settings (bulk update)
export async function PATCH(req: NextRequest) {
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

    const access = canAccessCRMSettings(context);
    if (!access.canEdit) {
      return NextResponse.json(
        { error: "You don't have permission to edit CRM settings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { updates } = body; // Array of { key: string, value: unknown }

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    // Get current user for audit log
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // Get old values for audit log
    const keys = updates.map((u: { key: string }) => u.key);
    const oldSettings = await prisma.cRMSetting.findMany({
      where: { key: { in: keys } },
    });
    const oldValueMap = Object.fromEntries(
      oldSettings.map((s) => [s.key, s.value])
    );

    // Update each setting
    const updatedSettings = [];
    for (const update of updates) {
      const { key, value } = update;

      const setting = await prisma.cRMSetting.upsert({
        where: { key },
        update: {
          value: value as object,
          updatedBy: currentUser?.id,
        },
        create: {
          key,
          value: value as object,
          category: DEFAULT_SETTINGS.find((s) => s.key === key)?.category || "custom",
          description: DEFAULT_SETTINGS.find((s) => s.key === key)?.description || null,
          updatedBy: currentUser?.id,
        },
      });

      updatedSettings.push(setting);

      // Create audit log entry
      await prisma.auditLog.create({
        data: {
          userId: currentUser?.id || "unknown",
          userEmail: session.user.email,
          userName: currentUser?.name,
          action: "settings_change",
          entityType: "CRMSetting",
          entityId: setting.id,
          oldValue: { key, value: oldValueMap[key] } as object,
          newValue: { key, value } as object,
          ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
          userAgent: req.headers.get("user-agent"),
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating CRM settings:", error);
    return NextResponse.json(
      { error: "Failed to update CRM settings" },
      { status: 500 }
    );
  }
}
