"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Search, FileText } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { CopyLinkCelebration } from "@/components/sales/CopyLinkCelebration";
import { RepCodeTutorialCarousel } from "@/components/credit/RepCodeTutorialCarousel";

interface CreditApplication {
  id: string;
  appNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  requestedAmount?: number;
  status: string;
  createdAt: string;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function CreditApplicationsPage() {
  const [repCode, setRepCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState<CreditApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        console.log("User profile data:", data);
        setRepCode(data.profile?.repCode || null);
      } else {
        console.error("Failed to fetch profile:", response.status);
        toast.error("Failed to load rep code");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load rep code");
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/credit-applications");

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load credit applications");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!repCode) {
      toast.error("Rep code not found. Please refresh the page.");
      return;
    }

    const url = `https://remotivetrailers.com/credit-application/${repCode}`;
    navigator.clipboard.writeText(url);

    toast.success("✅ Link Copied!", {
      description: "Credit application link copied to clipboard",
    });

    // Show celebration modal after a short delay
    setTimeout(() => {
      setShowCelebration(true);
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "declined":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "needs_review":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "submitted":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    }
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.appNumber?.toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Rep Code Tutorial Carousel */}
      <RepCodeTutorialCarousel onCopyLink={handleCopyLink} />

      {/* Create Link Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Your Credit Application Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {repCode ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Share this link with customers. All applications submitted through this link will be automatically assigned to you.
              </p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`https://remotivetrailers.com/credit-application/${repCode}`}
                  className="flex-1 font-mono text-sm"
                />
                <Button onClick={handleCopyLink} size="lg" className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`https://remotivetrailers.com/credit-application/${repCode}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Loading your rep code...</p>
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-muted-foreground">
                    {searchQuery ? "No applications found matching your search" : "No credit applications yet"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {searchQuery ? "Try a different search term" : "Applications will appear here when customers submit forms"}
                  </p>
                </div>
              ) : (
                filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">
                          {app.firstName} {app.lastName}
                        </p>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status.replace("_", " ")}
                        </Badge>
                      </div>
                      {!app.email.includes('@placeholder.com') && (
                        <p className="text-sm text-muted-foreground">{app.email}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {app.appNumber}
                        {app.requestedAmount && ` • $${app.requestedAmount.toLocaleString()}`}
                        {" • "}
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/en/credit-applications/${app.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Celebration Modal */}
      <CopyLinkCelebration
        open={showCelebration}
        onOpenChange={setShowCelebration}
        repCode={repCode || ""}
      />
    </div>
  );
}
