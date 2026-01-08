"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Send,
  Loader2,
  User,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Inbox,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface ThreadSummary {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  subject: string | null;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  unreadForRep: boolean;
  portalToken: string;
}

interface Message {
  id: string;
  direction: string;
  channel: string;
  fromName: string | null;
  bodyText: string;
  createdAt: string;
  isCustomer: boolean;
}

interface ThreadDetail {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerStatus: string;
  repName: string;
  subject: string | null;
  portalToken: string;
  portalUrl: string;
  lastMessageAt: string;
  messages: Message[];
}

export default function MessagesInboxPage() {
  const searchParams = useSearchParams();
  const selectedThreadId = searchParams.get("thread");

  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedThread?.messages]);

  // Fetch threads
  const fetchThreads = async () => {
    try {
      const response = await fetch("/api/crm/threads");
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific thread
  const fetchThread = async (threadId: string) => {
    setLoadingThread(true);
    try {
      const response = await fetch(`/api/crm/threads/${threadId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedThread(data.thread);
        // Update unread status in list
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId ? { ...t, unreadForRep: false } : t
          )
        );
      }
    } catch (error) {
      console.error("Error fetching thread:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    } finally {
      setLoadingThread(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  // Load thread from URL param
  useEffect(() => {
    if (selectedThreadId) {
      fetchThread(selectedThreadId);
    }
  }, [selectedThreadId]);

  // Send reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedThread || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/crm/threads/${selectedThread.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Add new message to thread
      setSelectedThread((prev) =>
        prev
          ? {
              ...prev,
              messages: [
                ...prev.messages,
                {
                  ...data.message,
                  isCustomer: false,
                },
              ],
            }
          : prev
      );

      // Update thread in list
      setThreads((prev) =>
        prev.map((t) =>
          t.id === selectedThread.id
            ? {
                ...t,
                lastMessageAt: new Date().toISOString(),
                lastMessagePreview: reply.trim().substring(0, 200),
              }
            : t
        )
      );

      setReply("");
      toast({
        title: "Sent",
        description: "Your reply has been sent",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Copy portal link
  const copyPortalLink = () => {
    if (selectedThread?.portalUrl) {
      navigator.clipboard.writeText(selectedThread.portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Reply link copied to clipboard",
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="h-[calc(100vh-120px)] flex">
      {/* Thread List */}
      <div className="w-80 border-r border-default-200 flex flex-col bg-default-50">
        <div className="p-4 border-b border-default-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Messages</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="rounded-full text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchThreads}
            className="h-8 w-8"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Inbox className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Customer replies will appear here
              </p>
            </div>
          ) : (
            <div>
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => fetchThread(thread.id)}
                  className={cn(
                    "w-full p-4 text-left border-b border-default-100 hover:bg-default-100 transition-colors",
                    selectedThread?.id === thread.id && "bg-default-100",
                    thread.unreadForRep && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-medium truncate",
                            thread.unreadForRep && "font-bold"
                          )}
                        >
                          {thread.customerName}
                        </span>
                        {thread.unreadForRep && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {thread.lastMessagePreview || "No messages"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDate(thread.lastMessageAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thread Detail */}
      <div className="flex-1 flex flex-col">
        {loadingThread ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : selectedThread ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-default-200 bg-default-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Link
                      href={`/en/crm/customers/${selectedThread.customerId}`}
                      className="font-semibold hover:underline"
                    >
                      {selectedThread.customerName}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {selectedThread.customerEmail && (
                        <span>{selectedThread.customerEmail}</span>
                      )}
                      {selectedThread.customerPhone && (
                        <>
                          <span>•</span>
                          <span>{selectedThread.customerPhone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPortalLink}
                    className="gap-2"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    Copy Reply Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={selectedThread.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Preview
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedThread.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.isCustomer ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-3",
                      msg.isCustomer
                        ? "bg-default-100 text-foreground rounded-bl-md"
                        : "bg-primary text-primary-foreground rounded-br-md"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          msg.isCustomer
                            ? "text-muted-foreground"
                            : "text-primary-foreground/80"
                        )}
                      >
                        {msg.fromName || (msg.isCustomer ? "Customer" : "You")}
                        {msg.channel === "PORTAL" && msg.isCustomer && (
                          <span className="ml-1 opacity-70">(via portal)</span>
                        )}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.bodyText}
                    </p>
                    <div
                      className={cn(
                        "flex items-center gap-1 mt-2 text-xs",
                        msg.isCustomer
                          ? "text-muted-foreground"
                          : "text-primary-foreground/70"
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {formatFullDate(msg.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Form */}
            <div className="p-4 border-t border-default-200 bg-default-50">
              <form onSubmit={handleSendReply} className="flex gap-3">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 resize-none min-h-[44px] max-h-[120px]"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={!reply.trim() || sending}
                  className="h-auto px-6"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-default-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Select a conversation</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Choose a conversation from the list to view messages and reply to
              customers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
