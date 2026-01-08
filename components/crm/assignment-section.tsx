"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Save, Users, UserCheck, ArrowRightLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  profile: {
    role: string;
    managerId?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

interface AssignmentSectionProps {
  customerId: string;
  currentAssignedToId?: string | null;
  currentAssignedToName?: string | null;
  currentManagerId?: string | null;
  currentManagerName?: string | null;
  currentAssignmentMethod?: string | null;
  userRole?: string; // "owner", "director", "manager", "salesperson"
  currentUserId?: string;
  teamMemberIds?: string[]; // For managers - their team member IDs
  onUpdate?: () => void;
}

// Assignment method badge colors
const methodColors: Record<string, string> = {
  repCode: "bg-blue-500",
  intake: "bg-purple-500",
  manual: "bg-gray-500",
  bulk_reassign: "bg-amber-500",
};

const methodLabels: Record<string, string> = {
  repCode: "Rep Code",
  intake: "Intake",
  manual: "Manual",
  bulk_reassign: "Bulk Reassign",
};

export function AssignmentSection({
  customerId,
  currentAssignedToId,
  currentAssignedToName,
  currentManagerId,
  currentManagerName,
  currentAssignmentMethod,
  userRole = "salesperson",
  currentUserId,
  teamMemberIds = [],
  onUpdate,
}: AssignmentSectionProps) {
  const [assignedToId, setAssignedToId] = useState(currentAssignedToId || "");
  const [managerId, setManagerId] = useState(currentManagerId || "");
  const [managerName, setManagerName] = useState(currentManagerName || "");
  const [reassignReason, setReassignReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine permissions
  const isOwnerOrDirector = ["owner", "director"].includes(userRole);
  const isManager = userRole === "manager";
  const isSalesperson = userRole === "salesperson";
  const canEdit = isOwnerOrDirector || isManager;

  // Fetch users for dropdown
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/users?includeSelf=true");
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Filter users based on role
  const availableReps = users.filter((user) => {
    // Owner/Director can assign to anyone
    if (isOwnerOrDirector) return true;
    // Manager can only assign to their team members
    if (isManager) {
      return teamMemberIds.includes(user.id) || user.id === currentUserId;
    }
    return false;
  });

  // When rep changes, auto-populate manager
  const handleRepChange = async (newRepId: string) => {
    setAssignedToId(newRepId);

    // Find the selected rep's manager from the user data
    const selectedRep = users.find((u) => u.id === newRepId);
    if (selectedRep?.profile?.managerId) {
      setManagerId(selectedRep.profile.managerId);
      // Find manager's name
      const manager = users.find((u) => u.id === selectedRep.profile?.managerId);
      if (manager) {
        setManagerName(manager.name || manager.email || "");
      }
    } else {
      // If no manager, try to keep existing or clear
      setManagerId("");
      setManagerName("");
    }
  };

  const handleSave = async () => {
    if (!canEdit) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to reassign leads",
        color: "destructive",
      });
      return;
    }

    // Check if anything changed
    if (assignedToId === currentAssignedToId && managerId === currentManagerId) {
      toast({
        title: "No Changes",
        description: "No assignment changes to save",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/crm/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedToId: assignedToId || null,
          managerId: managerId || null,
          reassignReason: reassignReason || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update assignment");
      }

      toast({
        title: "Success",
        description: "Lead assignment updated successfully",
      });

      setReassignReason(""); // Clear reason after save

      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update lead assignment",
        color: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Get display name for a user ID
  const getUserDisplayName = (userId: string | null | undefined) => {
    if (!userId) return "Unassigned";
    const user = users.find((u) => u.id === userId);
    if (user) {
      return user.name || user.email || "Unknown";
    }
    // Fallback to passed-in names if user not found in list
    if (userId === currentAssignedToId) return currentAssignedToName || "Unknown";
    if (userId === currentManagerId) return currentManagerName || "Unknown";
    return "Unknown";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Lead Assignment
          </span>
          <div className="flex items-center gap-2">
            {currentAssignmentMethod && (
              <Badge className={methodColors[currentAssignmentMethod] || "bg-gray-500"}>
                {methodLabels[currentAssignmentMethod] || currentAssignmentMethod}
              </Badge>
            )}
            {!canEdit && (
              <Badge variant="outline" className="text-muted-foreground">
                <Lock className="w-3 h-3 mr-1" />
                View Only
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sales Rep Assignment */}
        <div className="space-y-2">
          <Label htmlFor="assignedTo">Sales Rep</Label>
          {canEdit ? (
            <Select
              value={assignedToId}
              onValueChange={handleRepChange}
              disabled={loading}
            >
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder="Select sales rep...">
                  {assignedToId ? (
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-500" />
                      {getUserDisplayName(assignedToId)}
                    </div>
                  ) : (
                    "Select sales rep..."
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="">
                  <span className="text-muted-foreground">Unassigned</span>
                </SelectItem>
                {availableReps.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <span>{user.name || user.email}</span>
                      <Badge variant="outline" className="text-xs">
                        {user.profile?.role || "user"}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <UserCheck className="w-4 h-4 text-green-500" />
              <span>{currentAssignedToName || "Unassigned"}</span>
            </div>
          )}
        </div>

        {/* Manager Display */}
        <div className="space-y-2">
          <Label>Manager</Label>
          <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
            {canEdit ? (
              <>
                {managerName || getUserDisplayName(managerId) || "Auto-assigned from rep"}
                <span className="text-xs ml-2">(Auto-populated when rep is selected)</span>
              </>
            ) : (
              currentManagerName || "Not assigned"
            )}
          </div>
        </div>

        {/* Reassignment Reason (only for editors) */}
        {canEdit && (
          <div className="space-y-2">
            <Label htmlFor="reason">Reassignment Reason (optional)</Label>
            <Textarea
              id="reason"
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              placeholder="Enter reason for reassignment..."
              className="h-20"
            />
          </div>
        )}

        {/* Save Button */}
        {canEdit && (
          <Button
            onClick={handleSave}
            disabled={saving || (assignedToId === currentAssignedToId && managerId === currentManagerId)}
            className="w-full"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Update Assignment"}
          </Button>
        )}

        {/* Permission info for salespeople */}
        {isSalesperson && (
          <p className="text-sm text-muted-foreground text-center">
            Only managers and above can reassign leads
          </p>
        )}

        {/* Team restriction info for managers */}
        {isManager && (
          <p className="text-xs text-muted-foreground text-center">
            You can only assign leads to members of your team
          </p>
        )}
      </CardContent>
    </Card>
  );
}
