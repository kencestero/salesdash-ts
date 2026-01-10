/**
 * CRM Permission System
 *
 * Role-based access control for Customer/Lead management
 * Implements VinSolutions-level permission matrix
 */

import { prisma } from "@/lib/prisma";

export type CRMAction =
  | "view"           // View customer details
  | "create"         // Create new customer
  | "edit"           // Edit customer info
  | "delete"         // Delete customer
  | "reassign"       // Change assigned rep/manager
  | "view_all_notes" // View private notes
  | "edit_notes"     // Edit notes
  | "export"         // Export customer data
  | "bulk_actions";  // Bulk operations

export type UserRole = "owner" | "director" | "manager" | "salesperson";

export interface PermissionContext {
  userId: string;
  userEmail: string;
  role: UserRole;
  canAdminCRM: boolean; // CRM Admin: can view all, manage imports, settings, audit logs
  managerId?: string | null;
  teamMemberIds?: string[]; // For managers - their team's user IDs
}

export interface CRMPermissionCheck {
  allowed: boolean;
  reason?: string;
}

/**
 * Main permission checker
 */
export async function checkCRMPermission(
  context: PermissionContext,
  action: CRMAction,
  customerId?: string
): Promise<CRMPermissionCheck> {
  // Owners can do ANYTHING
  if (context.role === "owner") {
    return { allowed: true };
  }

  // Directors can do ALMOST anything
  if (context.role === "director") {
    // Directors can't delete customers (only owners can)
    if (action === "delete") {
      return { allowed: false, reason: "Only owners can delete customers" };
    }
    return { allowed: true };
  }

  // CRM Admins can view ALL customers, edit, reassign, and do bulk actions
  // They can also delete (like owners) for intake management
  if (context.canAdminCRM) {
    return { allowed: true };
  }

  // Managers have team-scoped permissions
  if (context.role === "manager") {
    return checkManagerPermission(context, action, customerId);
  }

  // Salespeople have limited permissions
  if (context.role === "salesperson") {
    return checkSalespersonPermission(context, action, customerId);
  }

  return { allowed: false, reason: "Invalid role" };
}

/**
 * Manager permission logic
 */
async function checkManagerPermission(
  context: PermissionContext,
  action: CRMAction,
  customerId?: string
): Promise<CRMPermissionCheck> {
  switch (action) {
    case "view":
      // Managers can view all leads assigned to their team
      if (!customerId) return { allowed: true }; // Viewing list

      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { assignedToId: true },
      });

      if (!customer) {
        return { allowed: false, reason: "Customer not found" };
      }

      // Check if customer is assigned to someone on their team
      if (context.teamMemberIds?.includes(customer.assignedToId || "")) {
        return { allowed: true };
      }

      return { allowed: false, reason: "Customer not on your team" };

    case "create":
      return { allowed: true }; // Managers can create leads

    case "edit":
      // Can edit team members' leads
      if (!customerId) return { allowed: false, reason: "Customer ID required" };

      const editCustomer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { assignedToId: true },
      });

      if (!editCustomer) {
        return { allowed: false, reason: "Customer not found" };
      }

      if (context.teamMemberIds?.includes(editCustomer.assignedToId || "")) {
        return { allowed: true };
      }

      return { allowed: false, reason: "Can only edit leads assigned to your team" };

    case "delete":
      // Managers can only delete leads from their own team
      if (!customerId) return { allowed: false, reason: "Customer ID required" };

      const deleteCustomer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { assignedToId: true },
      });

      if (!deleteCustomer) {
        return { allowed: false, reason: "Customer not found" };
      }

      if (context.teamMemberIds?.includes(deleteCustomer.assignedToId || "")) {
        return { allowed: true };
      }

      return { allowed: false, reason: "Can only delete leads from your team" };

    case "reassign":
      // Managers can reassign leads ONLY within their own team
      if (!customerId) return { allowed: false, reason: "Customer ID required" };

      const reassignCustomer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { assignedToId: true },
      });

      if (!reassignCustomer) {
        return { allowed: false, reason: "Customer not found" };
      }

      if (context.teamMemberIds?.includes(reassignCustomer.assignedToId || "")) {
        return { allowed: true };
      }

      return { allowed: false, reason: "Can only reassign leads within your team" };

    case "view_all_notes":
      // Managers can view all notes for their team's leads
      return { allowed: true };

    case "edit_notes":
      return { allowed: true };

    case "export":
      return { allowed: true }; // Managers can export their team's data

    case "bulk_actions":
      return { allowed: true }; // Managers can do bulk actions on their team

    default:
      return { allowed: false, reason: "Unknown action" };
  }
}

/**
 * Salesperson permission logic
 */
async function checkSalespersonPermission(
  context: PermissionContext,
  action: CRMAction,
  customerId?: string
): Promise<CRMPermissionCheck> {
  switch (action) {
    case "view":
      // Salespeople can only view their own leads
      if (!customerId) {
        // Viewing list - will be filtered to their own leads
        return { allowed: true };
      }

      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { assignedToId: true },
      });

      if (!customer) {
        return { allowed: false, reason: "Customer not found" };
      }

      if (customer.assignedToId === context.userId) {
        return { allowed: true };
      }

      return { allowed: false, reason: "You can only view your own leads" };

    case "create":
      return { allowed: true }; // Salespeople can create leads

    case "edit":
      // Can only edit their own leads
      if (!customerId) return { allowed: false, reason: "Customer ID required" };

      const editCustomer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { assignedToId: true },
      });

      if (!editCustomer) {
        return { allowed: false, reason: "Customer not found" };
      }

      if (editCustomer.assignedToId === context.userId) {
        return { allowed: true };
      }

      return { allowed: false, reason: "You can only edit your own leads" };

    case "delete":
      return { allowed: false, reason: "Salespeople cannot delete leads" };

    case "reassign":
      return { allowed: false, reason: "Salespeople cannot reassign leads" };

    case "view_all_notes":
      // Salespeople can only view notes on their own leads
      if (!customerId) return { allowed: false, reason: "Customer ID required" };

      const notesCustomer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { assignedToId: true },
      });

      if (!notesCustomer) {
        return { allowed: false, reason: "Customer not found" };
      }

      if (notesCustomer.assignedToId === context.userId) {
        return { allowed: true };
      }

      return { allowed: false, reason: "You can only view notes on your own leads" };

    case "edit_notes":
      return { allowed: true }; // Can add notes to their own leads

    case "export":
      return { allowed: false, reason: "Salespeople cannot export data" };

    case "bulk_actions":
      return { allowed: false, reason: "Salespeople cannot perform bulk actions" };

    default:
      return { allowed: false, reason: "Unknown action" };
  }
}

/**
 * Build permission context from user session
 */
export async function buildPermissionContext(userEmail: string): Promise<PermissionContext | null> {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      profile: {
        select: {
          role: true,
          managerId: true,
          canAdminCRM: true,
        },
      },
    },
  });

  if (!user || !user.profile) {
    return null;
  }

  const context: PermissionContext = {
    userId: user.id,
    userEmail: user.email!,
    role: user.profile.role as UserRole,
    canAdminCRM: user.profile.canAdminCRM ?? false,
    managerId: user.profile.managerId,
  };

  // If user is a manager, load their team member IDs
  if (user.profile.role === "manager") {
    const teamMembers = await prisma.userProfile.findMany({
      where: { managerId: user.id },
      select: { userId: true },
    });
    context.teamMemberIds = teamMembers.map(tm => tm.userId);
  }

  return context;
}

/**
 * Apply permission filter to Prisma query
 */
export function applyPermissionFilter(
  context: PermissionContext
): any {
  // Owners and Directors see everything
  if (context.role === "owner" || context.role === "director") {
    return {};
  }

  // CRM Admins see everything (full visibility for intake/policing)
  if (context.canAdminCRM) {
    return {};
  }

  // Managers see their team's leads
  if (context.role === "manager") {
    return {
      assignedToId: {
        in: context.teamMemberIds || [],
      },
    };
  }

  // Salespeople see only their own leads
  if (context.role === "salesperson") {
    return {
      assignedToId: context.userId,
    };
  }

  // Fallback: show nothing
  return {
    id: "IMPOSSIBLE_ID", // Will match nothing
  };
}

/**
 * Validate reassignment is allowed
 */
export async function canReassignTo(
  context: PermissionContext,
  customerId: string,
  newAssignedToId: string
): Promise<CRMPermissionCheck> {
  // Check if user has reassign permission
  const canReassign = await checkCRMPermission(context, "reassign", customerId);
  if (!canReassign.allowed) {
    return canReassign;
  }

  // For managers, ensure they're reassigning within their team
  if (context.role === "manager") {
    if (!context.teamMemberIds?.includes(newAssignedToId)) {
      return {
        allowed: false,
        reason: "You can only reassign leads to members of your team",
      };
    }
  }

  return { allowed: true };
}

/**
 * Check if user can access CRM Settings page
 * Owner + CRM Admin can edit, Director can view only
 */
export function canAccessCRMSettings(context: PermissionContext): { canView: boolean; canEdit: boolean } {
  // Owners can view and edit
  if (context.role === "owner") {
    return { canView: true, canEdit: true };
  }

  // CRM Admins can view and edit
  if (context.canAdminCRM) {
    return { canView: true, canEdit: true };
  }

  // Directors can view only
  if (context.role === "director") {
    return { canView: true, canEdit: false };
  }

  // Others cannot access
  return { canView: false, canEdit: false };
}

/**
 * Check if user can access Audit Log
 * Owner, Director, and CRM Admin can view
 */
export function canAccessAuditLog(context: PermissionContext): boolean {
  return (
    context.role === "owner" ||
    context.role === "director" ||
    context.canAdminCRM
  );
}

/**
 * Check if user can manage imports
 * Owner, Director, and CRM Admin can manage
 */
export function canManageImports(context: PermissionContext): boolean {
  return (
    context.role === "owner" ||
    context.role === "director" ||
    context.canAdminCRM
  );
}

/**
 * Check if user has full CRM visibility (can see all leads)
 */
export function hasFullCRMVisibility(context: PermissionContext): boolean {
  return (
    context.role === "owner" ||
    context.role === "director" ||
    context.canAdminCRM
  );
}

// ============================================
// CRM Settings Helpers (Cached)
// ============================================

/**
 * Parsed CRM Settings for enforcement
 */
export interface CRMSettingsData {
  // Assignment Rules
  require_rep_for_contacted: boolean;
  require_rep_for_qualified: boolean;
  lock_reassignment: boolean;
  steal_protection: boolean;

  // SLA
  sla_new_lead_seconds: number;
  escalation_enabled: boolean;
  escalation_minutes: number;
  escalation_chain: string[];
  notification_channels: string[];

  // Required Fields
  required_for_qualified: string[];
  required_for_applied: string[];
  required_for_won: string[];
  require_lost_reason: boolean;

  // Import Settings
  dedupe_on_import: "skip" | "merge" | "create";
  dedupe_match_fields: string[];
  default_lead_source: string;
  auto_lock_duplicates: boolean;
}

// Default settings values
const DEFAULT_CRM_SETTINGS: CRMSettingsData = {
  require_rep_for_contacted: false,
  require_rep_for_qualified: true,
  lock_reassignment: false,
  steal_protection: true,
  sla_new_lead_seconds: 90,
  escalation_enabled: true,
  escalation_minutes: 5,
  escalation_chain: ["manager", "director"],
  notification_channels: ["in_app", "email"],
  required_for_qualified: ["phone", "email"],
  required_for_applied: ["trailerType", "financingType"],
  required_for_won: ["trailerSize", "stockNumber"],
  require_lost_reason: true,
  dedupe_on_import: "skip",
  dedupe_match_fields: ["email", "phone"],
  default_lead_source: "Google Sheets",
  auto_lock_duplicates: true,
};

// Cache for CRM settings (5 minute TTL)
let settingsCache: CRMSettingsData | null = null;
let settingsCacheExpiry: number = 0;
const SETTINGS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get CRM settings from database with caching
 * TTL: 5 minutes
 */
export async function getCRMSettings(): Promise<CRMSettingsData> {
  const now = Date.now();

  // Return cached settings if still valid
  if (settingsCache && now < settingsCacheExpiry) {
    return settingsCache;
  }

  // Fetch from database
  const dbSettings = await prisma.cRMSetting.findMany();

  // Build settings object from database values or defaults
  const settings: CRMSettingsData = { ...DEFAULT_CRM_SETTINGS };

  for (const setting of dbSettings) {
    const key = setting.key as keyof CRMSettingsData;
    if (key in settings) {
      // Type-safe assignment based on expected type
      const value = setting.value;
      if (typeof value === "boolean" && typeof settings[key] === "boolean") {
        (settings as any)[key] = value;
      } else if (typeof value === "number" && typeof settings[key] === "number") {
        (settings as any)[key] = value;
      } else if (typeof value === "string" && typeof settings[key] === "string") {
        (settings as any)[key] = value;
      } else if (Array.isArray(value) && Array.isArray(settings[key])) {
        (settings as any)[key] = value;
      }
    }
  }

  // Update cache
  settingsCache = settings;
  settingsCacheExpiry = now + SETTINGS_CACHE_TTL_MS;

  return settings;
}

/**
 * Invalidate settings cache (call after settings update)
 */
export function invalidateCRMSettingsCache(): void {
  settingsCache = null;
  settingsCacheExpiry = 0;
}

/**
 * Check if a status transition requires an assigned rep
 */
export async function requiresRepForStatus(newStatus: string): Promise<boolean> {
  const settings = await getCRMSettings();

  if (newStatus === "Contacted" && settings.require_rep_for_contacted) {
    return true;
  }
  if (newStatus === "Qualified" && settings.require_rep_for_qualified) {
    return true;
  }

  return false;
}

/**
 * Get required fields for a specific status
 */
export async function getRequiredFieldsForStatus(status: string): Promise<string[]> {
  const settings = await getCRMSettings();

  switch (status) {
    case "Qualified":
      return settings.required_for_qualified;
    case "Applied":
      return settings.required_for_applied;
    case "Won":
      return settings.required_for_won;
    default:
      return [];
  }
}

/**
 * Validate a status change against CRM settings
 * Returns { valid: true } or { valid: false, error: string }
 */
export async function validateStatusChange(
  customer: {
    assignedToId: string | null;
    phone: string | null;
    email: string | null;
    trailerType: string | null;
    financingType: string | null;
    trailerSize: string | null;
    stockNumber: string | null;
    lostReason: string | null;
  },
  newStatus: string,
  lostReason?: string | null
): Promise<{ valid: boolean; error?: string }> {
  const settings = await getCRMSettings();

  // Check rep assignment requirement
  if (await requiresRepForStatus(newStatus)) {
    if (!customer.assignedToId) {
      return {
        valid: false,
        error: `A rep must be assigned before marking as ${newStatus}`,
      };
    }
  }

  // Check required fields
  const requiredFields = await getRequiredFieldsForStatus(newStatus);
  const fieldValues: Record<string, string | null> = {
    phone: customer.phone,
    email: customer.email,
    trailerType: customer.trailerType,
    financingType: customer.financingType,
    trailerSize: customer.trailerSize,
    stockNumber: customer.stockNumber,
  };

  for (const field of requiredFields) {
    if (!fieldValues[field]) {
      const friendlyName = field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      return {
        valid: false,
        error: `${friendlyName} is required before marking as ${newStatus}`,
      };
    }
  }

  // Check lost reason requirement
  if (newStatus === "Dead" && settings.require_lost_reason) {
    if (!lostReason && !customer.lostReason) {
      return {
        valid: false,
        error: "A lost reason is required when marking as Dead",
      };
    }
  }

  return { valid: true };
}

/**
 * Calculate responseTime in minutes if this is the first contact
 * Returns the responseTime value to set, or undefined if already contacted
 */
export async function calculateResponseTimeOnFirstContact(
  customerId: string
): Promise<number | undefined> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { createdAt: true, lastContactedAt: true, responseTime: true },
  });

  if (!customer) return undefined;

  // Already has responseTime calculated
  if (customer.responseTime !== null) return undefined;

  // Already contacted but no responseTime (legacy data) - calculate now
  if (customer.lastContactedAt !== null && customer.responseTime === null) {
    const diffMs = customer.lastContactedAt.getTime() - customer.createdAt.getTime();
    return Math.round(diffMs / (1000 * 60)); // minutes
  }

  // This is the FIRST contact - calculate responseTime from now
  const diffMs = Date.now() - customer.createdAt.getTime();
  return Math.round(diffMs / (1000 * 60)); // minutes
}
