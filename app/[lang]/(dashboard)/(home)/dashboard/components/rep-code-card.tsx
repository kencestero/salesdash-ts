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
    const link = `https://mjcargotrailers.com/credit-application/${repCode}`;
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
      <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Your Rep Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-purple-100 mb-2">
              Welcome back, {firstName}!
            </p>
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div>
                <p className="text-xs text-purple-100 mb-1">Your Code</p>
                <p className="text-2xl font-bold tracking-wider">{repCode}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={copyRepCode}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={copyRepCode}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Code
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={copyRepLink}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>

          <p className="text-xs text-purple-100">
            Share this link with customers to track leads:
            <br />
            <span className="text-white font-medium break-all">
              mjcargotrailers.com/credit-application/{repCode}
            </span>
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
