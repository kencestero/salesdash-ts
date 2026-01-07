"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface NotificationPreferences {
  id: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  customerAssigned: boolean;
  creditAppUpdates: boolean;
  followUpReminders: boolean;
  duplicateAlerts: boolean;
  statusChanges: boolean;
  systemAnnouncements: boolean;
  tipsAndTricks: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

const defaultPreferences: NotificationPreferences = {
  id: "",
  inAppEnabled: true,
  emailEnabled: true,
  customerAssigned: true,
  creditAppUpdates: true,
  followUpReminders: true,
  duplicateAlerts: true,
  statusChanges: true,
  systemAnnouncements: true,
  tipsAndTricks: true,
  quietHoursEnabled: false,
  quietHoursStart: null,
  quietHoursEnd: null,
};

const notificationTypes = [
  {
    key: "customerAssigned",
    label: "Customer Assigned",
    description: "Get notified when a customer is assigned to you",
    icon: "heroicons:user-plus",
    color: "text-blue-500",
  },
  {
    key: "creditAppUpdates",
    label: "Credit Application Updates",
    description: "Notifications for submitted, approved, or declined credit applications",
    icon: "heroicons:document-text",
    color: "text-green-500",
  },
  {
    key: "followUpReminders",
    label: "Follow-up Reminders",
    description: "Reminders to follow up with customers",
    icon: "heroicons:clock",
    color: "text-yellow-500",
  },
  {
    key: "duplicateAlerts",
    label: "Duplicate Customer Alerts",
    description: "Alert when a potential duplicate customer is detected",
    icon: "heroicons:exclamation-triangle",
    color: "text-orange-500",
  },
  {
    key: "statusChanges",
    label: "Status Changes",
    description: "Notifications when a customer status is changed by a manager",
    icon: "heroicons:arrow-path",
    color: "text-purple-500",
  },
  {
    key: "systemAnnouncements",
    label: "System Announcements",
    description: "Important announcements from Remotive",
    icon: "heroicons:megaphone",
    color: "text-[#E96114]",
  },
  {
    key: "tipsAndTricks",
    label: "Tips & Tricks",
    description: "Helpful tips to improve your sales workflow",
    icon: "heroicons:light-bulb",
    color: "text-cyan-500",
  },
];

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/notifications/preferences");
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || defaultPreferences);
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: string, value: boolean | string | null) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      if (response.ok) {
        toast({
          title: "Settings Updated",
          description: "Your notification preferences have been saved.",
        });
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      setPreferences(preferences);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
      });
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
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon icon="heroicons:bell" className="h-5 w-5 text-[#E96114]" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how and when you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channels Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Notification Channels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Icon icon="heroicons:bell" className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="text-sm font-medium">In-App Notifications</Label>
                  <p className="text-xs text-muted-foreground">Bell icon & toast alerts</p>
                </div>
              </div>
              <Switch
                checked={preferences.inAppEnabled}
                onCheckedChange={(checked) => updatePreference("inAppEnabled", checked)}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Icon icon="heroicons:envelope" className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Important updates to your email</p>
                </div>
              </div>
              <Switch
                checked={preferences.emailEnabled}
                onCheckedChange={(checked) => updatePreference("emailEnabled", checked)}
              />
            </div>
          </div>
        </div>

        {/* Notification Types Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">CRM Notifications</h3>
          <div className="space-y-3">
            {notificationTypes.slice(0, 5).map((type) => (
              <div
                key={type.key}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-opacity-10 ${type.color.replace("text-", "bg-")}/10`}>
                    <Icon icon={type.icon} className={`h-5 w-5 ${type.color}`} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{type.label}</Label>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                <Switch
                  checked={preferences[type.key as keyof NotificationPreferences] as boolean}
                  onCheckedChange={(checked) => updatePreference(type.key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* System Notifications Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">System Notifications</h3>
          <div className="space-y-3">
            {notificationTypes.slice(5).map((type) => (
              <div
                key={type.key}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${type.color.replace("text-", "bg-")}/10`}>
                    <Icon icon={type.icon} className={`h-5 w-5 ${type.color}`} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{type.label}</Label>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                <Switch
                  checked={preferences[type.key as keyof NotificationPreferences] as boolean}
                  onCheckedChange={(checked) => updatePreference(type.key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Hours Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Quiet Hours</h3>
          <div className="p-4 rounded-lg border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-slate-500/10">
                  <Icon icon="heroicons:moon" className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Enable Quiet Hours</Label>
                  <p className="text-xs text-muted-foreground">
                    Pause non-critical notifications during specified hours
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.quietHoursEnabled}
                onCheckedChange={(checked) => updatePreference("quietHoursEnabled", checked)}
              />
            </div>
            {preferences.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Start Time</Label>
                  <Input
                    type="time"
                    value={preferences.quietHoursStart || "22:00"}
                    onChange={(e) => updatePreference("quietHoursStart", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">End Time</Label>
                  <Input
                    type="time"
                    value={preferences.quietHoursEnd || "08:00"}
                    onChange={(e) => updatePreference("quietHoursEnd", e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
