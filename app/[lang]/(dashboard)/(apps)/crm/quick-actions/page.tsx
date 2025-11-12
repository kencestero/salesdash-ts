"use client";

import { QuickActions } from "@/components/crm/quick-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuickActionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quick Actions</h1>
        <p className="text-muted-foreground mt-2">
          Fast access to common CRM operations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Quick Actions</CardTitle>
          <CardDescription>
            Perform common tasks quickly without navigating through multiple pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuickActions
            customerId="sample-id"
            customerName="Sample Customer"
            email="sample@example.com"
            phone="555-0123"
          />

          <div className="mt-6 text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Quick Actions include:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Log Call - Record phone conversations</li>
              <li>Send Email - Quick email templates</li>
              <li>Send SMS - Text messaging</li>
              <li>Schedule Meeting - Calendar integration</li>
              <li>Create Task - Set reminders</li>
              <li>Add Note - Quick annotations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
