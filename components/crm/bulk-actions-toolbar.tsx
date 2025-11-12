"use client";

/**
 * Bulk Actions Toolbar
 * Multi-select and bulk operations for leads
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  CheckSquare,
  Trash2,
  UserPlus,
  Tag,
  Download,
  X,
  Loader2,
} from "lucide-react";

interface BulkActionsToolbarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onBulkComplete: () => void;
  availableManagers?: Array<{ id: string; name: string }>;
}

export function BulkActionsToolbar({
  selectedIds,
  onClearSelection,
  onBulkComplete,
  availableManagers = [],
}: BulkActionsToolbarProps) {
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [action, setAction] = useState<string>("");

  async function handleBulkStatusChange(newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/bulk-actions/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerIds: selectedIds,
          status: newStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      const data = await res.json();

      toast({
        title: "Status Updated",
        description: `Updated ${data.updated} lead(s) to ${newStatus}`,
      });

      onBulkComplete();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkReassign(managerId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/bulk-actions/reassign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerIds: selectedIds,
          assignedToId: managerId,
        }),
      });

      if (!res.ok) throw new Error("Failed to reassign leads");

      const data = await res.json();

      toast({
        title: "Leads Reassigned",
        description: `Reassigned ${data.updated} lead(s)`,
      });

      onBulkComplete();
    } catch (error) {
      console.error("Failed to reassign leads:", error);
      toast({
        title: "Error",
        description: "Failed to reassign leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkTag(tag: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/bulk-actions/tag", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerIds: selectedIds,
          tag,
          action: "add",
        }),
      });

      if (!res.ok) throw new Error("Failed to tag leads");

      const data = await res.json();

      toast({
        title: "Tags Added",
        description: `Tagged ${data.updated} lead(s) with "${tag}"`,
      });

      onBulkComplete();
    } catch (error) {
      console.error("Failed to tag leads:", error);
      toast({
        title: "Error",
        description: "Failed to tag leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkExport() {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/bulk-actions/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerIds: selectedIds,
        }),
      });

      if (!res.ok) throw new Error("Failed to export leads");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Complete",
        description: `Exported ${selectedIds.length} lead(s) to CSV`,
      });
    } catch (error) {
      console.error("Failed to export leads:", error);
      toast({
        title: "Error",
        description: "Failed to export leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkDelete() {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/bulk-actions/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerIds: selectedIds,
        }),
      });

      if (!res.ok) throw new Error("Failed to delete leads");

      const data = await res.json();

      toast({
        title: "Leads Deleted",
        description: `Deleted ${data.deleted} lead(s)`,
      });

      setDeleteDialogOpen(false);
      onBulkComplete();
    } catch (error) {
      console.error("Failed to delete leads:", error);
      toast({
        title: "Error",
        description: "Failed to delete leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-card border rounded-lg shadow-lg p-4 flex items-center gap-4 min-w-[600px]">
          {/* Selection Count */}
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <Badge variant="secondary">{selectedIds.length} selected</Badge>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Bulk Actions */}
          <div className="flex items-center gap-2 flex-1">
            {/* Change Status */}
            <Select
              disabled={loading}
              onValueChange={handleBulkStatusChange}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="dead">Dead</SelectItem>
              </SelectContent>
            </Select>

            {/* Reassign */}
            {availableManagers.length > 0 && (
              <Select
                disabled={loading}
                onValueChange={handleBulkReassign}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Reassign To" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {availableManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Add Tag */}
            <Select
              disabled={loading}
              onValueChange={handleBulkTag}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Add Tag" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="hot-lead">Hot Lead</SelectItem>
                <SelectItem value="follow-up">Follow-Up</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>

            {/* Export */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkExport}
              disabled={loading}
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>

            {/* Delete */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={loading}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>

          {/* Clear Selection */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </Button>

          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} Lead(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected leads and all associated activities.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
