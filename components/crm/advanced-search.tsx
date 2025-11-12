"use client";

/**
 * Advanced Search & Filter Component
 * Complex multi-field search with saved searches
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Filter,
  X,
  Save,
  Star,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export interface SearchFilters {
  searchTerm?: string;
  status?: string[];
  temperature?: string[];
  priority?: string[];
  leadScoreMin?: number;
  leadScoreMax?: number;
  applied?: boolean;
  trailerSize?: string;
  financingType?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  lastActivityAfter?: Date;
  lastActivityBefore?: Date;
  assignedTo?: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  availableReps?: Array<{ id: string; name: string }>;
}

export function AdvancedSearch({
  onSearch,
  onClear,
  availableReps = [],
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<Array<{ name: string; filters: SearchFilters }>>([]);

  function updateFilter<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  }

  function toggleArrayFilter(key: "status" | "temperature" | "priority", value: string) {
    const currentValues = filters[key] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    updateFilter(key, newValues.length > 0 ? newValues : undefined);
  }

  function handleSearch() {
    onSearch(filters);
    setSearchOpen(false);
  }

  function handleClear() {
    setFilters({});
    onClear();
  }

  function saveCurrentSearch() {
    const name = prompt("Name this saved search:");
    if (!name) return;

    const newSavedSearches = [...savedSearches, { name, filters }];
    setSavedSearches(newSavedSearches);

    // Save to localStorage
    localStorage.setItem("crm-saved-searches", JSON.stringify(newSavedSearches));

    toast({
      title: "Search Saved",
      description: `Saved search as "${name}"`,
    });
  }

  function loadSavedSearch(savedFilters: SearchFilters) {
    setFilters(savedFilters);
    onSearch(savedFilters);
    setSearchOpen(false);
  }

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof SearchFilters] !== undefined
  ).length;

  return (
    <div className="flex items-center gap-2">
      {/* Quick Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search leads by name, email, phone..."
          value={filters.searchTerm || ""}
          onChange={(e) => updateFilter("searchTerm", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="pl-9"
        />
      </div>

      {/* Advanced Filters */}
      <Popover open={searchOpen} onOpenChange={setSearchOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] z-[9999]" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Advanced Filters</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={saveCurrentSearch}>
                  <Save className="w-4 h-4 mr-1" />
                  Save Search
                </Button>
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {["new", "contacted", "qualified", "applied", "approved", "won", "dead"].map((status) => (
                  <Badge
                    key={status}
                    variant={filters.status?.includes(status) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter("status", status)}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Temperature Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Temperature
              </label>
              <div className="flex flex-wrap gap-2">
                {["hot", "warm", "cold", "dead"].map((temp) => (
                  <Badge
                    key={temp}
                    variant={filters.temperature?.includes(temp) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter("temperature", temp)}
                  >
                    {temp}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Priority Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <div className="flex flex-wrap gap-2">
                {["urgent", "high", "medium", "low"].map((priority) => (
                  <Badge
                    key={priority}
                    variant={filters.priority?.includes(priority) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter("priority", priority)}
                  >
                    {priority}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Lead Score Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Min Score</label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="100"
                  value={filters.leadScoreMin || ""}
                  onChange={(e) =>
                    updateFilter("leadScoreMin", e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Max Score</label>
                <Input
                  type="number"
                  placeholder="100"
                  min="0"
                  max="100"
                  value={filters.leadScoreMax || ""}
                  onChange={(e) =>
                    updateFilter("leadScoreMax", e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </div>
            </div>

            {/* Applied Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Credit Application
              </label>
              <Select
                value={filters.applied === true ? "yes" : filters.applied === false ? "no" : "all"}
                onValueChange={(value) =>
                  updateFilter("applied", value === "yes" ? true : value === "no" ? false : undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[99999]">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Applied</SelectItem>
                  <SelectItem value="no">Not Applied</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assigned To Filter */}
            {availableReps.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Assigned To</label>
                <Select
                  value={filters.assignedTo || "all"}
                  onValueChange={(value) =>
                    updateFilter("assignedTo", value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[99999]">
                    <SelectItem value="all">All Reps</SelectItem>
                    {availableReps.map((rep) => (
                      <SelectItem key={rep.id} value={rep.id}>
                        {rep.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="ghost" onClick={handleClear} size="sm">
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
              <Button onClick={handleSearch} size="sm">
                <Search className="w-4 h-4 mr-1" />
                Apply Filters
              </Button>
            </div>

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <div className="pt-4 border-t">
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Saved Searches
                </label>
                <div className="space-y-2">
                  {savedSearches.map((saved, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => loadSavedSearch(saved.filters)}
                    >
                      {saved.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
