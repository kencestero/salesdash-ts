"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Bookmark, Plus, Trash2, Star, Globe } from "lucide-react";
import { FilterState } from "./advanced-filters";

interface SavedView {
  id: string;
  name: string;
  filters: FilterState;
  userId: string | null;
  isGlobal: boolean;
  isDefault: boolean;
  createdAt: string;
}

interface SavedViewsSelectProps {
  currentFilters: FilterState;
  onViewSelect: (filters: FilterState) => void;
  onViewClear: () => void;
  userRole?: string;
}

export function SavedViewsSelect({
  currentFilters,
  onViewSelect,
  onViewClear,
  userRole = "salesperson",
}: SavedViewsSelectProps) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedViewId, setSelectedViewId] = useState<string>("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Save dialog state
  const [viewName, setViewName] = useState("");
  const [isGlobal, setIsGlobal] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  const canCreateGlobal = ["owner", "director"].includes(userRole);

  // Fetch saved views
  const fetchViews = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/crm/views");
      if (response.ok) {
        const data = await response.json();
        setViews(data.views || []);

        // If there's a default view and no view is selected, auto-select it
        const defaultView = data.views?.find((v: SavedView) => v.isDefault);
        if (defaultView && !selectedViewId) {
          setSelectedViewId(defaultView.id);
          onViewSelect(defaultView.filters as FilterState);
        }
      }
    } catch (error) {
      console.error("Error fetching views:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViews();
  }, []);

  // Handle view selection
  const handleViewChange = (viewId: string) => {
    if (viewId === "all") {
      setSelectedViewId("");
      onViewClear();
      return;
    }

    if (viewId === "save") {
      setShowSaveDialog(true);
      return;
    }

    const view = views.find((v) => v.id === viewId);
    if (view) {
      setSelectedViewId(viewId);
      onViewSelect(view.filters as FilterState);
    }
  };

  // Save current filters as a new view
  const handleSaveView = async () => {
    if (!viewName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a view name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/crm/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: viewName,
          filters: currentFilters,
          isGlobal,
          isDefault,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save view");
      }

      toast({
        title: "Success",
        description: `View "${viewName}" saved successfully`,
      });

      // Reset and close dialog
      setViewName("");
      setIsGlobal(false);
      setIsDefault(false);
      setShowSaveDialog(false);

      // Refresh views
      fetchViews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save view",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete a view
  const handleDeleteView = async (viewId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this view?")) {
      return;
    }

    try {
      const response = await fetch(`/api/crm/views/${viewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete view");
      }

      toast({
        title: "Success",
        description: "View deleted successfully",
      });

      if (selectedViewId === viewId) {
        setSelectedViewId("");
        onViewClear();
      }

      fetchViews();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete view",
        variant: "destructive",
      });
    }
  };

  // Separate views into global and personal
  const globalViews = views.filter((v) => v.isGlobal);
  const personalViews = views.filter((v) => !v.isGlobal);

  return (
    <>
      <div className="flex items-center gap-2">
        <Select value={selectedViewId || "all"} onValueChange={handleViewChange}>
          <SelectTrigger className="w-[200px]">
            <Bookmark className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Select view..." />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value="all">All Customers</SelectItem>

            {personalViews.length > 0 && (
              <SelectGroup>
                <SelectLabel className="text-muted-foreground">
                  My Views
                </SelectLabel>
                {personalViews.map((view) => (
                  <SelectItem key={view.id} value={view.id}>
                    <div className="flex items-center gap-2 w-full">
                      <span className="flex-1">{view.name}</span>
                      {view.isDefault && (
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}

            {globalViews.length > 0 && (
              <SelectGroup>
                <SelectLabel className="text-muted-foreground">
                  <Globe className="w-3 h-3 inline mr-1" />
                  Shared Views
                </SelectLabel>
                {globalViews.map((view) => (
                  <SelectItem key={view.id} value={view.id}>
                    {view.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}

            <SelectGroup>
              <SelectItem value="save" className="text-orange-600">
                <Plus className="w-4 h-4 mr-2 inline" />
                Save Current Filters...
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Save View Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save View</DialogTitle>
            <DialogDescription>
              Save the current filters as a reusable view
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="viewName">View Name</Label>
              <Input
                id="viewName"
                placeholder="e.g., Hot Leads - No Contact"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(checked as boolean)}
              />
              <Label htmlFor="isDefault" className="text-sm font-normal">
                Set as my default view
              </Label>
            </div>

            {canCreateGlobal && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isGlobal"
                  checked={isGlobal}
                  onCheckedChange={(checked) => setIsGlobal(checked as boolean)}
                />
                <Label htmlFor="isGlobal" className="text-sm font-normal">
                  <Globe className="w-3 h-3 inline mr-1" />
                  Share with all users (global view)
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveView} disabled={saving}>
              {saving ? "Saving..." : "Save View"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Default views to seed (can be used in a seed script)
export const DEFAULT_SAVED_VIEWS = [
  {
    name: "Unassigned New Leads",
    filters: {
      unassignedOnly: true,
      statuses: ["new"],
    },
    isGlobal: true,
  },
  {
    name: "Hot Leads - No Contact",
    filters: {
      temperatures: ["hot"],
      neverContacted: true,
    },
    isGlobal: true,
  },
  {
    name: "Follow-up Overdue",
    filters: {
      followUpOverdue: true,
    },
    isGlobal: true,
  },
  {
    name: "Won This Month",
    filters: {
      statuses: ["won"],
    },
    isGlobal: true,
  },
  {
    name: "Dead Leads",
    filters: {
      statuses: ["dead"],
    },
    isGlobal: true,
  },
];
