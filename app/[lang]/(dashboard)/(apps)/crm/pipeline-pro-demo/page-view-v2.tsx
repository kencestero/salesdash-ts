"use client";

import { useState } from "react";
import { LeadCardProV2 } from "@/components/crm/lead-card-pro-v2";
import { LeadsTableView } from "@/components/crm/leads-table-view";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, LayoutGrid, Table as TableIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Enhanced mock data with full addresses
const mockLeads = [
  {
    id: "1",
    firstName: "Tony",
    lastName: "Ross",
    salesRepName: "John Doe",
    phone: "555-0123",
    email: "tony.ross@example.com",
    address: "1234 Main Street",
    city: "Dallas",
    state: "TX",
    zipcode: "75201",
    source: "Website",
    lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastContactMethod: "phone" as const,
    nextFollowUpDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    temperature: "hot" as const,
    priority: "urgent" as const,
    leadScore: 87,
    daysInStage: 5,
    deals: [
      { value: 28000, status: "negotiating" },
      { value: 17000, status: "pending" },
    ],
    activityCount: 12,
    creditAppStatus: "applied" as const,
    tags: ["First-time", "Hot-lead", "Commercial", "Urgent"],
    trailerInfo: "8.5x20 Enclosed",
    notes: "Very interested in purchasing 2 enclosed trailers for business expansion. Budget is flexible. Prefers black exterior. Wants delivery ASAP.",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    salesRepName: "Sarah Connor",
    phone: "555-0102",
    email: "jane.smith@example.com",
    address: "567 Oak Avenue",
    city: "Austin",
    state: "TX",
    zipcode: "78701",
    source: "Facebook",
    lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastContactMethod: "email" as const,
    nextFollowUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    temperature: "warm" as const,
    priority: "high" as const,
    leadScore: 72,
    daysInStage: 3,
    deals: [{ value: 28500, status: "qualified" }],
    activityCount: 8,
    creditAppStatus: "not_applied" as const,
    tags: ["Returning", "Pre-qualified"],
    trailerInfo: "7x16 Open",
    notes: "Looking to upgrade from current trailer. Interested in financing options. Will decide by end of week.",
  },
  {
    id: "3",
    firstName: "Bob",
    lastName: "Brown",
    salesRepName: "Mike Wilson",
    phone: "555-0105",
    email: "bob.brown@example.com",
    address: "890 Pine Road",
    city: "Houston",
    state: "TX",
    zipcode: "77001",
    source: "Phone Call",
    lastContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastContactMethod: "phone" as const,
    nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    temperature: "cold" as const,
    priority: "medium" as const,
    leadScore: 45,
    daysInStage: 1,
    deals: [],
    activityCount: 3,
    creditAppStatus: "not_applied" as const,
    tags: ["First-time", "Personal Use"],
    trailerInfo: "6x12 Enclosed",
    notes: "Just browsing options. Not in a rush. Wants to compare prices with other dealers first.",
  },
  {
    id: "4",
    firstName: "Maria",
    lastName: "Garcia",
    salesRepName: "John Doe",
    phone: "555-0198",
    email: "maria.garcia@example.com",
    address: "321 Elm Street Suite 100",
    city: "San Antonio",
    state: "TX",
    zipcode: "78205",
    source: "Email",
    lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastContactMethod: "email" as const,
    nextFollowUpDate: new Date(),
    temperature: "warm" as const,
    priority: "high" as const,
    leadScore: 68,
    daysInStage: 4,
    deals: [
      { value: 32000, status: "proposal" },
      { value: 15000, status: "negotiating" },
    ],
    activityCount: 15,
    creditAppStatus: "approved" as const,
    tags: ["Business Owner", "Multiple Units", "Approved"],
    trailerInfo: "8.5x24 Enclosed",
    notes: "Business owner looking to expand fleet. Credit already approved. Ready to close within 48 hours. Needs 3 trailers total.",
  },
];

export default function PipelineProDemoViewV2() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const handleCall = (customerId: string, notes: string, outcome: string) => {
    console.log("Call logged:", { customerId, notes, outcome });
    toast({
      title: "Call Logged Successfully",
      description: `Notes: ${notes.substring(0, 50)}... • Outcome: ${outcome}`,
    });
  };

  const handleEmail = (customerId: string) => {
    console.log("Email sent:", customerId);
    toast({
      title: "Email Sent",
      description: "Email details automatically saved to activity log",
    });
  };

  const handleSMS = (customerId: string) => {
    console.log("SMS sent:", customerId);
    toast({
      title: "SMS Sent",
      description: "Message details automatically saved to activity log",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">CRM Pipeline - Professional Demo V2</h1>
            <Badge className="bg-primary text-primary-foreground">
              <Sparkles className="w-3 h-3 mr-1" />
              NEW
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Enhanced with theme colors, horizontal cards, and table view toggle
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "cards" ? undefined : "outline"}
            onClick={() => setViewMode("cards")}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Card View
          </Button>
          <Button
            variant={viewMode === "table" ? undefined : "outline"}
            onClick={() => setViewMode("table")}
            className="gap-2"
          >
            <TableIcon className="w-4 h-4" />
            Table View
          </Button>
        </div>
      </div>

      {/* What's New Card */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            What's New in V2
          </CardTitle>
          <CardDescription>
            All your requested enhancements have been implemented
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Enhanced Features:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ Full address display (street, city, state, zip)</li>
                <li>✓ Phone, email, and address all visible on cards</li>
                <li>✓ "More" button opens full customer details popup</li>
                <li>✓ Horizontal card layout (1 per row, information-rich)</li>
                <li>✓ Table view toggle for compact display</li>
                <li>✓ Theme-based colors (no more bright colors)</li>
                <li>✓ Dark mode compatible throughout</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Call Notes Feature:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ Required notes popup when clicking Call button</li>
                <li>✓ Dropdown: Spoke / Voicemail / Unable to reach</li>
                <li>✓ Notes field is mandatory with validation</li>
                <li>✓ Red/orange warning messages for required fields</li>
                <li>✓ Date/time automatically logged</li>
                <li>✓ Email & SMS auto-save to activity log (no popup)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead Display - Cards or Table */}
      {viewMode === "cards" ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Sample Lead Cards (Horizontal Layout)</h2>
          <div className="space-y-4">
            {mockLeads.map((lead) => (
              <LeadCardProV2
                key={lead.id}
                customer={lead}
                onCall={(notes, outcome) => handleCall(lead.id, notes, outcome)}
                onEmail={() => handleEmail(lead.id)}
                onSMS={() => handleSMS(lead.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Sample Leads (Table View)</h2>
          <LeadsTableView
            leads={mockLeads}
            onCall={handleCall}
            onEmail={handleEmail}
            onSMS={handleSMS}
          />
        </div>
      )}

      {/* Implementation Notes */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg">Implementation Complete</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div>
            <h4 className="font-semibold mb-2">What's Working:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Click <strong>Call</strong> button → Required notes popup with dropdown</li>
              <li>Click <strong>Email</strong> or <strong>SMS</strong> → Auto-logs to activity (no popup)</li>
              <li>Click <strong>More</strong> → Full customer details dialog with tabs</li>
              <li>Toggle between Card View and Table View</li>
              <li>All colors use theme variables (compatible with your DashTail theme)</li>
              <li>Horizontal cards show maximum information at a glance</li>
              <li>Phone/email/address all clickable</li>
            </ul>
          </div>

          <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
            <p className="font-semibold mb-1">Next Steps:</p>
            <p className="text-muted-foreground">
              1. Review the design and functionality<br />
              2. Test call logging, email, SMS, and More dialogs<br />
              3. Toggle between card and table views<br />
              4. Once approved, we can integrate this into your production pipeline
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
