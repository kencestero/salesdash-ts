"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  Users,
  ThermometerSun,
  DollarSign,
  MapPin,
  Truck,
  Calendar,
  RotateCcw,
  X,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  profile: {
    role: string;
  } | null;
}

export interface FilterState {
  // People & Assignment
  assignedToId: string;
  managerId: string;
  unassignedOnly: boolean;

  // Status
  statuses: string[];
  temperatures: string[];
  priorities: string[];
  lostReason: string;

  // Financing
  financingType: string;
  rtoApprovalStatus: string;
  financeApprovalStatus: string;
  applied: string; // "all" | "true" | "false"

  // Location
  state: string;
  city: string;
  zipcode: string;

  // Trailer
  trailerType: string;
  trailerSize: string;
  stockNumber: string;
  vin: string;

  // Time Ranges
  createdAfter: string;
  createdBefore: string;
  lastContactedAfter: string;
  lastContactedBefore: string;

  // Quick Toggles
  neverContacted: boolean;
  followUpOverdue: boolean;
}

export const DEFAULT_FILTERS: FilterState = {
  assignedToId: "",
  managerId: "",
  unassignedOnly: false,
  statuses: [],
  temperatures: [],
  priorities: [],
  lostReason: "",
  financingType: "",
  rtoApprovalStatus: "",
  financeApprovalStatus: "",
  applied: "",
  state: "",
  city: "",
  zipcode: "",
  trailerType: "",
  trailerSize: "",
  stockNumber: "",
  vin: "",
  createdAfter: "",
  createdBefore: "",
  lastContactedAfter: "",
  lastContactedBefore: "",
  neverContacted: false,
  followUpOverdue: false,
};

// Status options
const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "applied", label: "Applied" },
  { value: "approved", label: "Approved" },
  { value: "won", label: "Won" },
  { value: "dead", label: "Dead" },
];

// Temperature options
const TEMPERATURE_OPTIONS = [
  { value: "hot", label: "Hot 🔥" },
  { value: "warm", label: "Warm ☀️" },
  { value: "cold", label: "Cold ❄️" },
  { value: "dead", label: "Dead ☠️" },
];

// Priority options
const PRIORITY_OPTIONS = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

// Lost reason options
const LOST_REASON_OPTIONS = [
  { value: "price", label: "Price - Too Expensive" },
  { value: "no_credit", label: "No Credit" },
  { value: "bought_elsewhere", label: "Bought Elsewhere" },
  { value: "no_response", label: "No Response" },
  { value: "other", label: "Other" },
];

// Financing type options
const FINANCING_TYPE_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "finance", label: "Finance" },
  { value: "rto", label: "RTO (Rent-to-Own)" },
];

// Approval status options
const APPROVAL_STATUS_OPTIONS = [
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "need_stips", label: "Need Stips" },
  { value: "declined", label: "Declined" },
];

// US States
const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

// Trailer types
const TRAILER_TYPE_OPTIONS = [
  { value: "enclosed", label: "Enclosed" },
  { value: "open", label: "Open" },
  { value: "dump", label: "Dump" },
  { value: "flatbed", label: "Flatbed" },
  { value: "utility", label: "Utility" },
  { value: "car_hauler", label: "Car Hauler" },
  { value: "equipment", label: "Equipment" },
  { value: "livestock", label: "Livestock" },
];

// Trailer sizes
const TRAILER_SIZE_OPTIONS = [
  { value: "4x6", label: "4x6" },
  { value: "5x8", label: "5x8" },
  { value: "5x10", label: "5x10" },
  { value: "6x10", label: "6x10" },
  { value: "6x12", label: "6x12" },
  { value: "7x14", label: "7x14" },
  { value: "7x16", label: "7x16" },
  { value: "8x16", label: "8x16" },
  { value: "8x20", label: "8x20" },
  { value: "8.5x20", label: "8.5x20" },
  { value: "8.5x24", label: "8.5x24" },
];

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApply: () => void;
  onClear: () => void;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onApply,
  onClear,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Count active filters
  const activeFilterCount = countActiveFilters(filters);

  // Fetch users for rep/manager dropdowns
  useEffect(() => {
    async function fetchUsers() {
      setLoadingUsers(true);
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    }
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayValue = (
    key: "statuses" | "temperatures" | "priorities",
    value: string
  ) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const handleApply = () => {
    onApply();
    setOpen(false);
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] overflow-y-auto">
        <SheetHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Filters
            </SheetTitle>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          {activeFilterCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
            </p>
          )}
        </SheetHeader>

        <div className="py-6">
          <Accordion
            type="multiple"
            defaultValue={["people", "status"]}
            className="w-full"
          >
            {/* People & Assignment */}
            <AccordionItem value="people">
              <AccordionTrigger className="text-sm font-medium">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  People & Assignment
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {/* Unassigned Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="unassigned" className="text-sm">
                    Show Only Unassigned
                  </Label>
                  <Switch
                    id="unassigned"
                    checked={filters.unassignedOnly}
                    onCheckedChange={(checked) =>
                      updateFilter("unassignedOnly", checked)
                    }
                  />
                </div>

                {/* Rep Dropdown */}
                {!filters.unassignedOnly && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm">Assigned Rep</Label>
                      <Select
                        value={filters.assignedToId}
                        onValueChange={(value) =>
                          updateFilter("assignedToId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any rep..." />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          <SelectItem value="">Any rep</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name || user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Manager Dropdown */}
                    <div className="space-y-2">
                      <Label className="text-sm">Manager</Label>
                      <Select
                        value={filters.managerId}
                        onValueChange={(value) =>
                          updateFilter("managerId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any manager..." />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          <SelectItem value="">Any manager</SelectItem>
                          {users
                            .filter((u) =>
                              ["owner", "director", "manager"].includes(
                                u.profile?.role || ""
                              )
                            )
                            .map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name || user.email}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Status & Temperature */}
            <AccordionItem value="status">
              <AccordionTrigger className="text-sm font-medium">
                <span className="flex items-center gap-2">
                  <ThermometerSun className="w-4 h-4" />
                  Status & Temperature
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {/* Status Multi-select */}
                <div className="space-y-2">
                  <Label className="text-sm">Lead Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`status-${option.value}`}
                          checked={filters.statuses.includes(option.value)}
                          onCheckedChange={() =>
                            toggleArrayValue("statuses", option.value)
                          }
                        />
                        <Label
                          htmlFor={`status-${option.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Temperature Multi-select */}
                <div className="space-y-2">
                  <Label className="text-sm">Temperature</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPERATURE_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`temp-${option.value}`}
                          checked={filters.temperatures.includes(option.value)}
                          onCheckedChange={() =>
                            toggleArrayValue("temperatures", option.value)
                          }
                        />
                        <Label
                          htmlFor={`temp-${option.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Multi-select */}
                <div className="space-y-2">
                  <Label className="text-sm">Priority</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRIORITY_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`priority-${option.value}`}
                          checked={filters.priorities.includes(option.value)}
                          onCheckedChange={() =>
                            toggleArrayValue("priorities", option.value)
                          }
                        />
                        <Label
                          htmlFor={`priority-${option.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lost Reason (only when dead status selected) */}
                {filters.statuses.includes("dead") && (
                  <div className="space-y-2">
                    <Label className="text-sm">Lost Reason</Label>
                    <Select
                      value={filters.lostReason}
                      onValueChange={(value) =>
                        updateFilter("lostReason", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any reason..." />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        <SelectItem value="">Any reason</SelectItem>
                        {LOST_REASON_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Financing */}
            <AccordionItem value="financing">
              <AccordionTrigger className="text-sm font-medium">
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Financing & Approvals
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {/* Financing Type */}
                <div className="space-y-2">
                  <Label className="text-sm">Financing Type</Label>
                  <Select
                    value={filters.financingType}
                    onValueChange={(value) =>
                      updateFilter("financingType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any type..." />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="">Any type</SelectItem>
                      {FINANCING_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Applied Filter */}
                <div className="space-y-2">
                  <Label className="text-sm">Applied Status</Label>
                  <Select
                    value={filters.applied}
                    onValueChange={(value) => updateFilter("applied", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any..." />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="true">Has Applied</SelectItem>
                      <SelectItem value="false">Not Applied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* RTO Approval Status */}
                <div className="space-y-2">
                  <Label className="text-sm">RTO Approval</Label>
                  <Select
                    value={filters.rtoApprovalStatus}
                    onValueChange={(value) =>
                      updateFilter("rtoApprovalStatus", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any status..." />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="">Any status</SelectItem>
                      {APPROVAL_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Finance Approval Status */}
                <div className="space-y-2">
                  <Label className="text-sm">Finance Approval</Label>
                  <Select
                    value={filters.financeApprovalStatus}
                    onValueChange={(value) =>
                      updateFilter("financeApprovalStatus", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any status..." />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="">Any status</SelectItem>
                      {APPROVAL_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Location */}
            <AccordionItem value="location">
              <AccordionTrigger className="text-sm font-medium">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {/* State */}
                <div className="space-y-2">
                  <Label className="text-sm">State</Label>
                  <Select
                    value={filters.state}
                    onValueChange={(value) => updateFilter("state", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any state..." />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] max-h-[200px]">
                      <SelectItem value="">Any state</SelectItem>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label className="text-sm">City</Label>
                  <Input
                    placeholder="Enter city..."
                    value={filters.city}
                    onChange={(e) => updateFilter("city", e.target.value)}
                  />
                </div>

                {/* ZIP Code */}
                <div className="space-y-2">
                  <Label className="text-sm">ZIP Code</Label>
                  <Input
                    placeholder="Enter ZIP..."
                    value={filters.zipcode}
                    onChange={(e) => updateFilter("zipcode", e.target.value)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Trailer */}
            <AccordionItem value="trailer">
              <AccordionTrigger className="text-sm font-medium">
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Trailer Details
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {/* Trailer Type */}
                <div className="space-y-2">
                  <Label className="text-sm">Trailer Type</Label>
                  <Select
                    value={filters.trailerType}
                    onValueChange={(value) =>
                      updateFilter("trailerType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any type..." />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="">Any type</SelectItem>
                      {TRAILER_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Trailer Size */}
                <div className="space-y-2">
                  <Label className="text-sm">Trailer Size</Label>
                  <Select
                    value={filters.trailerSize}
                    onValueChange={(value) =>
                      updateFilter("trailerSize", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any size..." />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="">Any size</SelectItem>
                      {TRAILER_SIZE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Stock Number */}
                <div className="space-y-2">
                  <Label className="text-sm">Stock Number</Label>
                  <Input
                    placeholder="Enter stock #..."
                    value={filters.stockNumber}
                    onChange={(e) =>
                      updateFilter("stockNumber", e.target.value)
                    }
                  />
                </div>

                {/* VIN */}
                <div className="space-y-2">
                  <Label className="text-sm">VIN</Label>
                  <Input
                    placeholder="Enter VIN..."
                    value={filters.vin}
                    onChange={(e) => updateFilter("vin", e.target.value)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Time Ranges */}
            <AccordionItem value="time">
              <AccordionTrigger className="text-sm font-medium">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Time Filters
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {/* Created Date Range */}
                <div className="space-y-2">
                  <Label className="text-sm">Created After</Label>
                  <Input
                    type="date"
                    value={filters.createdAfter}
                    onChange={(e) =>
                      updateFilter("createdAfter", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Created Before</Label>
                  <Input
                    type="date"
                    value={filters.createdBefore}
                    onChange={(e) =>
                      updateFilter("createdBefore", e.target.value)
                    }
                  />
                </div>

                <Separator />

                {/* Last Contacted Range */}
                <div className="space-y-2">
                  <Label className="text-sm">Last Contacted After</Label>
                  <Input
                    type="date"
                    value={filters.lastContactedAfter}
                    onChange={(e) =>
                      updateFilter("lastContactedAfter", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Last Contacted Before</Label>
                  <Input
                    type="date"
                    value={filters.lastContactedBefore}
                    onChange={(e) =>
                      updateFilter("lastContactedBefore", e.target.value)
                    }
                  />
                </div>

                <Separator />

                {/* Quick Toggles */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="neverContacted" className="text-sm">
                    Never Contacted
                  </Label>
                  <Switch
                    id="neverContacted"
                    checked={filters.neverContacted}
                    onCheckedChange={(checked) =>
                      updateFilter("neverContacted", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="followUpOverdue" className="text-sm">
                    Follow-up Overdue
                  </Label>
                  <Switch
                    id="followUpOverdue"
                    checked={filters.followUpOverdue}
                    onCheckedChange={(checked) =>
                      updateFilter("followUpOverdue", checked)
                    }
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <SheetFooter className="sticky bottom-0 bg-background border-t pt-4">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1"
              disabled={activeFilterCount === 0}
            >
              Clear All
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Helper function to count active filters
function countActiveFilters(filters: FilterState): number {
  let count = 0;

  if (filters.assignedToId) count++;
  if (filters.managerId) count++;
  if (filters.unassignedOnly) count++;
  if (filters.statuses.length > 0) count++;
  if (filters.temperatures.length > 0) count++;
  if (filters.priorities.length > 0) count++;
  if (filters.lostReason) count++;
  if (filters.financingType) count++;
  if (filters.rtoApprovalStatus) count++;
  if (filters.financeApprovalStatus) count++;
  if (filters.applied) count++;
  if (filters.state) count++;
  if (filters.city) count++;
  if (filters.zipcode) count++;
  if (filters.trailerType) count++;
  if (filters.trailerSize) count++;
  if (filters.stockNumber) count++;
  if (filters.vin) count++;
  if (filters.createdAfter) count++;
  if (filters.createdBefore) count++;
  if (filters.lastContactedAfter) count++;
  if (filters.lastContactedBefore) count++;
  if (filters.neverContacted) count++;
  if (filters.followUpOverdue) count++;

  return count;
}

// Helper to convert filters to URL search params
export function filtersToSearchParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.assignedToId) params.set("assignedToId", filters.assignedToId);
  if (filters.managerId) params.set("managerId", filters.managerId);
  if (filters.unassignedOnly) params.set("unassignedOnly", "true");

  filters.statuses.forEach((s) => params.append("status", s));
  filters.temperatures.forEach((t) => params.append("temperature", t));
  filters.priorities.forEach((p) => params.append("priority", p));

  if (filters.lostReason) params.set("lostReason", filters.lostReason);
  if (filters.financingType) params.set("financingType", filters.financingType);
  if (filters.rtoApprovalStatus) params.set("rtoApprovalStatus", filters.rtoApprovalStatus);
  if (filters.financeApprovalStatus) params.set("financeApprovalStatus", filters.financeApprovalStatus);
  if (filters.applied) params.set("applied", filters.applied);

  if (filters.state) params.set("state", filters.state);
  if (filters.city) params.set("city", filters.city);
  if (filters.zipcode) params.set("zipcode", filters.zipcode);

  if (filters.trailerType) params.set("trailerType", filters.trailerType);
  if (filters.trailerSize) params.set("trailerSize", filters.trailerSize);
  if (filters.stockNumber) params.set("stockNumber", filters.stockNumber);
  if (filters.vin) params.set("vin", filters.vin);

  if (filters.createdAfter) params.set("createdAfter", filters.createdAfter);
  if (filters.createdBefore) params.set("createdBefore", filters.createdBefore);
  if (filters.lastContactedAfter) params.set("lastContactedAfter", filters.lastContactedAfter);
  if (filters.lastContactedBefore) params.set("lastContactedBefore", filters.lastContactedBefore);

  if (filters.neverContacted) params.set("neverContacted", "true");
  if (filters.followUpOverdue) params.set("followUpOverdue", "true");

  return params;
}

// Helper to parse URL search params into filters
export function searchParamsToFilters(searchParams: URLSearchParams): FilterState {
  return {
    assignedToId: searchParams.get("assignedToId") || "",
    managerId: searchParams.get("managerId") || "",
    unassignedOnly: searchParams.get("unassignedOnly") === "true",
    statuses: searchParams.getAll("status"),
    temperatures: searchParams.getAll("temperature"),
    priorities: searchParams.getAll("priority"),
    lostReason: searchParams.get("lostReason") || "",
    financingType: searchParams.get("financingType") || "",
    rtoApprovalStatus: searchParams.get("rtoApprovalStatus") || "",
    financeApprovalStatus: searchParams.get("financeApprovalStatus") || "",
    applied: searchParams.get("applied") || "",
    state: searchParams.get("state") || "",
    city: searchParams.get("city") || "",
    zipcode: searchParams.get("zipcode") || "",
    trailerType: searchParams.get("trailerType") || "",
    trailerSize: searchParams.get("trailerSize") || "",
    stockNumber: searchParams.get("stockNumber") || "",
    vin: searchParams.get("vin") || "",
    createdAfter: searchParams.get("createdAfter") || "",
    createdBefore: searchParams.get("createdBefore") || "",
    lastContactedAfter: searchParams.get("lastContactedAfter") || "",
    lastContactedBefore: searchParams.get("lastContactedBefore") || "",
    neverContacted: searchParams.get("neverContacted") === "true",
    followUpOverdue: searchParams.get("followUpOverdue") === "true",
  };
}
