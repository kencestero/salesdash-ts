"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function ChatInputBox({ threadId }: { threadId: string }) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  async function handleSend() {
    if (!body.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, body: body.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setBody("");
        toast({
          title: "Message sent",
          description: "Your message has been sent successfully.",
        });
        // Optionally trigger a refresh of messages here
      } else {
        toast({
          title: "Failed to send message",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex gap-2">
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={sending}
        className="flex-1 border border-neutral-700 bg-neutral-900 px-3 py-2 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-500"
        placeholder="Type a message... (Enter to send)"
      />
      <button
        onClick={handleSend}
        disabled={sending || !body.trim()}
        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {sending ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
