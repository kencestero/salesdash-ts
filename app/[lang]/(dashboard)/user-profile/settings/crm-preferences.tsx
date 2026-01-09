"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Save } from "lucide-react";

interface CRMPreferences {
  defaultViewId: string | null;
  defaultSort: "newest" | "oldest" | "priority" | "lastActivity";
  followUpDays: number;
  overdueReminders: boolean;
  emailSignature: string;
  fromNameFormat: "name" | "nameCompany";
}

interface SavedView {
  id: string;
  name: string;
  isGlobal: boolean;
  isDefault: boolean;
}

const defaultPreferences: CRMPreferences = {
  defaultViewId: null,
  defaultSort: "newest",
  followUpDays: 2,
  overdueReminders: true,
  emailSignature: "",
  fromNameFormat: "nameCompany",
};

const sortOptions = [
  { value: "newest", label: "Newest First", description: "Show newest leads at the top" },
  { value: "oldest", label: "Oldest First", description: "Show oldest leads at the top" },
  { value: "priority", label: "Priority", description: "Sort by lead priority/temperature" },
  { value: "lastActivity", label: "Last Activity", description: "Sort by most recent activity" },
];

const followUpOptions = [
  { value: 1, label: "1 day" },
  { value: 2, label: "2 days" },
  { value: 3, label: "3 days" },
  { value: 5, label: "5 days" },
  { value: 7, label: "1 week" },
  { value: 14, label: "2 weeks" },
];

export default function CRMPreferencesSettings() {
  const [preferences, setPreferences] = useState<CRMPreferences>(defaultPreferences);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch preferences and saved views in parallel
      const [prefsRes, viewsRes] = await Promise.all([
        fetch("/api/user/crm-preferences"),
        fetch("/api/crm/views"),
      ]);

      if (prefsRes.ok) {
        const prefsData = await prefsRes.json();
        setPreferences(prefsData.preferences || defaultPreferences);
      }

      if (viewsRes.ok) {
        const viewsData = await viewsRes.json();
        setSavedViews(viewsData.views || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = <K extends keyof CRMPreferences>(
    key: K,
    value: CRMPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/crm-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Your CRM preferences have been updated.",
        });
        setHasChanges(false);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        color: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-t-none pt-6">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-t-none pt-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon icon="heroicons:adjustments-horizontal" className="h-5 w-5 text-[#E96114]" />
              CRM Preferences
            </CardTitle>
            <CardDescription>
              Customize your CRM experience with personal preferences
            </CardDescription>
          </div>
          {hasChanges && (
            <Button onClick={savePreferences} disabled={saving} size="sm">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default CRM View */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Icon icon="heroicons:bookmark" className="h-4 w-4 text-blue-500" />
            Default CRM View
          </h3>
          <div className="p-4 rounded-lg border bg-card">
            <div className="space-y-3">
              <Label className="text-sm font-medium">When you open the CRM, show:</Label>
              <Select
                value={preferences.defaultViewId || "all"}
                onValueChange={(value) =>
                  updatePreference("defaultViewId", value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a default view..." />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="all">All Customers (No filter)</SelectItem>
                  {savedViews.map((view) => (
                    <SelectItem key={view.id} value={view.id}>
                      {view.name}
                      {view.isGlobal && " (Shared)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose which saved view loads automatically when you open the CRM
              </p>
            </div>
          </div>
        </div>

        {/* Default Sorting */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Icon icon="heroicons:arrows-up-down" className="h-4 w-4 text-purple-500" />
            Default Sorting
          </h3>
          <div className="p-4 rounded-lg border bg-card">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Sort customers by:</Label>
              <Select
                value={preferences.defaultSort}
                onValueChange={(value) =>
                  updatePreference("defaultSort", value as CRMPreferences["defaultSort"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          - {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Follow-up Defaults */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Icon icon="heroicons:clock" className="h-4 w-4 text-yellow-500" />
            Follow-up Defaults
          </h3>
          <div className="p-4 rounded-lg border bg-card space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Default follow-up time after contact:
              </Label>
              <Select
                value={String(preferences.followUpDays)}
                onValueChange={(value) =>
                  updatePreference("followUpDays", Number(value))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {followUpOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                When you log a contact, this will be the default for the next follow-up date
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-500/10">
                  <Icon icon="heroicons:bell-alert" className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Overdue Follow-up Reminders</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when follow-ups are overdue
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.overdueReminders}
                onCheckedChange={(checked) =>
                  updatePreference("overdueReminders", checked)
                }
              />
            </div>
          </div>
        </div>

        {/* Email Signature */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Icon icon="heroicons:envelope" className="h-4 w-4 text-green-500" />
            Email Signature
          </h3>
          <div className="p-4 rounded-lg border bg-card space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Your email signature:</Label>
              <Textarea
                value={preferences.emailSignature}
                onChange={(e) => updatePreference("emailSignature", e.target.value)}
                placeholder={`Best regards,\n\nJohn Smith\nSales Representative\nRemotive Logistics\n(555) 123-4567`}
                className="min-h-[120px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                This signature will be appended to outbound CRM emails
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <Label className="text-sm font-medium">From name format:</Label>
              <Select
                value={preferences.fromNameFormat}
                onValueChange={(value) =>
                  updatePreference("fromNameFormat", value as CRMPreferences["fromNameFormat"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="name">Your Name Only</SelectItem>
                  <SelectItem value="nameCompany">Your Name (Remotive Logistics)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How your name appears in the "From" field of emails you send
              </p>
            </div>
          </div>
        </div>

        {/* Save Button (shown at bottom if changes exist) */}
        {hasChanges && (
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={savePreferences} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
