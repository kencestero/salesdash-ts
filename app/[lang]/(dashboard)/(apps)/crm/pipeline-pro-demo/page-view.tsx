"use client";

import { LeadCardPro } from "@/components/crm/lead-card-pro";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Mock data for demonstration
const mockLeads = [
  {
    id: "1",
    firstName: "Tony",
    lastName: "Ross",
    salesRepName: "John Doe",
    city: "Dallas",
    state: "TX",
    source: "Website",
    lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    lastContactMethod: "phone" as const,
    nextFollowUpDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days overdue
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
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    salesRepName: "Sarah Connor",
    city: "Austin",
    state: "TX",
    source: "Facebook",
    lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    lastContactMethod: "email" as const,
    nextFollowUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    temperature: "warm" as const,
    priority: "high" as const,
    leadScore: 72,
    daysInStage: 3,
    deals: [{ value: 28500, status: "qualified" }],
    activityCount: 8,
    creditAppStatus: "not_applied" as const,
    tags: ["Returning", "Pre-qualified"],
    trailerInfo: "7x16 Open",
  },
  {
    id: "3",
    firstName: "Bob",
    lastName: "Brown",
    salesRepName: "Mike Wilson",
    city: "Houston",
    state: "TX",
    source: "Phone Call",
    lastContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    lastContactMethod: "phone" as const,
    nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
    temperature: "cold" as const,
    priority: "medium" as const,
    leadScore: 45,
    daysInStage: 1,
    deals: [],
    activityCount: 3,
    creditAppStatus: "not_applied" as const,
    tags: ["First-time", "Personal Use"],
    trailerInfo: "6x12 Enclosed",
  },
  {
    id: "4",
    firstName: "Maria",
    lastName: "Garcia",
    salesRepName: "John Doe",
    city: "San Antonio",
    state: "TX",
    source: "Email",
    lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    lastContactMethod: "email" as const,
    nextFollowUpDate: new Date(), // Today
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
  },
];

export default function PipelineProDemoView() {
  const handleCall = (name: string) => {
    toast({
      title: "Call Action",
      description: `Initiating call to ${name}...`,
    });
  };

  const handleEmail = (name: string) => {
    toast({
      title: "Email Action",
      description: `Opening email composer for ${name}...`,
    });
  };

  const handleSMS = (name: string) => {
    toast({
      title: "SMS Action",
      description: `Opening SMS composer for ${name}...`,
    });
  };

  const handleView = (name: string) => {
    toast({
      title: "View Details",
      description: `Opening full profile for ${name}...`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">CRM Pipeline - Professional Demo</h1>
          <Badge className="bg-[#E96114] text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            NEW
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Option 2: Professional Redesign - Hover over cards to reveal quick actions
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-[#E96114] border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E96114]" />
            What's New in This Design
          </CardTitle>
          <CardDescription>
            This demo showcases the professional CRM pipeline redesign with enhanced information density and actionable insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-gray-700">Enhanced Information:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Last contact date & method (phone/email/SMS)</li>
                <li>✓ Next follow-up with urgency indicators</li>
                <li>✓ Deal count and total value display</li>
                <li>✓ Activity count tracking</li>
                <li>✓ Location and lead source badges</li>
                <li>✓ Multiple tags with overflow handling</li>
                <li>✓ Trailer information display</li>
                <li>✓ Credit application status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-700">Visual Enhancements:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Quick action buttons (hover to reveal)</li>
                <li>✓ Urgency pulse indicators for overdue items</li>
                <li>✓ Color-coded borders by temperature</li>
                <li>✓ Professional spacing and dividers</li>
                <li>✓ Larger, more prominent lead scores</li>
                <li>✓ Icon-first design for quick scanning</li>
                <li>✓ Contextual color coding (red = overdue)</li>
                <li>✓ Smooth hover animations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span>Overdue Follow-up</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Due Soon (0-1 day)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>On Track (2+ days)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-500" />
              <span className="text-red-600">Hot Lead Border</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-orange-500" />
              <span className="text-orange-600">Warm Lead Border</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-400" />
              <span className="text-blue-600">Cold Lead Border</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead Cards Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Sample Lead Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockLeads.map((lead) => (
            <LeadCardPro
              key={lead.id}
              customer={lead}
              onCall={() => handleCall(`${lead.firstName} ${lead.lastName}`)}
              onEmail={() => handleEmail(`${lead.firstName} ${lead.lastName}`)}
              onSMS={() => handleSMS(`${lead.firstName} ${lead.lastName}`)}
              onView={() => handleView(`${lead.firstName} ${lead.lastName}`)}
            />
          ))}
        </div>
      </div>

      {/* Implementation Notes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700">
          <p className="mb-3">
            This is a demonstration page showcasing the professional redesign. To implement this in your production pipeline:
          </p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Replace the existing <code className="bg-white px-2 py-1 rounded">lead-card.tsx</code> component with <code className="bg-white px-2 py-1 rounded">lead-card-pro.tsx</code></li>
            <li>Update the API calls in <code className="bg-white px-2 py-1 rounded">pipeline/page-view.tsx</code> to fetch additional fields (city, state, source, lastContactMethod)</li>
            <li>Ensure your database schema includes the new fields referenced in this demo</li>
            <li>Test thoroughly with real data before deploying to production</li>
            <li>Consider adding user preferences for card density (compact/comfortable/spacious)</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
