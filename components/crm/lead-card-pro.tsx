"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
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
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadCardProProps {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    salesRepName: string;
    city?: string;
    state?: string;
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
  };
  onCall?: () => void;
  onEmail?: () => void;
  onSMS?: () => void;
  onView?: () => void;
}

export function LeadCardPro({ customer, onCall, onEmail, onSMS, onView }: LeadCardProProps) {
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

  // Temperature styling
  const temperatureConfig = {
    hot: {
      border: "border-red-500",
      bg: "bg-red-100",
      text: "text-red-600",
      icon: Flame,
      label: "HOT",
    },
    warm: {
      border: "border-orange-500",
      bg: "bg-orange-100",
      text: "text-orange-600",
      icon: Thermometer,
      label: "WARM",
    },
    cold: {
      border: "border-blue-400",
      bg: "bg-blue-100",
      text: "text-blue-600",
      icon: Snowflake,
      label: "COLD",
    },
    dead: {
      border: "border-gray-400",
      bg: "bg-gray-100",
      text: "text-gray-600",
      icon: Skull,
      label: "DEAD",
    },
  };

  const tempConfig = temperatureConfig[customer.temperature];
  const TempIcon = tempConfig.icon;

  // Priority styling
  const priorityConfig = {
    urgent: { bg: "bg-red-100", text: "text-red-700", label: "URGENT" },
    high: { bg: "bg-orange-100", text: "text-orange-700", label: "HIGH" },
    medium: { bg: "bg-blue-100", text: "text-blue-700", label: "MEDIUM" },
    low: { bg: "bg-gray-100", text: "text-gray-700", label: "LOW" },
  };

  const prioConfig = priorityConfig[customer.priority];

  // Urgency indicator styling
  const urgencyConfig = {
    overdue: { dot: "bg-red-500", text: "text-red-600", badge: "bg-red-100 text-red-700", label: "OVERDUE" },
    "due-soon": { dot: "bg-orange-500", text: "text-orange-600", badge: "bg-orange-100 text-orange-700", label: "DUE SOON" },
    "on-track": { dot: "bg-green-500", text: "text-green-600", badge: "bg-green-100 text-green-700", label: "ON TRACK" },
    none: { dot: "bg-gray-300", text: "text-gray-600", badge: "bg-gray-100 text-gray-700", label: "NO DATE" },
  };

  const urgConfig = urgencyConfig[urgency as keyof typeof urgencyConfig];

  // Calculate total deal value
  const totalDealValue = customer.deals?.reduce((sum, deal) => sum + deal.value, 0) || 0;

  // Format dates
  const formatDate = (date?: Date) => {
    if (!date) return "Not set";
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatNextDate = (date?: Date) => {
    if (!date) return "Not set";
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday (Overdue)";
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays < 7) return `In ${diffDays} days`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Lead score color
  const scoreColor =
    customer.leadScore >= 70
      ? "text-[#E96114]"
      : customer.leadScore >= 50
      ? "text-orange-600"
      : customer.leadScore >= 30
      ? "text-blue-600"
      : "text-gray-600";

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

  return (
    <div
      className={cn(
        "group relative bg-white rounded-lg p-4 border-l-4 shadow-md transition-all duration-300",
        "hover:shadow-2xl hover:-translate-y-1",
        tempConfig.border
      )}
    >
      {/* Urgency Pulse Indicator */}
      {urgency === "overdue" && (
        <div className="absolute top-3 right-3">
          <div className={cn("w-3 h-3 rounded-full animate-pulse", urgConfig.dot)} />
        </div>
      )}
      {urgency === "due-soon" && (
        <div className="absolute top-3 right-3">
          <div className={cn("w-3 h-3 rounded-full", urgConfig.dot)} />
        </div>
      )}

      {/* Header with Avatar */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className={cn("h-12 w-12", tempConfig.bg)}>
            <AvatarFallback className={cn("text-lg font-bold", tempConfig.text)}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              {customer.firstName} {customer.lastName}
            </h3>
            <p className="text-sm text-gray-500">Rep: {customer.salesRepName}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions (visible on hover) */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 mb-3">
        <Button
          size="sm"
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          onClick={onCall}
        >
          <Phone className="w-3.5 h-3.5 mr-1" />
          Call
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          onClick={onEmail}
        >
          <Mail className="w-3.5 h-3.5 mr-1" />
          Email
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          onClick={onSMS}
        >
          <MessageSquare className="w-3.5 h-3.5 mr-1" />
          SMS
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="flex-1"
          onClick={onView}
        >
          <ArrowRight className="w-3.5 h-3.5 mr-1" />
          View
        </Button>
      </div>

      {/* Location & Source */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {customer.city && customer.state && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <MapPin className="w-3 h-3 mr-1" />
            {customer.city}, {customer.state}
          </Badge>
        )}
        {customer.source && (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <SourceIcon className="w-3 h-3 mr-1" />
            {customer.source}
          </Badge>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-3" />

      {/* Contact Timeline */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center gap-2">
            {customer.lastContactMethod === "phone" && <Phone className="w-3.5 h-3.5 text-blue-500" />}
            {customer.lastContactMethod === "email" && <Mail className="w-3.5 h-3.5 text-green-500" />}
            {customer.lastContactMethod === "sms" && <MessageSquare className="w-3.5 h-3.5 text-orange-500" />}
            {!customer.lastContactMethod && <Phone className="w-3.5 h-3.5 text-gray-400" />}
            Last: {formatDate(customer.lastContactDate)}
          </span>
          <span className="text-gray-400 text-xs">
            {customer.lastContactDate && new Date(customer.lastContactDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className={cn("font-semibold flex items-center gap-2", urgConfig.text)}>
            <Clock className="w-3.5 h-3.5" />
            Next: {formatNextDate(customer.nextFollowUpDate)}
          </span>
          <Badge className={cn("text-xs", urgConfig.badge)}>{urgConfig.label}</Badge>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-3" />

      {/* Deal Information */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-gray-900">
            {customer.deals && customer.deals.length > 0
              ? `${customer.deals.length} Deal${customer.deals.length > 1 ? "s" : ""}`
              : "No deals yet"}
          </span>
        </div>
        {totalDealValue > 0 && (
          <span className="text-lg font-bold text-green-600">
            ${totalDealValue.toLocaleString()}
          </span>
        )}
      </div>

      {/* Activity & Status */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <Badge variant="outline" className="bg-gray-50 text-gray-700">
          <TrendingUp className="w-3 h-3 mr-1" />
          {customer.activityCount} activities
        </Badge>
        {customer.creditAppStatus === "applied" && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Applied
          </Badge>
        )}
        {customer.creditAppStatus === "approved" && (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )}
        {customer.trailerInfo && (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            {customer.trailerInfo}
          </Badge>
        )}
      </div>

      {/* Tags */}
      {customer.tags && customer.tags.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {customer.tags.slice(0, 3).map((tag, index) => {
            const colors = [
              "bg-orange-100 text-orange-700",
              "bg-red-100 text-red-700",
              "bg-yellow-100 text-yellow-700",
              "bg-green-100 text-green-700",
              "bg-blue-100 text-blue-700",
              "bg-purple-100 text-purple-700",
              "bg-pink-100 text-pink-700",
            ];
            return (
              <Badge key={index} className={cn("text-xs", colors[index % colors.length])}>
                {tag}
              </Badge>
            );
          })}
          {customer.tags.length > 3 && (
            <Badge variant="outline" className="text-xs text-gray-600">
              +{customer.tags.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-3" />

      {/* Bottom Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={cn("text-xs", tempConfig.bg, tempConfig.text)}>
            <TempIcon className="w-3 h-3 mr-1" />
            {tempConfig.label}
          </Badge>
          <Badge className={cn("text-xs", prioConfig.bg, prioConfig.text)}>
            {prioConfig.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-3xl font-bold", scoreColor)}>{customer.leadScore}</span>
          <span className="text-sm text-gray-500">/100</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">
        {customer.daysInStage} day{customer.daysInStage !== 1 ? "s" : ""} in stage
      </p>
    </div>
  );
}
