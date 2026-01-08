"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Flame, Thermometer, Snowflake, Skull, Save, Lock, AlertTriangle, UserX } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface LeadStatusManagerProps {
  customerId: string;
  customerName?: string;
  currentTemperature?: string;
  currentLinkStatus?: string;
  currentApprovalStatus?: string;
  // New: separate RTO and Finance approval statuses
  currentRtoApproval?: string;
  currentFinanceApproval?: string;
  assignedManagerId?: string;
  assignedManagerName?: string;
  userRole?: string; // "owner", "director", "manager", "salesperson"
  // BATCH 1: Lost reason fields
  currentLostReason?: string;
  currentLostReasonNotes?: string;
  onUpdate?: () => void;
}

// BATCH 1: Lost reason options
const LOST_REASON_OPTIONS = [
  { value: "price", label: "Price - Too Expensive" },
  { value: "no_credit", label: "No Credit - Not Approved" },
  { value: "bought_elsewhere", label: "Bought Elsewhere" },
  { value: "no_response", label: "No Response - Customer Ghosted" },
  { value: "other", label: "Other (Specify Below)" },
];

// Approval status options for checkboxes
const APPROVAL_STATUSES = [
  { value: "approved", label: "Approved", color: "bg-green-500" },
  { value: "pending", label: "Pending", color: "bg-orange-500" },
  { value: "need_stips", label: "Need Stipulations", color: "bg-yellow-600" },
  { value: "declined", label: "Declined", color: "bg-red-500" },
];

export function LeadStatusManager({
  customerId,
  customerName = "Customer",
  currentTemperature = "warm",
  currentLinkStatus = "not_sent",
  currentApprovalStatus = "status",
  currentRtoApproval,
  currentFinanceApproval,
  assignedManagerId,
  assignedManagerName,
  userRole = "salesperson",
  // BATCH 1: Lost reason props
  currentLostReason,
  currentLostReasonNotes,
  onUpdate,
}: LeadStatusManagerProps) {
  const [temperature, setTemperature] = useState(currentTemperature);
  const [linkStatus, setLinkStatus] = useState(currentLinkStatus);

  // New: Separate approval states for RTO and Finance
  const [rtoApproval, setRtoApproval] = useState<string | null>(currentRtoApproval || null);
  const [financeApproval, setFinanceApproval] = useState<string | null>(currentFinanceApproval || null);

  // BATCH 1: Lost reason state
  const [lostReason, setLostReason] = useState<string>(currentLostReason || "");
  const [lostReasonNotes, setLostReasonNotes] = useState<string>(currentLostReasonNotes || "");

  const [saving, setSaving] = useState(false);

  // Manager review confirmation dialog state
  const [showManagerReviewDialog, setShowManagerReviewDialog] = useState(false);
  const [pendingTemperatureChange, setPendingTemperatureChange] = useState<string | null>(null);

  // Only managers and above can edit
  const canEdit = ["owner", "director", "manager"].includes(userRole);

  // Temperature icon and color
  const temperatureConfig: Record<string, { icon: any; color: string; label: string }> = {
    hot: { icon: Flame, color: "bg-red-500 text-white", label: "Hot Lead" },
    warm: { icon: Thermometer, color: "bg-orange-500 text-white", label: "Warm Lead" },
    cold: { icon: Snowflake, color: "bg-blue-500 text-white", label: "Cold Lead" },
    dead: { icon: Skull, color: "bg-gray-500 text-white", label: "No Longer in Market / Dead" },
    manager_review: { icon: UserX, color: "bg-purple-600 text-white", label: "Customer not responsive, Manager Review" },
  };

  // Handle temperature change - intercept manager_review selection
  const handleTemperatureChange = (value: string) => {
    if (value === "manager_review") {
      // Show confirmation dialog
      setPendingTemperatureChange(value);
      setShowManagerReviewDialog(true);
    } else {
      setTemperature(value);
    }
  };

  // Confirm manager review selection
  const confirmManagerReview = async () => {
    setTemperature("manager_review");
    setShowManagerReviewDialog(false);
    setPendingTemperatureChange(null);

    // Trigger notification to manager
    if (assignedManagerId) {
      try {
        await fetch("/api/crm/notify-manager-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            customerName,
            managerId: assignedManagerId,
            managerName: assignedManagerName,
          }),
        });
        toast({
          title: "Manager Notified",
          description: `${assignedManagerName || "The assigned manager"} has been notified to review this customer.`,
        });
      } catch (error) {
        console.error("Failed to notify manager:", error);
        // Still set the status, just notify about the notification failure
        toast({
          title: "Status Updated",
          description: "Status set to Manager Review, but notification may not have been sent.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Manager Assigned",
        description: "Status set to Manager Review. Note: No manager is assigned to receive the notification.",
        variant: "destructive",
      });
    }
  };

  // Cancel manager review selection
  const cancelManagerReview = () => {
    setShowManagerReviewDialog(false);
    setPendingTemperatureChange(null);
  };

  // Handle RTO approval checkbox change
  const handleRtoApprovalChange = (value: string) => {
    setRtoApproval(rtoApproval === value ? null : value);
  };

  // Handle Finance approval checkbox change
  const handleFinanceApprovalChange = (value: string) => {
    setFinanceApproval(financeApproval === value ? null : value);
  };

  const handleSave = async () => {
    if (!canEdit) {
      toast({
        title: "Permission Denied",
        description: "Only managers and above can edit lead status",
        variant: "destructive",
      });
      return;
    }

    // BATCH 1: Validate lost reason when temperature is dead
    if (temperature === "dead" && !lostReason) {
      toast({
        title: "Lost Reason Required",
        description: "Please select a lost reason when marking lead as dead",
        variant: "destructive",
      });
      return;
    }

    // BATCH 1: Validate notes required when lost reason is "other"
    if (lostReason === "other" && !lostReasonNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide details when selecting 'Other' as the lost reason",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/crm/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature,
          linkSentStatus: linkStatus,
          rtoApprovalStatus: rtoApproval,
          financeApprovalStatus: financeApproval,
          // Keep legacy field for backwards compatibility
          approvalStatus: rtoApproval || financeApproval || "status",
          // BATCH 1: Lost reason fields
          lostReason: temperature === "dead" ? lostReason : null,
          lostReasonNotes: temperature === "dead" && lostReason === "other" ? lostReasonNotes : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update");
      }

      toast({
        title: "Success",
        description: "Lead status updated successfully",
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error("Error updating lead status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update lead status",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const TempIcon = temperatureConfig[temperature]?.icon || Thermometer;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lead Status Management</span>
            {!canEdit && (
              <Badge variant="outline" className="text-muted-foreground">
                <Lock className="w-3 h-3 mr-1" />
                View Only
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lead Status (formerly Temperature) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Lead Status</label>
            <Select
              value={temperature}
              onValueChange={handleTemperatureChange}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Badge className={temperatureConfig[temperature]?.color}>
                      <TempIcon className="w-3 h-3 mr-1" />
                      {temperatureConfig[temperature]?.label}
                    </Badge>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="hot">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-600" />
                    Hot Lead
                  </div>
                </SelectItem>
                <SelectItem value="warm">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-600" />
                    Warm Lead
                  </div>
                </SelectItem>
                <SelectItem value="cold">
                  <div className="flex items-center gap-2">
                    <Snowflake className="w-4 h-4 text-blue-600" />
                    Cold Lead
                  </div>
                </SelectItem>
                <SelectItem value="dead">
                  <div className="flex items-center gap-2">
                    <Skull className="w-4 h-4 text-gray-600" />
                    No Longer in Market / Dead
                  </div>
                </SelectItem>
                <SelectItem value="manager_review">
                  <div className="flex items-center gap-2">
                    <UserX className="w-4 h-4 text-purple-600" />
                    Customer not responsive, Manager Review
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Financing Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Financing Status</label>
            <Select
              value={linkStatus}
              onValueChange={setLinkStatus}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="not_applied">Not Applied Yet</SelectItem>
                <SelectItem value="not_sent">Link not sent yet</SelectItem>
                <SelectItem value="cash_deal">Cash Deal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* BATCH 1: Lost Reason Section (only shows when temperature is dead) */}
          {temperature === "dead" && (
            <div className="space-y-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Skull className="w-4 h-4 text-destructive" />
                Lost Reason <span className="text-destructive">*</span>
              </label>
              <Select
                value={lostReason}
                onValueChange={setLostReason}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {LOST_REASON_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Notes field - shown always when dead, required when "other" */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Lost Reason Notes{" "}
                  {lostReason === "other" && <span className="text-destructive">*</span>}
                </label>
                <Textarea
                  value={lostReasonNotes}
                  onChange={(e) => setLostReasonNotes(e.target.value)}
                  placeholder={
                    lostReason === "other"
                      ? "Please provide details about why this lead was lost..."
                      : "Optional notes about why this lead was lost..."
                  }
                  disabled={!canEdit}
                  className="h-20"
                />
                {lostReason === "other" && !lostReasonNotes.trim() && (
                  <p className="text-xs text-destructive">
                    Notes are required when selecting &quot;Other&quot;
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Approval Status - Split into RTO and Finance sections */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Approval Status</label>

            {/* RTO Approval */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="text-sm font-medium text-muted-foreground">RTO (Rent-To-Own)</div>
              <div className="flex flex-wrap gap-3">
                {APPROVAL_STATUSES.map((status) => (
                  <div key={`rto-${status.value}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rto-${status.value}`}
                      checked={rtoApproval === status.value}
                      onCheckedChange={() => handleRtoApprovalChange(status.value)}
                      disabled={!canEdit}
                    />
                    <Label
                      htmlFor={`rto-${status.value}`}
                      className="text-sm cursor-pointer"
                    >
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Regular Financing Approval */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="text-sm font-medium text-muted-foreground">Regular Financing</div>
              <div className="flex flex-wrap gap-3">
                {APPROVAL_STATUSES.map((status) => (
                  <div key={`finance-${status.value}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`finance-${status.value}`}
                      checked={financeApproval === status.value}
                      onCheckedChange={() => handleFinanceApprovalChange(status.value)}
                      disabled={!canEdit}
                    />
                    <Label
                      htmlFor={`finance-${status.value}`}
                      className="text-sm cursor-pointer"
                    >
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          {canEdit && (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}

          {!canEdit && (
            <p className="text-sm text-muted-foreground text-center">
              Only managers and above can edit lead status
            </p>
          )}
        </CardContent>
      </Card>

      {/* Manager Review Confirmation Dialog */}
      <AlertDialog open={showManagerReviewDialog} onOpenChange={setShowManagerReviewDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Notify Manager for Review?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Setting this status will send a notification to{" "}
                <strong>{assignedManagerName || "the assigned manager"}</strong> requesting
                them to review this customer.
              </p>
              <p className="text-muted-foreground">
                This action indicates the customer is not responding and needs manager
                intervention.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelManagerReview}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmManagerReview}>
              Yes, Notify Manager
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
