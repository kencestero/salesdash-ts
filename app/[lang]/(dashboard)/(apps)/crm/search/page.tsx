"use client";

import { AdvancedSearch, SearchFilters } from "@/components/crm/advanced-search";
import { toast } from "@/components/ui/use-toast";

export default function AdvancedSearchPage() {
  const handleSearch = (filters: SearchFilters) => {
    console.log("Search filters:", filters);
    toast({
      title: "Search executed",
      description: "Search results would appear here in a full implementation",
    });
  };

  const handleClear = () => {
    console.log("Filters cleared");
    toast({
      title: "Filters cleared",
      description: "All search filters have been reset",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Search</h1>
        <p className="text-muted-foreground mt-2">
          Search and filter customers with advanced criteria
        </p>
      </div>
      <AdvancedSearch onSearch={handleSearch} onClear={handleClear} />
    </div>
  );
}
