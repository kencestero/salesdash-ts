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
import { Flame, Thermometer, Snowflake, Skull, Save, Lock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface LeadStatusManagerProps {
  customerId: string;
  currentTemperature?: string;
  currentLinkStatus?: string;
  currentApprovalStatus?: string;
  userRole?: string; // "owner", "director", "manager", "salesperson"
  onUpdate?: () => void;
}

export function LeadStatusManager({
  customerId,
  currentTemperature = "warm",
  currentLinkStatus = "not_sent",
  currentApprovalStatus = "status",
  userRole = "salesperson",
  onUpdate,
}: LeadStatusManagerProps) {
  const [temperature, setTemperature] = useState(currentTemperature);
  const [linkStatus, setLinkStatus] = useState(currentLinkStatus);
  const [approvalStatus, setApprovalStatus] = useState(currentApprovalStatus);
  const [saving, setSaving] = useState(false);

  // Only managers and above can edit
  const canEdit = ["owner", "director", "manager"].includes(userRole);

  // Temperature icon and color
  const temperatureConfig: Record<string, { icon: any; color: string; label: string }> = {
    hot: { icon: Flame, color: "bg-red-500 text-white", label: "Hot Lead" },
    warm: { icon: Thermometer, color: "bg-orange-500 text-white", label: "Warm Lead" },
    cold: { icon: Snowflake, color: "bg-blue-500 text-white", label: "Cold Lead" },
    dead: { icon: Skull, color: "bg-gray-500 text-white", label: "No Longer in Market / Dead" },
  };

  // Approval status colors
  const approvalColors: Record<string, string> = {
    status: "bg-gray-500 text-white",
    approved: "bg-green-500 text-white",
    pending: "bg-orange-500 text-white",
    need_docs: "bg-yellow-600 text-white",
    denied: "bg-red-500 text-white",
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

    setSaving(true);
    try {
      const response = await fetch(`/api/crm/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature,
          linkSentStatus: linkStatus,
          approvalStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      toast({
        title: "Success",
        description: "Lead status updated successfully",
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const TempIcon = temperatureConfig[temperature]?.icon || Thermometer;

  return (
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
        {/* Temperature */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Lead Temperature</label>
          <Select
            value={temperature}
            onValueChange={setTemperature}
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
            </SelectContent>
          </Select>
        </div>

        {/* Financing Link Status */}
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
              <SelectItem value="link_sent">Not Applied Yet - Link Sent</SelectItem>
              <SelectItem value="not_sent">No Link Sent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Approval Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Approval Status</label>
          <Select
            value={approvalStatus}
            onValueChange={setApprovalStatus}
            disabled={!canEdit}
          >
            <SelectTrigger>
              <SelectValue>
                <Badge className={approvalColors[approvalStatus]}>
                  {approvalStatus === "status" && "Status (Default)"}
                  {approvalStatus === "approved" && "Approved"}
                  {approvalStatus === "pending" && "Pending"}
                  {approvalStatus === "need_docs" && "Need Stipulations / Documentation"}
                  {approvalStatus === "denied" && "Denied"}
                </Badge>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              <SelectItem value="status">
                <Badge className="bg-gray-500 text-white">Status (Default)</Badge>
              </SelectItem>
              <SelectItem value="approved">
                <Badge className="bg-green-500 text-white">Approved</Badge>
              </SelectItem>
              <SelectItem value="pending">
                <Badge className="bg-orange-500 text-white">Pending</Badge>
              </SelectItem>
              <SelectItem value="need_docs">
                <Badge className="bg-yellow-600 text-white">Need Stipulations / Documentation</Badge>
              </SelectItem>
              <SelectItem value="denied">
                <Badge className="bg-red-500 text-white">Denied</Badge>
              </SelectItem>
            </SelectContent>
          </Select>
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
  );
}
