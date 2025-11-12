import { DuplicateManager } from "@/components/crm/duplicate-manager";

export default function DuplicatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Duplicate Manager</h1>
        <p className="text-muted-foreground mt-2">
          Detect and merge duplicate customer records
        </p>
      </div>
      <DuplicateManager />
    </div>
  );
}
