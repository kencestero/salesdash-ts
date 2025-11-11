"use client";

import { useEffect, useState } from "react";
import { Envelope } from "@/components/svg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import shortImage from "@/public/images/all-img/short-image.png";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const Inbox = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
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
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get avatar URL - prioritize uploaded avatar, fallback to OAuth image
  const getAvatarUrl = (message: Message) => {
    return message.sender.profile?.avatarUrl || message.sender.image || undefined;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative md:h-9 md:w-9 h-8 w-8 hover:bg-default-100 dark:hover:bg-default-200
          data-[state=open]:bg-default-100  dark:data-[state=open]:bg-default-200
           hover:text-primary text-default-500 dark:text-default-800  rounded-full "
        >
          <Envelope className="h-5 w-5 " />
          {unreadCount > 0 && (
            <Badge className="w-4 h-4 p-0 text-xs  font-medium  items-center justify-center absolute left-[calc(100%-18px)] bottom-[calc(100%-16px)] ring-2 ring-primary-foreground">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className=" z-[999] mx-4 lg:w-[412px] p-0"
      >
        <DropdownMenuLabel
          style={{ backgroundImage: `url(${shortImage.src})` }}
          className="w-full h-full bg-cover bg-no-repeat p-4 flex items-center"
        >
          <span className="text-base font-semibold text-white flex-1">
            Messages
          </span>
          <Link
            href="/en/messages"
            className="text-xs font-medium text-white flex-0 hover:underline hover:decoration-default-100 dark:decoration-default-900"
          >
            View All
          </Link>
        </DropdownMenuLabel>
        <div className="h-[350px] xl:h-[420px]">
          <ScrollArea className="h-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Envelope className="h-12 w-12 text-default-300 mb-3" />
                <p className="text-sm font-medium text-default-600">No messages yet</p>
                <p className="text-xs text-default-400 mt-1">Your inbox is empty</p>
              </div>
            ) : (
              messages.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  className="flex gap-9 py-2 px-4 cursor-pointer dark:hover:bg-background rounded-none"
                >
                  <div className="flex-1 flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={getAvatarUrl(item)}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-[#E96114] text-white font-semibold">
                        {getInitials(item.sender.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-default-900 mb-[2px] whitespace-nowrap">
                        {item.sender.name || item.sender.email}
                      </div>
                      <div className="text-xs text-default-900 truncate max-w-[100px] lg:max-w-[185px]">
                        {item.subject || item.message}
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-xs font-medium whitespace-nowrap",
                      {
                        "text-default-900": !item.read,
                        "text-default-600": item.read,
                      }
                    )}
                  >
                    {formatDate(item.createdAt)}
                  </div>
                  <div
                    className={cn("w-2 h-2 rounded-full mr-2", {
                      "bg-primary": !item.read,
                    })}
                  ></div>
                </DropdownMenuItem>
              ))
            )}
          </ScrollArea>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Inbox;
