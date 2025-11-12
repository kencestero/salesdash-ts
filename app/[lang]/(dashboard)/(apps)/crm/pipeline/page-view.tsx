"use client";

/**
 * CRM Pipeline View (Client Component)
 * Interactive Kanban board for lead management
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
import { Search, RefreshCw, Filter } from "lucide-react";
import { PipelineBoard } from "@/components/crm/pipeline-board";
import type { LeadCardData } from "@/components/crm/lead-card";
import { toast } from "@/components/ui/use-toast";

interface PipelineViewProps {
  session: Session;
}

export default function PipelineView({ session }: PipelineViewProps) {
  const [leads, setLeads] = useState<LeadCardData[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [temperatureFilter, setTemperatureFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Fetch leads from API
  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/crm/customers");

      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }

      const data = await response.json();

      // Transform customers to LeadCardData format
      const transformedLeads: LeadCardData[] = data.customers.map((customer: any) => ({
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        salesRepName: customer.salesRepName,
        assignedToName: customer.assignedToName,
        status: customer.status || "new",
        leadScore: customer.leadScore || 0,
        temperature: customer.temperature || "warm",
        priority: customer.priority || "medium",
        daysInStage: customer.daysInStage || 0,
        trailerSize: customer.trailerSize,
        financingType: customer.financingType,
        applied: customer.applied || false,
      }));

      setLeads(transformedLeads);
      setFilteredLeads(transformedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);

      toast({
        title: "Error",
        description: "Failed to load leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Apply filters
  useEffect(() => {
    let filtered = [...leads];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.firstName.toLowerCase().includes(query) ||
          lead.lastName.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.phone?.includes(query)
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

  // Handle status change from drag-and-drop
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/crm/customers/${leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      // Update local state
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      throw error; // Re-throw so PipelineBoard can show error toast
    }
  };

  // Handle lead click (navigate to detail view)
  const handleLeadClick = (leadId: string) => {
    // TODO: Navigate to customer detail page
    console.log("Navigate to customer:", leadId);
    // router.push(`/crm/customers/${leadId}`);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setTemperatureFilter("all");
    setPriorityFilter("all");
  };

  return (
    <div className="h-full flex flex-col space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Pipeline</h1>
          <p className="text-muted-foreground">
            Drag leads between stages to update their status
          </p>
        </div>

        <Button onClick={fetchLeads} disabled={isLoading} size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Temperature Filter */}
          <Select value={temperatureFilter} onValueChange={setTemperatureFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Temperature" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Temps</SelectItem>
              <SelectItem value="hot">🔥 Hot</SelectItem>
              <SelectItem value="warm">🌡️  Warm</SelectItem>
              <SelectItem value="cold">❄️  Cold</SelectItem>
              <SelectItem value="dead">💀 Dead</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {(searchQuery || temperatureFilter !== "all" || priorityFilter !== "all") && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}

          {/* Stats */}
          <div className="ml-auto flex items-center gap-4">
            <Badge variant="secondary">
              {filteredLeads.length} / {leads.length} Leads
            </Badge>
            <Badge variant="outline">
              Hot: {filteredLeads.filter((l) => l.temperature === "hot").length}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Pipeline Board */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading pipeline...</p>
            </div>
          </div>
        ) : (
          <PipelineBoard
            leads={filteredLeads}
            onStatusChange={handleStatusChange}
            onLeadClick={handleLeadClick}
          />
        )}
      </div>
    </div>
  );
}
