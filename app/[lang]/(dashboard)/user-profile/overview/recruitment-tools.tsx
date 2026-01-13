"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Check, Link2, UserPlus } from "lucide-react";

interface RecruitmentToolsProps {
  userRole?: string;
}

export default function RecruitmentTools({ userRole }: RecruitmentToolsProps) {
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Only show for owners and directors
  if (userRole !== "owner" && userRole !== "director") {
    return null;
  }

  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    setCopiedLink(null);
    try {
      const response = await fetch("/api/onboarding/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "rep" }),
      });
      const data = await response.json();
      if (data.success && data.url) {
        await navigator.clipboard.writeText(data.url);
        setCopiedLink("rep");
        toast({
          title: "Link Generated & Copied!",
          description: "The onboarding link has been copied to your clipboard. Valid for 24 hours.",
        });
        setTimeout(() => setCopiedLink(null), 3000);
      } else {
        throw new Error(data.error || "Failed to generate link");
      }
    } catch (error) {
      console.error("Failed to generate link:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate onboarding link",
        variant: "destructive",
      });
    } finally {
      setGeneratingLink(false);
    }
  };

  return (
    <Card className="rounded-2xl border-[#E96114]/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#E96114]" />
          Recruitment Tools
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate unique one-time onboarding links for prospective sales reps
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sales Rep Onboarding */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium">Sales Rep Onboarding</p>
            <p className="text-xs text-muted-foreground">
              Generates a unique link valid for 24 hours
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleGenerateLink}
            disabled={generatingLink}
            className="bg-[#E96114] hover:bg-[#E96114]/90 text-white"
          >
            {generatingLink ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : copiedLink === "rep" ? (
              <>
                <Check className="w-4 h-4 mr-1 text-green-300" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-1" />
                Generate Link
              </>
            )}
          </Button>
        </div>

        {/* Manager Onboarding (Coming Soon) */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg opacity-50">
          <div>
            <p className="font-medium">Manager Onboarding</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
          <Button size="sm" variant="outline" disabled>
            <Link2 className="w-4 h-4 mr-1" />
            Generate Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
