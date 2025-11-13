"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MessageSquare,
  MoreHorizontal,
  MapPin,
  Globe,
  Facebook,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Flame,
  Thermometer,
  Snowflake,
  Skull,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CallNotesDialog } from "./call-notes-dialog";
import { CustomerDetailsDialog } from "./customer-details-dialog";
import { toast } from "@/components/ui/use-toast";

interface LeadCardProV2Props {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    salesRepName: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    source?: string;
    lastContactDate?: Date;
    lastContactMethod?: "phone" | "email" | "sms";
    nextFollowUpDate?: Date;
    temperature: "hot" | "warm" | "cold" | "dead";
    priority: "urgent" | "high" | "medium" | "low";
    leadScore: number;
    daysInStage: number;
    deals?: { value: number; status: string }[];
    activityCount: number;
    creditAppStatus: "not_applied" | "applied" | "approved" | "declined";
    tags?: string[];
    trailerInfo?: string;
    notes?: string;
  };
  onCall?: (notes: string, outcome: string) => void;
  onEmail?: () => void;
  onSMS?: () => void;
}

export function LeadCardProV2({ customer, onCall, onEmail, onSMS }: LeadCardProV2Props) {
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Calculate urgency
  const getUrgency = () => {
    if (!customer.nextFollowUpDate) return "none";
    const now = new Date();
    const followUp = new Date(customer.nextFollowUpDate);
    const diffDays = Math.ceil((followUp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "overdue";
    if (diffDays <= 1) return "due-soon";
    return "on-track";
  };

  const urgency = getUrgency();

  // Get initials
  const initials = `${customer.firstName[0]}${customer.lastName[0]}`.toUpperCase();

  // Temperature styling with theme colors
  const temperatureConfig = {
    hot: {
      border: "border-l-destructive",
      bg: "bg-destructive/10",
      text: "text-destructive",
      icon: Flame,
      label: "HOT",
    },
    warm: {
      border: "border-l-orange-500",
      bg: "bg-orange-100 dark:bg-orange-950",
      text: "text-orange-600 dark:text-orange-400",
      icon: Thermometer,
      label: "WARM",
    },
    cold: {
      border: "border-l-primary",
      bg: "bg-primary/10",
      text: "text-primary",
      icon: Snowflake,
      label: "COLD",
    },
    dead: {
      border: "border-l-muted-foreground",
      bg: "bg-muted",
      text: "text-muted-foreground",
      icon: Skull,
      label: "DEAD",
    },
  };

  const tempConfig = temperatureConfig[customer.temperature];
  const TempIcon = tempConfig.icon;

  // Urgency indicator styling with theme colors
  const urgencyConfig = {
    overdue: { dot: "bg-destructive", text: "text-destructive", label: "OVERDUE" },
    "due-soon": { dot: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", label: "DUE SOON" },
    "on-track": { dot: "bg-green-500", text: "text-green-600 dark:text-green-400", label: "ON TRACK" },
    none: { dot: "bg-muted-foreground", text: "text-muted-foreground", label: "NO DATE" },
  };

  const urgConfig = urgencyConfig[urgency as keyof typeof urgencyConfig];

  // Calculate total deal value
  const totalDealValue = customer.deals?.reduce((sum, deal) => sum + deal.value, 0) || 0;

  // Format dates
  const formatDate = (date?: Date) => {
    if (!date) return "Not set";
    const d = new Date(date);
    const diffDays = Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatNextDate = (date?: Date) => {
    if (!date) return "Not set";
    const d = new Date(date);
    const diffDays = Math.ceil((d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday (Overdue)";
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays < 7) return `In ${diffDays} days`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Lead score color with theme
  const scoreColor =
    customer.leadScore >= 70
      ? "text-primary"
      : customer.leadScore >= 50
      ? "text-orange-600 dark:text-orange-400"
      : customer.leadScore >= 30
      ? "text-blue-600 dark:text-blue-400"
      : "text-muted-foreground";

  // Source icon
  const getSourceIcon = () => {
    if (!customer.source) return Globe;
    const source = customer.source.toLowerCase();
    if (source.includes("facebook")) return Facebook;
    if (source.includes("phone")) return Phone;
    if (source.includes("email")) return Mail;
    return Globe;
  };

  const SourceIcon = getSourceIcon();

  const handleCallSubmit = (notes: string, outcome: string) => {
    if (onCall) {
      onCall(notes, outcome);
    }
    toast({
      title: "Call Logged",
      description: `Call notes saved successfully for ${customer.firstName} ${customer.lastName}`,
    });
  };

  const handleEmail = () => {
    if (onEmail) {
      onEmail();
    }
    toast({
      title: "Email Sent",
      description: `Email automatically logged with full details`,
    });
  };

  const handleSMS = () => {
    if (onSMS) {
      onSMS();
    }
    toast({
      title: "SMS Sent",
      description: `Message automatically logged with full details`,
    });
  };

  return (
    <>
      <div
        className={cn(
          "group relative bg-card rounded-lg border-l-4 shadow-sm transition-all duration-300",
          "hover:shadow-md hover:-translate-y-0.5",
          tempConfig.border
        )}
      >
        {/* Urgency Pulse Indicator */}
        {urgency === "overdue" && (
          <div className="absolute top-4 right-4">
            <div className={cn("w-3 h-3 rounded-full animate-pulse", urgConfig.dot)} />
          </div>
        )}

        <div className="p-5">
          {/* Header Row - Avatar, Name, Contact Info, Quick Actions */}
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <Avatar className={cn("h-16 w-16", tempConfig.bg)}>
              <AvatarFallback className={cn("text-xl font-bold", tempConfig.text)}>
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Name & Rep Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-foreground truncate">
                {customer.firstName} {customer.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">Rep: {customer.salesRepName}</p>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-2 min-w-[250px]">
              {customer.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-medium">{customer.phone}</span>
                </a>
              )}
              {customer.email && (
                <a
                  href={`mailto:${customer.email}`}
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors truncate"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="font-medium truncate">{customer.email}</span>
                </a>
              )}
              {(customer.address || customer.city) && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="font-medium">
                    {customer.address && <>{customer.address}, </>}
                    {customer.city}, {customer.state} {customer.zipcode}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground"
                onClick={() => setCallDialogOpen(true)}
              >
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground"
                onClick={handleEmail}
              >
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground"
                onClick={handleSMS}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                SMS
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => setDetailsDialogOpen(true)}
              >
                <MoreHorizontal className="w-4 h-4 mr-1" />
                More
              </Button>
            </div>
          </div>

          {/* Content Row - Location, Follow-up, Deals, Stats */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left Column - Location & Source */}
            <div className="col-span-2 space-y-2">
              {customer.city && customer.state && (
                <Badge variant="outline" className="w-full justify-start">
                  <MapPin className="w-3 h-3 mr-1" />
                  {customer.city}, {customer.state}
                </Badge>
              )}
              {customer.source && (
                <Badge variant="outline" className="w-full justify-start">
                  <SourceIcon className="w-3 h-3 mr-1" />
                  {customer.source}
                </Badge>
              )}
            </div>

            {/* Middle-Left - Contact Timeline */}
            <div className="col-span-3 space-y-2">
              <div className="text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {customer.lastContactMethod === "phone" && <Phone className="w-3.5 h-3.5" />}
                  {customer.lastContactMethod === "email" && <Mail className="w-3.5 h-3.5" />}
                  {customer.lastContactMethod === "sms" && <MessageSquare className="w-3.5 h-3.5" />}
                  <span>Last: {formatDate(customer.lastContactDate)}</span>
                </div>
              </div>
              <div className="text-sm">
                <div className={cn("flex items-center gap-2 font-semibold", urgConfig.text)}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next: {formatNextDate(customer.nextFollowUpDate)}</span>
                </div>
              </div>
            </div>

            {/* Middle - Deal Info */}
            <div className="col-span-3 flex items-center justify-center bg-muted/50 rounded-md p-3">
              <div className="text-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{customer.deals?.length || 0} Deal{customer.deals?.length !== 1 ? "s" : ""}</span>
                </div>
                {totalDealValue > 0 && (
                  <p className="text-2xl font-bold text-primary">
                    ${totalDealValue.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Middle-Right - Activity & Status */}
            <div className="col-span-2 space-y-2">
              <Badge variant="outline" className="w-full justify-start">
                <TrendingUp className="w-3 h-3 mr-1" />
                {customer.activityCount} activities
              </Badge>
              {customer.creditAppStatus === "applied" && (
                <Badge variant="outline" className="w-full justify-start bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Applied
                </Badge>
              )}
              {customer.creditAppStatus === "approved" && (
                <Badge variant="outline" className="w-full justify-start bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Approved
                </Badge>
              )}
              {customer.trailerInfo && (
                <Badge variant="outline" className="w-full justify-start">
                  {customer.trailerInfo}
                </Badge>
              )}
            </div>

            {/* Right - Score & Temperature */}
            <div className="col-span-2 flex flex-col items-end justify-center gap-2">
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs", tempConfig.bg, tempConfig.text)}>
                  <TempIcon className="w-3 h-3 mr-1" />
                  {tempConfig.label}
                </Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={cn("text-4xl font-bold", scoreColor)}>{customer.leadScore}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {customer.daysInStage} day{customer.daysInStage !== 1 ? "s" : ""} in stage
              </p>
            </div>
          </div>

          {/* Tags Row */}
          {customer.tags && customer.tags.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {customer.tags.slice(0, 5).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {customer.tags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{customer.tags.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CallNotesDialog
        open={callDialogOpen}
        onOpenChange={setCallDialogOpen}
        customerName={`${customer.firstName} ${customer.lastName}`}
        customerPhone={customer.phone}
        onSubmit={handleCallSubmit}
      />

      <CustomerDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        customer={customer}
      />
    </>
  );
}
