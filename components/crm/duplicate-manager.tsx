"use client";

/**
 * Duplicate Manager Component
 * Detects and merges duplicate lead records
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
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
import { Search, GitMerge, AlertTriangle, CheckCircle2, Loader2, Mail, Phone, Calendar } from "lucide-react";

interface DuplicateGroup {
  matchType: "exact-email" | "exact-phone" | "similar-name";
  confidence: "high" | "medium" | "low";
  leads: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    createdAt: string;
    leadScore: number;
    status: string;
  }>;
}

export function DuplicateManager() {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<string>("");
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);

  async function scanForDuplicates() {
    setScanning(true);
    try {
      const res = await fetch("/api/crm/duplicates/find");
      if (!res.ok) throw new Error("Failed to scan for duplicates");

      const data = await res.json();
      setDuplicateGroups(data.duplicateGroups);

      toast({
        title: "Scan Complete",
        description: `Found ${data.totalGroups} groups with ${data.totalDuplicates} potential duplicates`,
      });
    } catch (error) {
      console.error("Failed to scan:", error);
      toast({
        title: "Error",
        description: "Failed to scan for duplicates",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  }

  function openMergeDialog(group: DuplicateGroup) {
    setSelectedGroup(group);
    // Pre-select the oldest lead as master (usually the original)
    setSelectedMaster(group.leads[0].id);
    setMergeDialogOpen(true);
  }

  async function handleMerge() {
    if (!selectedGroup || !selectedMaster) return;

    setLoading(true);
    try {
      const duplicateIds = selectedGroup.leads
        .filter((lead) => lead.id !== selectedMaster)
        .map((lead) => lead.id);

      const res = await fetch("/api/crm/duplicates/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masterLeadId: selectedMaster,
          duplicateLeadIds: duplicateIds,
        }),
      });

      if (!res.ok) throw new Error("Failed to merge duplicates");

      const data = await res.json();

      toast({
        title: "Merge Complete",
        description: `Merged ${data.merged} duplicate lead(s) successfully`,
      });

      // Remove merged group from list
      setDuplicateGroups((prev) => prev.filter((g) => g !== selectedGroup));
      setMergeDialogOpen(false);
      setSelectedGroup(null);
      setSelectedMaster("");
    } catch (error) {
      console.error("Failed to merge:", error);
      toast({
        title: "Error",
        description: "Failed to merge duplicates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const matchTypeLabels = {
    "exact-email": "Exact Email Match",
    "exact-phone": "Exact Phone Match",
    "similar-name": "Similar Name",
  };

  const confidenceColors = {
    high: "bg-red-600",
    medium: "bg-orange-600",
    low: "bg-yellow-600",
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="w-5 h-5" />
            Duplicate Lead Manager
          </CardTitle>
          <CardDescription>
            Detect and merge duplicate customer records to maintain data quality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scan Button */}
          <div className="flex items-center gap-4">
            <Button onClick={scanForDuplicates} disabled={scanning}>
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Scan for Duplicates
                </>
              )}
            </Button>

            {duplicateGroups.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{duplicateGroups.length} groups found</Badge>
              </div>
            )}
          </div>

          {/* Duplicate Groups */}
          {duplicateGroups.length > 0 ? (
            <div className="space-y-4">
              {duplicateGroups.map((group, index) => (
                <Card key={index} className="border-orange-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={confidenceColors[group.confidence]}>
                          {group.confidence} confidence
                        </Badge>
                        <Badge variant="outline">{matchTypeLabels[group.matchType]}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {group.leads.length} records
                        </span>
                      </div>
                      <Button size="sm" onClick={() => openMergeDialog(group)}>
                        <GitMerge className="w-4 h-4 mr-1" />
                        Merge
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {group.leads.map((lead) => (
                        <div
                          key={lead.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">
                              {lead.firstName} {lead.lastName}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {lead.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {lead.email}
                                </span>
                              )}
                              {lead.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {lead.phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{lead.status}</Badge>
                            <Badge>Score: {lead.leadScore}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <p className="text-lg font-medium mb-1">No Duplicates Found</p>
              <p className="text-sm">Your CRM data is clean! Click scan to check again.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Merge Dialog */}
      <AlertDialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Merge Duplicate Leads
            </AlertDialogTitle>
            <AlertDialogDescription>
              Select which record to keep as the master. All activities, deals, and notes from
              duplicate records will be merged into the master record. Duplicates will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedGroup && (
            <RadioGroup value={selectedMaster} onValueChange={setSelectedMaster}>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {selectedGroup.leads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer ${
                      selectedMaster === lead.id ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedMaster(lead.id)}
                  >
                    <RadioGroupItem value={lead.id} id={lead.id} className="mt-1" />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">
                        {lead.firstName} {lead.lastName}
                        {selectedMaster === lead.id && (
                          <Badge className="ml-2" variant="default">
                            Master
                          </Badge>
                        )}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {lead.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </span>
                        )}
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{lead.status}</Badge>
                        <Badge>Score: {lead.leadScore}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMerge}
              disabled={loading || !selectedMaster}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Merge {selectedGroup && selectedGroup.leads.length - 1} Duplicate(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
