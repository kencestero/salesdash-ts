"use client";

import { useState } from "react";
import { BulkActionsToolbar } from "@/components/crm/bulk-actions-toolbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BulkActionsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Actions</h1>
        <p className="text-muted-foreground mt-2">
          Perform actions on multiple customers at once
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Operations</CardTitle>
          <CardDescription>
            Select customers from the CRM and use this toolbar to perform bulk actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BulkActionsToolbar
            selectedIds={selectedIds}
            onClearSelection={() => setSelectedIds([])}
            onActionComplete={() => {
              setSelectedIds([]);
              // Refresh data logic here
            }}
          />

          <div className="mt-6 text-center text-muted-foreground">
            <p>Go to CRM Dashboard or Pipeline to select customers for bulk actions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
