"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FilterState } from "./advanced-filters";

interface FilterChipsProps {
  filters: FilterState;
  onClearFilter: (key: keyof FilterState, value?: string) => void;
  onClearAll: () => void;
}

// Labels for filter display
const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  applied: "Applied",
  approved: "Approved",
  won: "Won",
  dead: "Dead",
};

const TEMPERATURE_LABELS: Record<string, string> = {
  hot: "Hot 🔥",
  warm: "Warm ☀️",
  cold: "Cold ❄️",
  dead: "Dead ☠️",
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const LOST_REASON_LABELS: Record<string, string> = {
  price: "Price",
  no_credit: "No Credit",
  bought_elsewhere: "Bought Elsewhere",
  no_response: "No Response",
  other: "Other",
};

const FINANCING_LABELS: Record<string, string> = {
  cash: "Cash",
  finance: "Finance",
  rto: "RTO",
};

const APPROVAL_LABELS: Record<string, string> = {
  approved: "Approved",
  pending: "Pending",
  need_stips: "Need Stips",
  declined: "Declined",
};

export function FilterChips({ filters, onClearFilter, onClearAll }: FilterChipsProps) {
  const chips: { key: keyof FilterState; label: string; value?: string; color: string }[] = [];

  // People & Assignment
  if (filters.unassignedOnly) {
    chips.push({ key: "unassignedOnly", label: "Unassigned Only", color: "bg-amber-100 text-amber-800 border-amber-300" });
  }

  if (filters.assignedToId) {
    chips.push({ key: "assignedToId", label: `Rep: ${filters.assignedToId.slice(0, 8)}...`, color: "bg-blue-100 text-blue-800 border-blue-300" });
  }

  if (filters.managerId) {
    chips.push({ key: "managerId", label: `Manager: ${filters.managerId.slice(0, 8)}...`, color: "bg-purple-100 text-purple-800 border-purple-300" });
  }

  // Statuses (multi-select)
  filters.statuses.forEach((status) => {
    chips.push({
      key: "statuses",
      value: status,
      label: `Status: ${STATUS_LABELS[status] || status}`,
      color: "bg-green-100 text-green-800 border-green-300",
    });
  });

  // Temperatures (multi-select)
  filters.temperatures.forEach((temp) => {
    chips.push({
      key: "temperatures",
      value: temp,
      label: `Temp: ${TEMPERATURE_LABELS[temp] || temp}`,
      color: temp === "hot" ? "bg-red-100 text-red-800 border-red-300" :
             temp === "cold" ? "bg-cyan-100 text-cyan-800 border-cyan-300" :
             "bg-yellow-100 text-yellow-800 border-yellow-300",
    });
  });

  // Priorities (multi-select)
  filters.priorities.forEach((priority) => {
    chips.push({
      key: "priorities",
      value: priority,
      label: `Priority: ${PRIORITY_LABELS[priority] || priority}`,
      color: priority === "urgent" ? "bg-red-100 text-red-800 border-red-300" :
             priority === "high" ? "bg-orange-100 text-orange-800 border-orange-300" :
             "bg-gray-100 text-gray-800 border-gray-300",
    });
  });

  // Lost Reason
  if (filters.lostReason) {
    chips.push({
      key: "lostReason",
      label: `Lost: ${LOST_REASON_LABELS[filters.lostReason] || filters.lostReason}`,
      color: "bg-red-100 text-red-800 border-red-300",
    });
  }

  // Financing
  if (filters.financingType) {
    chips.push({
      key: "financingType",
      label: `Financing: ${FINANCING_LABELS[filters.financingType] || filters.financingType}`,
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    });
  }

  if (filters.applied) {
    chips.push({
      key: "applied",
      label: filters.applied === "true" ? "Has Applied" : "Not Applied",
      color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    });
  }

  if (filters.rtoApprovalStatus) {
    chips.push({
      key: "rtoApprovalStatus",
      label: `RTO: ${APPROVAL_LABELS[filters.rtoApprovalStatus] || filters.rtoApprovalStatus}`,
      color: "bg-teal-100 text-teal-800 border-teal-300",
    });
  }

  if (filters.financeApprovalStatus) {
    chips.push({
      key: "financeApprovalStatus",
      label: `Finance: ${APPROVAL_LABELS[filters.financeApprovalStatus] || filters.financeApprovalStatus}`,
      color: "bg-teal-100 text-teal-800 border-teal-300",
    });
  }

  // Location
  if (filters.state) {
    chips.push({
      key: "state",
      label: `State: ${filters.state}`,
      color: "bg-sky-100 text-sky-800 border-sky-300",
    });
  }

  if (filters.city) {
    chips.push({
      key: "city",
      label: `City: ${filters.city}`,
      color: "bg-sky-100 text-sky-800 border-sky-300",
    });
  }

  if (filters.zipcode) {
    chips.push({
      key: "zipcode",
      label: `ZIP: ${filters.zipcode}`,
      color: "bg-sky-100 text-sky-800 border-sky-300",
    });
  }

  // Trailer
  if (filters.trailerType) {
    chips.push({
      key: "trailerType",
      label: `Type: ${filters.trailerType}`,
      color: "bg-slate-100 text-slate-800 border-slate-300",
    });
  }

  if (filters.trailerSize) {
    chips.push({
      key: "trailerSize",
      label: `Size: ${filters.trailerSize}`,
      color: "bg-slate-100 text-slate-800 border-slate-300",
    });
  }

  if (filters.stockNumber) {
    chips.push({
      key: "stockNumber",
      label: `Stock #: ${filters.stockNumber}`,
      color: "bg-slate-100 text-slate-800 border-slate-300",
    });
  }

  if (filters.vin) {
    chips.push({
      key: "vin",
      label: `VIN: ${filters.vin.toUpperCase()}`,
      color: "bg-slate-100 text-slate-800 border-slate-300",
    });
  }

  // Time
  if (filters.createdAfter) {
    chips.push({
      key: "createdAfter",
      label: `Created After: ${filters.createdAfter}`,
      color: "bg-violet-100 text-violet-800 border-violet-300",
    });
  }

  if (filters.createdBefore) {
    chips.push({
      key: "createdBefore",
      label: `Created Before: ${filters.createdBefore}`,
      color: "bg-violet-100 text-violet-800 border-violet-300",
    });
  }

  if (filters.lastContactedAfter) {
    chips.push({
      key: "lastContactedAfter",
      label: `Contacted After: ${filters.lastContactedAfter}`,
      color: "bg-violet-100 text-violet-800 border-violet-300",
    });
  }

  if (filters.lastContactedBefore) {
    chips.push({
      key: "lastContactedBefore",
      label: `Contacted Before: ${filters.lastContactedBefore}`,
      color: "bg-violet-100 text-violet-800 border-violet-300",
    });
  }

  // Quick toggles
  if (filters.neverContacted) {
    chips.push({
      key: "neverContacted",
      label: "Never Contacted",
      color: "bg-rose-100 text-rose-800 border-rose-300",
    });
  }

  if (filters.followUpOverdue) {
    chips.push({
      key: "followUpOverdue",
      label: "Follow-up Overdue",
      color: "bg-orange-100 text-orange-800 border-orange-300",
    });
  }

  // Don't render anything if no filters active
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip, index) => (
        <Badge
          key={`${chip.key}-${chip.value || index}`}
          variant="outline"
          className={`${chip.color} gap-1 pr-1 cursor-pointer hover:opacity-80`}
          onClick={() => onClearFilter(chip.key, chip.value)}
        >
          {chip.label}
          <button
            type="button"
            className="ml-1 rounded-full p-0.5 hover:bg-black/10"
            onClick={(e) => {
              e.stopPropagation();
              onClearFilter(chip.key, chip.value);
            }}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {chips.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
