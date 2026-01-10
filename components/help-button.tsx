"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { HelpCircle, ExternalLink, PlayCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface HelpButtonProps {
  section: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
}

interface HelpContent {
  section: string;
  title: string;
  content: string;
  rules?: string;
  videoUrl?: string;
}

export function HelpButton({
  section,
  className = "",
  size = "icon",
  variant = "ghost"
}: HelpButtonProps) {
  const [help, setHelp] = useState<HelpContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !help) {
      fetchHelp();
    }
  }, [open, section]);

  const fetchHelp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/help?section=${encodeURIComponent(section)}`);
      if (res.ok) {
        const data = await res.json();
        setHelp(data);
      }
    } catch (err) {
      console.error("Failed to fetch help:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`text-default-400 hover:text-[#E96114] ${className}`}
          title="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#E96114]" />
            {help?.title || "Help"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-default-400">
            Loading help content...
          </div>
        ) : help ? (
          <div className="space-y-4">
            {/* Main Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{help.content}</ReactMarkdown>
            </div>

            {/* Rules Section */}
            {help.rules && (
              <div className="border-t pt-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{help.rules}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Video Link */}
            {help.videoUrl && (
              <div className="border-t pt-4">
                <a
                  href={help.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#E96114] hover:underline"
                >
                  <PlayCircle className="w-5 h-5" />
                  Watch Tutorial Video
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-default-400">
            No help content available for this section.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default HelpButton;
