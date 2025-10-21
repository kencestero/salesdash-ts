"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Link as LinkIcon, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { CopyLinkCelebration } from "@/components/sales/CopyLinkCelebration";

export default function RepCodeCard() {
  const [repCode, setRepCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetchRepCode();
  }, []);

  const fetchRepCode = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      setRepCode(data.profile?.repCode || null);
      setFirstName(data.profile?.firstName || data.user?.name || "");
    } catch (error) {
      console.error('Error fetching rep code:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyRepCode = () => {
    if (!repCode) return;
    navigator.clipboard.writeText(repCode);
    toast({
      title: "Copied!",
      description: "Rep code copied to clipboard",
    });
  };

  const copyRepLink = () => {
    if (!repCode) return;
    const link = `https://mjsalesdash.com/credit-application/${repCode}`;
    navigator.clipboard.writeText(link);

    // Show success toast
    toast({
      title: "✅ Link Copied!",
      description: "Credit application link copied to clipboard",
    });

    // Trigger celebration modal after short delay
    setTimeout(() => {
      setShowCelebration(true);
    }, 500);
  };

  if (loading) {
    return null; // Don't show while loading
  }

  if (!repCode) {
    return null; // Don't show if no rep code
  }

  return (
    <>
      <Card className="bg-primary text-primary-foreground border-0 max-w-sm">
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4" />
            Your Rep Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-2">
            <div>
              <p className="text-xs opacity-80">Your Code</p>
              <p className="text-lg font-bold tracking-wider">{repCode}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="hover:bg-primary-foreground/20 h-8 w-8 p-0"
              onClick={copyRepCode}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20 h-8 text-xs"
              onClick={copyRepCode}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy Code
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20 h-8 text-xs"
              onClick={copyRepLink}
            >
              <LinkIcon className="w-3 h-3 mr-1" />
              Copy Link
            </Button>
          </div>

          <p className="text-xs opacity-80 leading-tight">
            mjsalesdash.com/credit-application/{repCode}
          </p>
        </CardContent>
      </Card>

      {/* Celebration Modal */}
      <CopyLinkCelebration
        open={showCelebration}
        onOpenChange={setShowCelebration}
        repCode={repCode || ""}
      />
    </>
  );
}
