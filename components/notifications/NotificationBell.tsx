"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

const NOTIFICATION_ICONS: Record<string, string> = {
  CUSTOMER_ASSIGNED: "heroicons:user-plus",
  CREDIT_APP_SUBMITTED: "heroicons:document-text",
  CREDIT_APP_APPROVED: "heroicons:check-circle",
  CREDIT_APP_DECLINED: "heroicons:x-circle",
  FOLLOW_UP_DUE: "heroicons:clock",
  DUPLICATE_DETECTED: "heroicons:exclamation-triangle",
  STATUS_CHANGED: "heroicons:arrow-path",
  SYSTEM_ANNOUNCEMENT: "heroicons:megaphone",
  TIP: "heroicons:light-bulb",
  MEETING: "heroicons:calendar",
  NEW_FEATURE: "heroicons:sparkles",
  WELCOME: "heroicons:hand-raised",
};

const NOTIFICATION_COLORS: Record<string, string> = {
  CUSTOMER_ASSIGNED: "text-blue-500",
  CREDIT_APP_APPROVED: "text-green-500",
  CREDIT_APP_DECLINED: "text-red-500",
  FOLLOW_UP_DUE: "text-yellow-500",
  DUPLICATE_DETECTED: "text-orange-500",
  STATUS_CHANGED: "text-purple-500",
  SYSTEM_ANNOUNCEMENT: "text-[#E96114]",
  TIP: "text-cyan-500",
};

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const seenNotificationIds = useRef<Set<string>>(new Set());
  const isInitialFetch = useRef(true);

  const showToastForNotification = (notification: Notification) => {
    toast({
      title: notification.title,
      description: notification.message,
    });
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=10");
      if (response.ok) {
        const data = await response.json();
        const newNotifications: Notification[] = data.notifications || [];

        // Show toasts for new unread notifications (but not on initial load)
        if (!isInitialFetch.current) {
          newNotifications.forEach((notification) => {
            if (!notification.read && !seenNotificationIds.current.has(notification.id)) {
              showToastForNotification(notification);
            }
          });
        }

        // Update seen IDs
        newNotifications.forEach((n) => seenNotificationIds.current.add(n.id));
        isInitialFetch.current = false;

        setNotifications(newNotifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refresh when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
        >
          <Icon icon="heroicons:bell" className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E96114] text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={loading}
              className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Icon icon="heroicons:bell-slash" className="h-8 w-8 mb-2" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "flex gap-3 p-3 cursor-pointer",
                  !notification.read && "bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 mt-0.5",
                    NOTIFICATION_COLORS[notification.type] || "text-gray-500"
                  )}
                >
                  <Icon
                    icon={NOTIFICATION_ICONS[notification.type] || "heroicons:bell"}
                    className="h-5 w-5"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", !notification.read && "text-foreground")}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <span className="h-2 w-2 rounded-full bg-[#E96114] block" />
                  </div>
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                router.push("/user-profile/settings");
                setIsOpen(false);
              }}
              className="justify-center py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
