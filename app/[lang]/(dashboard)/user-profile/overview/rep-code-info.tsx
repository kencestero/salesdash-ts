"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Link as LinkIcon, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface RepCodeInfoProps {
  userProfile: any;
}

export default function RepCodeInfo({ userProfile }: RepCodeInfoProps) {
  const repCode = userProfile?.profile?.repCode;

  if (!repCode) {
    return null; // Don't show if no rep code
  }

  const repLink = `https://mjcargotrailers.com/credit-application/${repCode}`;

  const copyRepCode = () => {
    navigator.clipboard.writeText(repCode);
    toast({
      title: "Copied!",
      description: "Rep code copied to clipboard",
    });
  };

  const copyRepLink = () => {
    navigator.clipboard.writeText(repLink);
    toast({
      title: "Copied!",
      description: "Rep link copied to clipboard",
    });
  };

  const openRepLink = () => {
    window.open(repLink, "_blank");
  };

  return (
    <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg">Your Rep Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-purple-100 mb-2">
            Share this with customers to track your leads
          </p>
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div>
              <p className="text-xs text-purple-100 mb-1">Code</p>
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

        <div className="space-y-2">
          <p className="text-xs text-purple-100">Your tracking link:</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-white break-all font-mono">
              {repLink}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={copyRepCode}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Code
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={copyRepLink}
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={openRepLink}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Preview Credit App Page
        </Button>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mt-2">
          <p className="text-xs text-purple-100">
            💡 <strong>Pro Tip:</strong> Send this link via text, email, or share on social media.
            When customers apply through your link, you'll automatically be credited!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
