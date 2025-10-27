"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function ReplyBox({ requestId }: { requestId: string }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  async function handleSend() {
    if (!message.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/send-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, message }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Reply sent",
          description: "Your reply has been sent successfully.",
        });
        setMessage("");
      } else {
        toast({
          title: "Failed to send reply",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your reply..."
        rows={3}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500 resize-none"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white ring-1 ring-orange-500/40 hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? (
            <span className="inline-flex items-center gap-2">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 animate-spin"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.25"
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
              Sending...
            </span>
          ) : (
            "Send Reply"
          )}
        </button>
      </div>
    </div>
  );
}
