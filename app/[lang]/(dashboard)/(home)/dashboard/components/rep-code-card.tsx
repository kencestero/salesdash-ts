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
      <Card className="bg-gradient-to-r from-[#E96114] to-[#ff7a2e] text-white border-0 w-[85%] mx-auto shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Rep Code Display */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 opacity-90" />
                <span className="text-sm font-medium opacity-90">Rep Code:</span>
              </div>
              <div className="font-mono text-xl font-bold tracking-wide bg-white/10 px-4 py-1.5 rounded-md backdrop-blur-sm">
                {repCode}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-9 px-4 font-medium"
                onClick={copyRepCode}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="bg-white hover:bg-white/90 text-[#E96114] hover:text-[#E96114] h-9 px-4 font-semibold"
                onClick={copyRepLink}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>
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
