"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface RepCodeInfoProps {
  userProfile: any;
}

export default function RepCodeInfo({ userProfile }: RepCodeInfoProps) {
  const repCode = userProfile?.profile?.repCode;

  if (!repCode) {
    return null; // Don't show if no rep code
  }

  const copyRepCode = () => {
    navigator.clipboard.writeText(repCode);
    toast({
      title: "Copied!",
      description: "Rep code copied to clipboard",
    });
  };

  return (
    <Card className="bg-gradient-to-br from-[#E96114] to-[#09213C] text-white border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg">Your Rep Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-orange-100 mb-2">
            Use this code to track your leads
          </p>
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div>
              <p className="text-xs text-orange-100 mb-1">Code</p>
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

        <Button
          size="sm"
          variant="outline"
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={copyRepCode}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Code
        </Button>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mt-2">
          <p className="text-xs text-orange-100">
            Your rep code links customers to you when they apply through Remotive.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
