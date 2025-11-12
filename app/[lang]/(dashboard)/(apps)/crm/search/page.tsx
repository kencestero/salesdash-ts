import { AdvancedSearch } from "@/components/crm/advanced-search";

export default function AdvancedSearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Search</h1>
        <p className="text-muted-foreground mt-2">
          Search and filter customers with advanced criteria
        </p>
      </div>
      <AdvancedSearch />
    </div>
  );
}
