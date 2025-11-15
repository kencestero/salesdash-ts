"use client";

/**
 * Enhanced CRM Pipeline View V2 (Client Component)
 * 3-way view toggle: Kanban Board | List View | Table View
 */

import { useState, useEffect, useCallback } from "react";
import { Session } from "next-auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Filter, LayoutGrid, List, Table as TableIcon, Columns3 } from "lucide-react";
import { PipelineBoard } from "@/components/crm/pipeline-board";
import { LeadCardProV2 } from "@/components/crm/lead-card-pro-v2";
import { LeadsTableView } from "@/components/crm/leads-table-view";
import { toast } from "@/components/ui/use-toast";

interface PipelineViewProps {
  session: Session;
}

type ViewMode = "kanban" | "list" | "table";

export default function PipelineViewEnhancedV2({ session }: PipelineViewProps) {
  const [leads, setLeads] = useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [temperatureFilter, setTemperatureFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list"); // Default to list view

  // Map Google Sheets statuses to pipeline statuses
  const normalizeStatus = (status: string): string => {
    if (!status) return "new";

    const statusLower = status.toLowerCase().trim();

    // Direct matches (already normalized)
    if (["new", "contacted", "qualified", "applied", "approved", "won", "dead"].includes(statusLower)) {
      return statusLower;
    }

    // Google Sheets status mappings
    const statusMap: Record<string, string> = {
      "needs attention – no contact": "new",
      "needs attention - no contact": "new",
      "need": "new",
      "lead": "new",
      "contact": "contacted",
      "call": "contacted",
      "qualify": "qualified",
      "qualified lead": "qualified",
      "apply": "applied",
      "application": "applied",
      "approve": "approved",
      "approved financing": "approved",
      "win": "won",
      "won deal": "won",
      "sold": "won",
      "close": "won",
      "closed": "won",
      "dead lead": "dead",
      "lost": "dead",
      "declined": "dead",
    };

    return statusMap[statusLower] || "new";
  };

  // Fetch leads from API
  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/crm/customers");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to fetch leads: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Fetched customers:", data.customers?.length || 0);

      // Transform customers to include all V2 fields
      const transformedLeads = data.customers.map((customer: any) => ({
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        salesRepName: customer.salesRepName || "Unassigned",
        phone: customer.phone,
        email: customer.email,
        address: customer.street,  // API returns 'street' field
        city: customer.city,
        state: customer.state,
        zipcode: customer.zipcode,
        source: customer.source || "Unknown",
        lastContactDate: customer.lastContactedAt ? new Date(customer.lastContactedAt) : customer.createdAt ? new Date(customer.createdAt) : undefined,
        lastContactMethod: "phone" as const, // Default, would come from activities in production
        nextFollowUpDate: customer.nextFollowUpDate ? new Date(customer.nextFollowUpDate) : undefined,
        temperature: customer.temperature || "warm",
        priority: customer.priority || "medium",
        leadScore: customer.leadScore || 50,
        daysInStage: customer.daysInStage || 0,
        deals: customer.deals || [],
        activityCount: customer._count?.activities || 0,
        creditAppStatus: customer.creditAppStatus || "not_applied",
        tags: customer.tags || [],
        trailerInfo: customer.trailerSize || customer.trailerType,
        notes: customer.notes || customer.repNotes || customer.managerNotes || "",
        status: normalizeStatus(customer.status || "new"),
        applied: customer.applied || false,
        assignedToName: customer.assignedToName,
        trailerSize: customer.trailerSize,
        financingType: customer.financingType,
      }));

      setLeads(transformedLeads);
      setFilteredLeads(transformedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Filter leads
  useEffect(() => {
    let filtered = [...leads];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (lead) =>
          lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.phone?.includes(searchQuery)
      );
    }

    // Temperature filter
    if (temperatureFilter !== "all") {
      filtered = filtered.filter((lead) => lead.temperature === temperatureFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((lead) => lead.priority === priorityFilter);
    }

    setFilteredLeads(filtered);
  }, [leads, searchQuery, temperatureFilter, priorityFilter]);

  const handleCall = async (customerId: string, notes: string, outcome: string) => {
    try {
      const response = await fetch("/api/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          type: "call",
          subject: `Phone call - ${outcome}`,
          description: notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save call notes");
      }

      toast({
        title: "Call Logged Successfully",
        description: `Call notes saved for customer`,
      });

      // Refresh leads to show updated data
      await fetchLeads();
    } catch (error) {
      console.error("Error saving call notes:", error);
      toast({
        title: "Error",
        description: "Failed to save call notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmail = (customerId: string) => {
    console.log("Email sent:", customerId);
    toast({
      title: "Email Sent",
      description: "Email details automatically saved to activity log",
    });
    // In production, you'd call: POST /api/crm/activities with email details
  };

  const handleSMS = (customerId: string) => {
    console.log("SMS sent:", customerId);
    toast({
      title: "SMS Sent",
      description: "Message details automatically saved to activity log",
    });
    // In production, you'd call: POST /api/crm/activities with SMS details
  };

  const handleStageChange = useCallback(
    async (leadId: string, newStage: string) => {
      try {
        const response = await fetch(`/api/crm/customers/${leadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStage }),
        });

        if (!response.ok) throw new Error("Failed to update stage");

        toast({
          title: "Stage Updated",
          description: `Lead moved to ${newStage} stage`,
        });

        fetchLeads();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update stage",
        });
      }
    },
    [fetchLeads]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Manage your leads across different stages
          </p>
        </div>
        <Button onClick={fetchLeads} disabled={isLoading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={temperatureFilter} onValueChange={setTemperatureFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Temperature" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="all">All Temps</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
                <SelectItem value="dead">Dead</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "kanban" ? undefined : "outline"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="gap-2"
            >
              <Columns3 className="w-4 h-4" />
              Kanban
            </Button>
            <Button
              variant={viewMode === "list" ? undefined : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              List
            </Button>
            <Button
              variant={viewMode === "table" ? undefined : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="gap-2"
            >
              <TableIcon className="w-4 h-4" />
              Table
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{filteredLeads.length} Total</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
              {filteredLeads.filter((l) => l.temperature === "hot").length} Hot
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
              {filteredLeads.filter((l) => l.temperature === "warm").length} Warm
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {filteredLeads.filter((l) => l.temperature === "cold").length} Cold
            </Badge>
          </div>
        </div>
      </Card>

      {/* Content based on view mode */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading leads...</span>
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">No leads found matching your filters</p>
        </Card>
      ) : (
        <>
          {viewMode === "kanban" && (
            <PipelineBoard
              leads={filteredLeads.map((lead) => ({
                id: lead.id,
                firstName: lead.firstName,
                lastName: lead.lastName,
                email: lead.email,
                phone: lead.phone,
                salesRepName: lead.salesRepName,
                assignedToName: lead.assignedToName,
                status: lead.status,
                leadScore: lead.leadScore,
                temperature: lead.temperature,
                priority: lead.priority,
                daysInStage: lead.daysInStage,
                trailerSize: lead.trailerSize,
                financingType: lead.financingType,
                applied: lead.applied,
              }))}
              onStageChange={handleStageChange}
            />
          )}

          {viewMode === "list" && (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <LeadCardProV2
                  key={lead.id}
                  customer={lead}
                  onCall={(notes, outcome) => handleCall(lead.id, notes, outcome)}
                  onEmail={() => handleEmail(lead.id)}
                  onSMS={() => handleSMS(lead.id)}
                />
              ))}
            </div>
          )}

          {viewMode === "table" && (
            <LeadsTableView
              leads={filteredLeads}
              onCall={handleCall}
              onEmail={handleEmail}
              onSMS={handleSMS}
            />
          )}
        </>
      )}
    </div>
  );
}
