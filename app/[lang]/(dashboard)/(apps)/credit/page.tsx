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

    const url = `https://remotivelogistics.com/get-approved?rep=${repCode}`;
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

      {/* Create Link Card - VIBRANT DESIGN */}
      <Card className="border-4 border-[#E96114] bg-gradient-to-br from-[#E96114]/20 via-[#09213C]/30 to-[#E96114]/10 shadow-2xl shadow-[#E96114]/20 overflow-hidden relative">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#E96114]/10 via-transparent to-[#E96114]/10 animate-pulse" />

        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-[#E96114] rounded-full shadow-lg shadow-[#E96114]/50">
              <Copy className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-3xl font-extrabold bg-gradient-to-r from-[#E96114] to-orange-400 bg-clip-text text-transparent">
            🔗 Your Credit Application Link
          </CardTitle>
          <p className="text-center text-lg text-muted-foreground mt-2 font-medium">
            ⬆️ The illustrations above show how this link works for your customers ⬆️
          </p>
        </CardHeader>
        <CardContent className="space-y-6 relative pt-4">
          {repCode ? (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-xl p-4 text-center">
                <p className="text-lg font-semibold text-green-400">
                  ✅ Share this link with customers — All applications will be assigned to YOU automatically!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  readOnly
                  value={`https://remotivelogistics.com/get-approved?rep=${repCode}`}
                  className="flex-1 font-mono text-base sm:text-lg h-14 border-2 border-[#E96114]/50 bg-background/80 font-semibold"
                />
                <Button
                  onClick={handleCopyLink}
                  size="lg"
                  className="h-14 px-8 text-lg font-bold gap-3 bg-gradient-to-r from-[#E96114] to-orange-500 hover:from-[#E96114] hover:to-orange-400 shadow-lg shadow-[#E96114]/40 transition-all hover:scale-105"
                >
                  <Copy className="h-6 w-6" />
                  📋 COPY LINK
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-4 border-2 border-[#E96114]/50 hover:bg-[#E96114]/20"
                  asChild
                >
                  <Link href={`https://remotivelogistics.com/get-approved?rep=${repCode}`} target="_blank">
                    <ExternalLink className="h-6 w-6" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#E96114] border-r-transparent"></div>
              <p className="text-lg text-muted-foreground mt-4">Loading your rep code...</p>
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
