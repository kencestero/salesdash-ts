"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Envelope } from "@/components/svg";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    profile: {
      avatarUrl: string | null;
      role: string;
    } | null;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
  profile: {
    role: string;
    avatarUrl: string | null;
  } | null;
}

export default function MessagesView({ session }: { session: any }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Compose form state
  const [composeForm, setComposeForm] = useState({
    receiverId: "",
    subject: "",
    message: "",
  });

  // Reply form state
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = (message: Message) => {
    return message.sender.profile?.avatarUrl || message.sender.image || undefined;
  };

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);

    // Mark as read if unread
    if (!message.read) {
      try {
        const response = await fetch(`/api/messages/${message.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        });

        if (response.ok) {
          // Update local state
          setMessages((prev) =>
            prev.map((m) => (m.id === message.id ? { ...m, read: true } : m))
          );
        }
      } catch (error) {
        console.error("Failed to mark message as read:", error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!composeForm.receiverId || !composeForm.message) {
      toast({
        title: "Error",
        description: "Please select a recipient and enter a message",
      });
      return;
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(composeForm),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Message sent successfully",
        });
        setComposeOpen(false);
        setComposeForm({ receiverId: "", subject: "", message: "" });
        fetchMessages();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
      });
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyMessage) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
      });
      return;
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedMessage.senderId,
          subject: selectedMessage.subject
            ? `Re: ${selectedMessage.subject}`
            : "Re: (no subject)",
          message: replyMessage,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Reply sent successfully",
        });
        setReplyOpen(false);
        setReplyMessage("");
        fetchMessages();
      } else {
        throw new Error("Failed to send reply");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Message deleted successfully",
        });
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
      } else {
        throw new Error("Failed to delete message");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
      });
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.sender.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === "all" || (filter === "unread" && !message.read);

    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="flex gap-5 app-height">
      {/* Messages List */}
      <Card className="lg:w-[400px] w-full flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Envelope className="h-6 w-6 text-[#E96114]" />
              <h1 className="text-2xl font-bold">Messages</h1>
              {unreadCount > 0 && (
                <Badge className="bg-[#E96114]">{unreadCount}</Badge>
              )}
            </div>
            <Button
              onClick={() => setComposeOpen(true)}
              className="bg-[#E96114] hover:bg-[#d5550f]"
            >
              <Icon icon="heroicons:plus" className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter("all")}
                className={filter === "all" ? "bg-[#E96114] hover:bg-[#d5550f] text-white border-[#E96114]" : ""}
              >
                All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter("unread")}
                className={filter === "unread" ? "bg-[#E96114] hover:bg-[#d5550f] text-white border-[#E96114]" : ""}
              >
                Unread ({unreadCount})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#E96114] border-r-transparent"></div>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <Envelope className="h-16 w-16 text-default-300 mb-3" />
                <p className="text-sm font-medium text-default-600">
                  {searchQuery || filter === "unread"
                    ? "No messages found"
                    : "No messages yet"}
                </p>
                <p className="text-xs text-default-400 mt-1">
                  {searchQuery || filter === "unread"
                    ? "Try adjusting your filters"
                    : "Your inbox is empty"}
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleSelectMessage(message)}
                  className={cn(
                    "flex items-start gap-3 p-4 cursor-pointer hover:bg-default-100 dark:hover:bg-default-200 border-b transition-colors",
                    {
                      "bg-default-50 dark:bg-default-100":
                        selectedMessage?.id === message.id,
                      "bg-primary/5": !message.read,
                    }
                  )}
                >
                  <Avatar className="h-10 w-10 mt-1">
                    <AvatarImage
                      src={getAvatarUrl(message)}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-[#E96114] text-white font-semibold">
                      {getInitials(message.sender.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-semibold text-sm truncate">
                        {message.sender.name || message.sender.email}
                      </div>
                      <div className="text-xs text-default-600 whitespace-nowrap">
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                    {message.subject && (
                      <div className="text-sm font-medium text-default-700 truncate mb-1">
                        {message.subject}
                      </div>
                    )}
                    <div className="text-xs text-default-600 line-clamp-2">
                      {message.message}
                    </div>
                  </div>
                  {!message.read && (
                    <div className="w-2 h-2 rounded-full bg-[#E96114] mt-2"></div>
                  )}
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Detail */}
      <Card className="flex-1 hidden lg:flex flex-col">
        {selectedMessage ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={getAvatarUrl(selectedMessage)}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-[#E96114] text-white font-semibold">
                      {getInitials(selectedMessage.sender.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">
                      {selectedMessage.sender.name || selectedMessage.sender.email}
                    </h2>
                    <p className="text-sm text-default-600">
                      {selectedMessage.sender.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {selectedMessage.sender.profile?.role}
                      </Badge>
                      <span className="text-xs text-default-500">
                        {formatDate(selectedMessage.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReplyOpen(true)}
                  >
                    <Icon icon="heroicons:arrow-uturn-left" className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Icon icon="heroicons:trash" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {selectedMessage.subject && (
                <>
                  <Separator className="my-4" />
                  <h3 className="text-lg font-semibold">
                    {selectedMessage.subject}
                  </h3>
                </>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-6">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </ScrollArea>
            </CardContent>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Envelope className="h-24 w-24 text-default-300 mb-4" />
            <h3 className="text-lg font-semibold text-default-700 mb-2">
              No Message Selected
            </h3>
            <p className="text-sm text-default-500">
              Select a message from the list to view its contents
            </p>
          </div>
        )}
      </Card>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Send a message to another user in the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select
                value={composeForm.receiverId}
                onValueChange={(value) =>
                  setComposeForm({ ...composeForm, receiverId: value })
                }
              >
                <SelectTrigger id="recipient">
                  <SelectValue placeholder="Select a recipient" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>{user.name || user.email}</span>
                        <Badge variant="outline" className="text-xs">
                          {user.profile?.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter subject (optional)"
                value={composeForm.subject}
                onChange={(e) =>
                  setComposeForm({ ...composeForm, subject: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message"
                rows={8}
                value={composeForm.message}
                onChange={(e) =>
                  setComposeForm({ ...composeForm, message: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              className="bg-[#E96114] hover:bg-[#d5550f]"
            >
              <Icon icon="heroicons:paper-airplane" className="h-4 w-4 mr-1" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.sender.name}</DialogTitle>
            <DialogDescription>
              {selectedMessage?.subject
                ? `Re: ${selectedMessage.subject}`
                : "Re: (no subject)"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reply">Your Reply</Label>
              <Textarea
                id="reply"
                placeholder="Enter your reply"
                rows={8}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReply}
              className="bg-[#E96114] hover:bg-[#d5550f]"
            >
              <Icon icon="heroicons:paper-airplane" className="h-4 w-4 mr-1" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
