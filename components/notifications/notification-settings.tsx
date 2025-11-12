"use client";

/**
 * Notification Settings Component
 * Allows users to configure email and push notification preferences
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Bell, Mail, AlertCircle, TrendingUp, Clock, Loader2 } from "lucide-react";
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isPushNotificationSupported,
  isPushSubscribed,
} from "@/lib/push-notifications";

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyNewLeads: boolean;
  notifyStatusChanges: boolean;
  notifyStaleLeads: boolean;
  notifyDailyDigest: boolean;
}

export function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    notifyNewLeads: true,
    notifyStatusChanges: true,
    notifyStaleLeads: true,
    notifyDailyDigest: true,
  });

  useEffect(() => {
    loadPreferences();
    checkPushSupport();
  }, []);

  async function loadPreferences() {
    try {
      const res = await fetch("/api/notifications/preferences");
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setLoading(false);
    }
  }

  async function checkPushSupport() {
    const supported = isPushNotificationSupported();
    setPushSupported(supported);

    if (supported) {
      const subscribed = await isPushSubscribed();
      setIsPushEnabled(subscribed);
    }
  }

  async function handleEnablePush() {
    try {
      setSaving(true);

      const subscription = await subscribeToPushNotifications();
      if (!subscription) {
        toast({
          title: "Permission Denied",
          description: "Please allow notifications in your browser settings.",
          variant: "destructive",
        });
        return;
      }

      // Save subscription to server
      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (!res.ok) throw new Error("Failed to save subscription");

      setIsPushEnabled(true);
      toast({
        title: "Push Notifications Enabled",
        description: "You'll now receive browser notifications for important updates.",
      });
    } catch (error) {
      console.error("Failed to enable push:", error);
      toast({
        title: "Error",
        description: "Failed to enable push notifications.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDisablePush() {
    try {
      setSaving(true);

      const unsubscribed = await unsubscribeFromPushNotifications();
      if (!unsubscribed) throw new Error("Failed to unsubscribe");

      // Remove subscription from server
      const res = await fetch("/api/notifications/subscribe", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove subscription");

      setIsPushEnabled(false);
      toast({
        title: "Push Notifications Disabled",
        description: "You will no longer receive browser notifications.",
      });
    } catch (error) {
      console.error("Failed to disable push:", error);
      toast({
        title: "Error",
        description: "Failed to disable push notifications.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function updatePreference(key: keyof NotificationPreferences, value: boolean) {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      if (!res.ok) throw new Error("Failed to update preferences");

      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error("Failed to update preferences:", error);
      // Revert on error
      setPreferences(preferences);
      toast({
        title: "Error",
        description: "Failed to save preferences.",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Browser Push Notifications
          </CardTitle>
          <CardDescription>
            Receive real-time notifications in your browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pushSupported ? (
            <div className="text-sm text-muted-foreground">
              Push notifications are not supported in your browser.
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {isPushEnabled ? "Enabled" : "Disabled"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isPushEnabled
                    ? "You're receiving browser notifications"
                    : "Enable to receive instant alerts"}
                </p>
              </div>
              {isPushEnabled ? (
                <Button
                  variant="outline"
                  onClick={handleDisablePush}
                  disabled={saving}
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Disable
                </Button>
              ) : (
                <Button onClick={handleEnablePush} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Enable
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Configure which events trigger email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium">New Lead Assignments</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when a new lead is assigned to you
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifyNewLeads}
              onCheckedChange={(checked) =>
                updatePreference("notifyNewLeads", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Status Changes</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when a lead's status changes
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifyStatusChanges}
              onCheckedChange={(checked) =>
                updatePreference("notifyStatusChanges", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium">Stale Lead Alerts (Managers)</p>
                <p className="text-sm text-muted-foreground">
                  Get notified about leads with no activity for 7+ days
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifyStaleLeads}
              onCheckedChange={(checked) =>
                updatePreference("notifyStaleLeads", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium">Daily Digest (Managers)</p>
                <p className="text-sm text-muted-foreground">
                  Receive a daily summary of team performance
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifyDailyDigest}
              onCheckedChange={(checked) =>
                updatePreference("notifyDailyDigest", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <div>
                <p className="font-medium">All Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Master toggle for all email notifications
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                updatePreference("emailNotifications", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
