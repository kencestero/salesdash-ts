"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertCircle, Clock, Download, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function SheetsSyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/sync/sheets", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Sync failed");

      const data = await response.json();
      setLastSync(new Date());

      toast({
        title: "Sync Complete",
        description: `Imported ${data.stats?.newLeads || 0} new leads, updated ${data.stats?.updatedLeads || 0}`,
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with Google Sheets",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Google Sheets Sync</h1>
        <p className="text-muted-foreground mt-2">
          Manage bidirectional synchronization with Google Sheets
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sync Status</span>
            {lastSync && (
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Last synced {lastSync.toLocaleTimeString()}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Synchronize customer data between CRM and Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Button onClick={handleSync} disabled={syncing} size="lg">
              {syncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>

            <div className="text-sm text-muted-foreground">
              <p>Manual sync available for managers and above</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Import from Sheets</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Pulls new leads from Google Sheets into CRM. Detects duplicates by phone/email.
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-5 h-5 text-green-600" />
                <span className="font-medium">Export to Sheets</span>
              </div>
              <p className="text-sm text-muted-foreground">
                CRM changes automatically update Google Sheets in real-time.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Automated Sync Schedule
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="font-medium">Daily Import</span>
                <Badge>8:00 AM UTC</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically imports new leads from Google Sheets every day at 8 AM
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Mapped Fields</h3>
            <div className="grid gap-2 text-sm">
              <div className="grid grid-cols-2 gap-4 p-2 border-b">
                <span className="font-medium">Google Sheets Column</span>
                <span className="font-medium">CRM Field</span>
              </div>
              <div className="grid grid-cols-2 gap-4 p-2">
                <span className="text-muted-foreground">Customer First Name</span>
                <span>First Name</span>
              </div>
              <div className="grid grid-cols-2 gap-4 p-2">
                <span className="text-muted-foreground">Customer Last Name</span>
                <span>Last Name</span>
              </div>
              <div className="grid grid-cols-2 gap-4 p-2">
                <span className="text-muted-foreground">Customer Phone Number</span>
                <span>Phone</span>
              </div>
              <div className="grid grid-cols-2 gap-4 p-2">
                <span className="text-muted-foreground">Email</span>
                <span>Email</span>
              </div>
              <div className="grid grid-cols-2 gap-4 p-2">
                <span className="text-muted-foreground">Rep Full Name</span>
                <span>Sales Rep</span>
              </div>
              <div className="grid grid-cols-2 gap-4 p-2">
                <span className="text-muted-foreground">Assigned Manager</span>
                <span>Manager</span>
              </div>
              <div className="text-sm text-muted-foreground mt-2 p-2">
                + 14 more fields (status, notes, financing, etc.)
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Important Notes</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>CRM is the source of truth - changes here override sheet data</li>
                <li>Duplicate detection uses phone number and email</li>
                <li>Manual sync is instant, automated sync runs daily</li>
                <li>Only managers and above can manually trigger sync</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
