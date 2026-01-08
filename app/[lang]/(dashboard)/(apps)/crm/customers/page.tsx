"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { AddCustomerDialog } from "./add-customer-dialog";
import { calculateResponseTimer, getBackgroundColorClass } from "@/lib/response-timer";
import {
  AdvancedFilters,
  FilterState,
  DEFAULT_FILTERS,
  filtersToSearchParams,
  searchParamsToFilters,
} from "@/components/crm/advanced-filters";
import { FilterChips } from "@/components/crm/filter-chips";
import { SavedViewsSelect } from "@/components/crm/saved-views-select";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  source?: string;
  companyName?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  assignedTo?: string;
  salesRepName?: string | null;      // Sales Rep from Google Sheets
  assignedToName?: string | null;    // Manager from Google Sheets
  vin?: string | null;
  stockNumber?: string | null;
  createdAt: string;
  lastContactedAt?: string;
  _count: {
    deals: number;
    activities: number;
    quotes: number;
  };
  deals: any[];
  activities: any[];
}

// Status badge colors
const statusColors: Record<string, string> = {
  lead: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Applied: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  Approved: "bg-green-100 text-green-800 hover:bg-green-100",
  "Dead Deal": "bg-red-100 text-red-800 hover:bg-red-100",
  contacted: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  qualified: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  negotiating: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  won: "bg-green-100 text-green-800 hover:bg-green-100",
  lost: "bg-red-100 text-red-800 hover:bg-red-100",
};

// Status icons
const statusIcons: Record<string, any> = {
  lead: AlertCircle,
  Applied: Clock,
  Approved: CheckCircle2,
  "Dead Deal": XCircle,
  contacted: Clock,
  qualified: CheckCircle2,
  negotiating: TrendingUp,
  won: CheckCircle2,
  lost: XCircle,
};

export default function CustomersPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string[]>(["all"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  // Advanced filters state - initialize from URL
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>(() => {
    if (typeof window !== "undefined") {
      return searchParamsToFilters(searchParams);
    }
    return DEFAULT_FILTERS;
  });

  // Check if we should auto-open the add dialog
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setShowAddDialog(true);
    }
    // Also restore filters from URL on mount
    setAdvancedFilters(searchParamsToFilters(searchParams));
  }, [searchParams]);

  // Fetch customers with all filters
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      // Build params from advanced filters
      const params = filtersToSearchParams(advancedFilters);

      // Also add legacy status filter if used
      const hasAllSelected = statusFilter.includes("all");
      if (!hasAllSelected && statusFilter.length > 0 && advancedFilters.statuses.length === 0) {
        statusFilter.forEach(status => {
          params.append("status", status);
        });
      }

      // Add search query
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/crm/customers?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();
      setCustomers(data.customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and update URL
  const applyFilters = () => {
    const params = filtersToSearchParams(advancedFilters);
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    router.push(`?${params.toString()}`);
    fetchCustomers();
  };

  // Clear all filters
  const clearFilters = () => {
    setAdvancedFilters(DEFAULT_FILTERS);
    setStatusFilter(["all"]);
    setSearchQuery("");
    router.push("?");
    // Fetch will be triggered by useEffect
  };

  // Clear a specific filter (for filter chips)
  const clearFilter = (key: keyof FilterState, value?: string) => {
    const newFilters = { ...advancedFilters };

    // Handle array fields (multi-select)
    if (key === "statuses" && value) {
      newFilters.statuses = advancedFilters.statuses.filter((s) => s !== value);
    } else if (key === "temperatures" && value) {
      newFilters.temperatures = advancedFilters.temperatures.filter((t) => t !== value);
    } else if (key === "priorities" && value) {
      newFilters.priorities = advancedFilters.priorities.filter((p) => p !== value);
    } else if (key === "unassignedOnly") {
      newFilters.unassignedOnly = false;
    } else if (key === "neverContacted") {
      newFilters.neverContacted = false;
    } else if (key === "followUpOverdue") {
      newFilters.followUpOverdue = false;
    } else {
      // Handle string fields
      (newFilters as any)[key] = "";
    }

    setAdvancedFilters(newFilters);
  };

  const importGoogleLeads = async () => {
    try {
      setImporting(true);
      setImportMessage("Importing...");

      const response = await fetch("/api/leads/import/google", { method: "POST" });

      if (!response.ok) {
        throw new Error("Import failed");
      }

      const data = await response.json();
      setImportMessage(`✅ Imported: ${data.imported} | Skipped: ${data.skipped} | Total: ${data.total}`);

      toast({
        title: "Import Complete",
        description: `Imported ${data.imported} leads, skipped ${data.skipped}`,
      });

      // Refresh the customer list
      fetchCustomers();

      // Clear message after 5 seconds
      setTimeout(() => setImportMessage(""), 5000);
    } catch (error) {
      console.error("Error importing leads:", error);
      setImportMessage("❌ Import failed");
      toast({
        title: "Error",
        description: "Failed to import leads",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  // Multi-select filter helper functions
  const handleStatusToggle = (status: string) => {
    if (status === "all") {
      // Select All clicked
      setStatusFilter(["all"]);
    } else {
      // Specific status clicked
      setStatusFilter(prev => {
        // Remove "all" if it exists
        const withoutAll = prev.filter(s => s !== "all");

        // Toggle the status
        if (withoutAll.includes(status)) {
          const updated = withoutAll.filter(s => s !== status);
          // If nothing left, default to "all"
          return updated.length === 0 ? ["all"] : updated;
        } else {
          return [...withoutAll, status];
        }
      });
    }
  };

  const getFilterLabel = () => {
    if (statusFilter.includes("all") || statusFilter.length === 0) {
      return "All Status";
    }
    if (statusFilter.length === 1) {
      const statusLabels: Record<string, string> = {
        lead: "New Leads",
        Applied: "Applied",
        Approved: "Approved",
        "Dead Deal": "Dead Deals"
      };
      return statusLabels[statusFilter[0]] || statusFilter[0];
    }
    return `${statusFilter.length} statuses selected`;
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchCustomers();
  }, [statusFilter, advancedFilters]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Calculate stats
  const stats = {
    total: customers.length,
    leads: customers.filter((c) => c.status === "lead").length,
    applied: customers.filter((c) => c.status === "Applied").length,
    approved: customers.filter((c) => c.status === "Approved").length,
    deadDeals: customers.filter((c) => c.status === "Dead Deal").length,
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-default-900">Customer Management</h1>
          <p className="text-default-600 mt-1">
            Manage your leads, customers, and sales opportunities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={importGoogleLeads}
            disabled={importing}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {importing ? "Importing..." : "Import Google Leads"}
          </Button>
          {importMessage && (
            <span className="text-sm text-default-600">{importMessage}</span>
          )}
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Leads</p>
                <p className="text-2xl font-bold">{stats.leads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied</p>
                <p className="text-2xl font-bold">{stats.applied}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dead Deals</p>
                <p className="text-2xl font-bold">{stats.deadDeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, VIN, or stock #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Status Filter - Multi-Select with Checkboxes */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-[180px] justify-start">
                  <Filter className="w-4 h-4 mr-2" />
                  {getFilterLabel()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("all")}
                  onCheckedChange={() => handleStatusToggle("all")}
                >
                  Select All
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("lead")}
                  onCheckedChange={() => handleStatusToggle("lead")}
                >
                  New Leads
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("Applied")}
                  onCheckedChange={() => handleStatusToggle("Applied")}
                >
                  Applied
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("Approved")}
                  onCheckedChange={() => handleStatusToggle("Approved")}
                >
                  Approved
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("Dead Deal")}
                  onCheckedChange={() => handleStatusToggle("Dead Deal")}
                >
                  Dead Deals
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Advanced Filters Button */}
            <AdvancedFilters
              filters={advancedFilters}
              onFiltersChange={setAdvancedFilters}
              onApply={applyFilters}
              onClear={clearFilters}
            />

            {/* Saved Views Selector */}
            <SavedViewsSelect
              currentFilters={advancedFilters}
              onViewSelect={(filters) => {
                setAdvancedFilters(filters);
                // Also clear legacy status filter when loading a view
                setStatusFilter(["all"]);
              }}
              onViewClear={clearFilters}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Filter Chips */}
      <FilterChips
        filters={advancedFilters}
        onClearFilter={clearFilter}
        onClearAll={clearFilters}
      />

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter.includes("all") || statusFilter.length === 0
              ? "All Customers"
              : statusFilter.length === 1
                ? `${statusFilter[0].charAt(0).toUpperCase() + statusFilter[0].slice(1)} Customers`
                : "Filtered Customers"}
            {" "}({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No customers found</p>
              <p className="text-muted-foreground mt-1">
                {searchQuery || !statusFilter.includes("all")
                  ? "Try adjusting your filters"
                  : "Add your first customer to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-32rem)] overflow-y-auto pr-2">
              {customers.map((customer) => {
                const StatusIcon = statusIcons[customer.status] || AlertCircle;
                return (
                  <div
                    key={customer.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Customer Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Users className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link href={`/en/crm/customers/${customer.id}`} className="hover:underline">
                                <h3 className="text-lg font-semibold cursor-pointer text-orange-600 hover:text-orange-700">
                                  {customer.firstName} {customer.lastName}
                                </h3>
                              </Link>
                              <Badge className={statusColors[customer.status]}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {customer.status}
                              </Badge>
                              {customer.companyName && (
                                <Badge variant="outline">{customer.companyName}</Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <a
                                  href={`mailto:${customer.email}`}
                                  className="hover:text-orange-500 hover:underline"
                                >
                                  {customer.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <a
                                  href={`tel:${customer.phone}`}
                                  className="hover:text-orange-500 hover:underline"
                                >
                                  {customer.phone}
                                </a>
                              </div>
                              {(customer.city || customer.state || customer.zipcode) && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {/* Format: City, ST ZIP */}
                                  {(() => {
                                    const parts = [];
                                    if (customer.city) parts.push(customer.city);
                                    if (customer.state) {
                                      if (customer.city) {
                                        parts[parts.length - 1] += `, ${customer.state}`;
                                      } else {
                                        parts.push(customer.state);
                                      }
                                    }
                                    if (customer.zipcode) parts.push(customer.zipcode);
                                    return parts.join(" ");
                                  })()}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Last contact: {formatDate(customer.lastContactedAt)}
                              </div>
                            </div>

                            {/* Rep and Manager Assignments */}
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                              {customer.salesRepName ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  <Users className="w-3 h-3 mr-1" />
                                  Rep: {customer.salesRepName}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  No Rep Assigned
                                </Badge>
                              )}
                              {customer.assignedToName && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  <Users className="w-3 h-3 mr-1" />
                                  Manager: {customer.assignedToName}
                                </Badge>
                              )}
                              {/* Response Timer Badge */}
                              {(() => {
                                const timer = calculateResponseTimer(
                                  new Date(customer.createdAt),
                                  customer.lastContactedAt ? new Date(customer.lastContactedAt) : null
                                );
                                return (
                                  <Badge
                                    variant="outline"
                                    className={`${getBackgroundColorClass(timer.status)} ${timer.isPulsating ? 'animate-pulse' : ''}`}
                                  >
                                    <Clock className="w-3 h-3 mr-1" />
                                    {timer.status === 'contacted'
                                      ? timer.label
                                      : `${timer.formattedTime} - ${timer.label}`
                                    }
                                  </Badge>
                                );
                              })()}
                            </div>

                            {/* Activity Summary */}
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span>{customer._count.deals} deals</span>
                              <span>{customer._count.activities} activities</span>
                              <span>{customer._count.quotes} quotes</span>
                              {customer.source && <span>Source: {customer.source}</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Link href={`/en/crm/customers/${customer.id}`}>
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchCustomers}
      />
    </div>
  );
}
