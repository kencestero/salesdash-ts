"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";

interface CRMSetting {
  id: string;
  key: string;
  value: unknown;
  category: string;
  description: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

export default function CRMSettingsPage() {
  const [settings, setSettings] = useState<CRMSetting[]>([]);
  const [groupedSettings, setGroupedSettings] = useState<Record<string, CRMSetting[]>>({});
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, unknown>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/crm/settings");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch settings");
      }
      const data = await response.json();
      setSettings(data.settings);
      setGroupedSettings(data.groupedSettings);
      setCanEdit(data.canEdit);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load settings",
        color: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: unknown) => {
    if (!canEdit) return;
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
  };

  const getValue = (setting: CRMSetting) => {
    return pendingChanges[setting.key] !== undefined
      ? pendingChanges[setting.key]
      : setting.value;
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  const saveChanges = async () => {
    if (!hasChanges) return;

    setSaving(true);
    try {
      const updates = Object.entries(pendingChanges).map(([key, value]) => ({
        key,
        value,
      }));

      const response = await fetch("/api/crm/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save settings");
      }

      toast({
        title: "Settings saved",
        description: `${updates.length} setting(s) updated successfully`,
      });

      setPendingChanges({});
      fetchSettings();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        color: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setPendingChanges({});
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CRM Settings</h1>
          <p className="text-muted-foreground">
            Configure assignment rules, SLA thresholds, required fields, and import behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!canEdit && (
            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
              <Icon icon="heroicons:eye" className="mr-1 h-3 w-3" />
              View Only
            </Badge>
          )}
          {hasChanges && (
            <>
              <Button variant="outline" onClick={discardChanges} disabled={saving}>
                Discard
              </Button>
              <Button onClick={saveChanges} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:check" className="mr-2 h-4 w-4" />
                    Save Changes ({Object.keys(pendingChanges).length})
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="assignment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assignment">
            <Icon icon="heroicons:user-group" className="mr-2 h-4 w-4" />
            Assignment
          </TabsTrigger>
          <TabsTrigger value="sla">
            <Icon icon="heroicons:clock" className="mr-2 h-4 w-4" />
            SLA
          </TabsTrigger>
          <TabsTrigger value="required_fields">
            <Icon icon="heroicons:clipboard-document-check" className="mr-2 h-4 w-4" />
            Required Fields
          </TabsTrigger>
          <TabsTrigger value="import">
            <Icon icon="heroicons:arrow-down-tray" className="mr-2 h-4 w-4" />
            Import
          </TabsTrigger>
        </TabsList>

        {/* Assignment Rules */}
        <TabsContent value="assignment">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Rules</CardTitle>
              <CardDescription>
                Control how leads are assigned and who can reassign them
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {groupedSettings["assignment"]?.map((setting) => (
                <SettingRow
                  key={setting.key}
                  setting={setting}
                  value={getValue(setting)}
                  onChange={(value) => handleChange(setting.key, value)}
                  canEdit={canEdit}
                  hasChange={pendingChanges[setting.key] !== undefined}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SLA Settings */}
        <TabsContent value="sla">
          <Card>
            <CardHeader>
              <CardTitle>SLA & Escalation</CardTitle>
              <CardDescription>
                Configure response time targets and escalation rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {groupedSettings["sla"]?.map((setting) => (
                <SettingRow
                  key={setting.key}
                  setting={setting}
                  value={getValue(setting)}
                  onChange={(value) => handleChange(setting.key, value)}
                  canEdit={canEdit}
                  hasChange={pendingChanges[setting.key] !== undefined}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Required Fields */}
        <TabsContent value="required_fields">
          <Card>
            <CardHeader>
              <CardTitle>Required Fields by Status</CardTitle>
              <CardDescription>
                Define which fields are required before advancing to each status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {groupedSettings["required_fields"]?.map((setting) => (
                <SettingRow
                  key={setting.key}
                  setting={setting}
                  value={getValue(setting)}
                  onChange={(value) => handleChange(setting.key, value)}
                  canEdit={canEdit}
                  hasChange={pendingChanges[setting.key] !== undefined}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Settings */}
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import Settings</CardTitle>
              <CardDescription>
                Configure how imported leads are handled, including duplicate detection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {groupedSettings["import"]?.map((setting) => (
                <SettingRow
                  key={setting.key}
                  setting={setting}
                  value={getValue(setting)}
                  onChange={(value) => handleChange(setting.key, value)}
                  canEdit={canEdit}
                  hasChange={pendingChanges[setting.key] !== undefined}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Individual Setting Row Component
function SettingRow({
  setting,
  value,
  onChange,
  canEdit,
  hasChange,
}: {
  setting: CRMSetting;
  value: unknown;
  onChange: (value: unknown) => void;
  canEdit: boolean;
  hasChange: boolean;
}) {
  const renderControl = () => {
    // Boolean settings - use Switch
    if (typeof value === "boolean") {
      return (
        <Switch
          checked={value}
          onCheckedChange={onChange}
          disabled={!canEdit}
        />
      );
    }

    // Number settings - use Input
    if (typeof value === "number") {
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={!canEdit}
          className="w-32"
        />
      );
    }

    // String settings with specific options
    if (setting.key === "dedupe_on_import") {
      return (
        <Select
          value={value as string}
          onValueChange={onChange}
          disabled={!canEdit}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="skip">Skip</SelectItem>
            <SelectItem value="merge">Merge</SelectItem>
            <SelectItem value="create">Create New</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    // Array of strings - use comma-separated input
    if (Array.isArray(value)) {
      return (
        <Input
          value={(value as string[]).join(", ")}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          disabled={!canEdit}
          placeholder="Comma-separated values"
          className="w-64"
        />
      );
    }

    // String settings - use Input
    if (typeof value === "string") {
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!canEdit}
          className="w-64"
        />
      );
    }

    return <span className="text-muted-foreground">Unsupported type</span>;
  };

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Label className="font-medium">
            {formatSettingName(setting.key)}
          </Label>
          {hasChange && (
            <Badge color="secondary" className="text-xs">
              Modified
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {setting.description}
        </p>
      </div>
      <div>{renderControl()}</div>
    </div>
  );
}

// Helper to format setting key to readable name
function formatSettingName(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
