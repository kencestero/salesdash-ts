"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  User,
  Clock,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  direction: string;
  fromName: string | null;
  bodyText: string;
  createdAt: string;
  isCustomer: boolean;
}

interface ThreadData {
  id: string;
  subject: string | null;
  customerName: string;
  repName: string;
  repPhone: string | null;
  messages: Message[];
}

export default function ReplyPortalPage() {
  const params = useParams();
  const token = params.token as string;

  const [thread, setThread] = useState<ThreadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread?.messages]);

  useEffect(() => {
    async function loadThread() {
      try {
        const response = await fetch(`/api/reply-portal/${token}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load conversation");
        }

        const data = await response.json();
        setThread(data.thread);
      } catch (err: any) {
        console.error("Error loading thread:", err);
        setError(err.message || "Failed to load conversation");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadThread();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/reply-portal/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      // Add optimistic update
      const newMessage: Message = {
        id: `temp-${Date.now()}`,
        direction: "INBOUND",
        fromName: thread?.customerName || "You",
        bodyText: message.trim(),
        createdAt: new Date().toISOString(),
        isCustomer: true,
      };

      setThread((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, newMessage] }
          : prev
      );

      setMessage("");
      setSent(true);

      // Reset sent state after 3 seconds
      setTimeout(() => setSent(false), 3000);
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#E96114] mb-4" />
          <p className="text-lg text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error && !thread) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to Load Conversation
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact your sales
            representative directly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#E96114] to-[#09213C] rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">
                  Remotive Logistics
                </h1>
                <p className="text-sm text-gray-500">
                  Chat with {thread?.repName || "your representative"}
                </p>
              </div>
            </div>
            {thread?.repPhone && (
              <a
                href={`tel:${thread.repPhone}`}
                className="flex items-center gap-2 text-sm text-[#E96114] hover:underline"
              >
                <Phone className="w-4 h-4" />
                {thread.repPhone}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="space-y-4 mb-6">
          {thread?.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.isCustomer ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  msg.isCustomer
                    ? "bg-[#E96114] text-white rounded-br-md"
                    : "bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-md"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {!msg.isCustomer && (
                    <div className="w-6 h-6 bg-[#09213C] rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span
                    className={cn(
                      "text-xs font-medium",
                      msg.isCustomer ? "text-orange-100" : "text-gray-500"
                    )}
                  >
                    {msg.fromName || (msg.isCustomer ? "You" : "Sales Rep")}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.bodyText}
                </p>
                <div
                  className={cn(
                    "flex items-center gap-1 mt-2 text-xs",
                    msg.isCustomer ? "text-orange-200" : "text-gray-400"
                  )}
                >
                  <Clock className="w-3 h-3" />
                  {formatDate(msg.createdAt)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Success toast */}
        {sent && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle2 className="w-4 h-4" />
            Message sent!
          </div>
        )}

        {/* Error alert */}
        {error && thread && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </main>

      {/* Reply form - fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex gap-3"
        >
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 resize-none min-h-[44px] max-h-[120px]"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={!message.trim() || sending}
            className="bg-[#E96114] hover:bg-[#d55812] h-auto px-6"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

      {/* Bottom padding for fixed form */}
      <div className="h-32" />
    </div>
  );
}
