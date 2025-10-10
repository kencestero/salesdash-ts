"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CreditApplicationsPage() {
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateNewLink = async () => {
    // Generate a unique share token
    const token = `${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    setShareToken(token);

    toast.success("Application link created!");
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/en/apply/${shareToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const applications = [
    {
      id: "1",
      appNumber: "APP-2025-001",
      customerName: "John Smith",
      email: "john@example.com",
      status: "pending",
      requestedAmount: 25000,
      createdAt: new Date("2025-01-10"),
    },
    {
      id: "2",
      appNumber: "APP-2025-002",
      customerName: "Sarah Johnson",
      email: "sarah@example.com",
      status: "approved",
      requestedAmount: 18500,
      createdAt: new Date("2025-01-09"),
    },
    {
      id: "3",
      appNumber: "APP-2025-003",
      customerName: "Mike Davis",
      email: "mike@example.com",
      status: "needs_review",
      requestedAmount: 32000,
      createdAt: new Date("2025-01-08"),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "declined":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "needs_review":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    }
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.appNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Credit Applications</h1>
        <p className="text-muted-foreground mt-2">
          Create shareable application links and manage submissions
        </p>
      </div>

      {/* Create Link Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Application Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!shareToken ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Generate a unique link to share with customers. They can fill out the credit
                application without needing to log in.
              </p>
              <Button onClick={handleCreateNewLink} size="lg" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create New Link
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium">Your shareable link:</p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/en/apply/${shareToken}`}
                  className="flex-1 font-mono text-sm"
                />
                <Button onClick={handleCopyLink} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/en/apply/${shareToken}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <Button
                onClick={handleCreateNewLink}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Generate Another Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or application number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredApplications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No applications found matching your search.
              </p>
            ) : (
              filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{app.customerName}</p>
                      <Badge className={getStatusColor(app.status)}>
                        {app.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{app.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {app.appNumber} • ${app.requestedAmount.toLocaleString()} •{" "}
                      {app.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
