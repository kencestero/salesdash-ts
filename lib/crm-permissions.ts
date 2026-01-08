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
