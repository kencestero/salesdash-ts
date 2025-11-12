"use client";

/**
 * Lead Card Component
 * Individual draggable card for the pipeline Kanban board
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, Flame, Snowflake, ThermometerSun, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LeadCardData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  salesRepName?: string | null;
  assignedToName?: string | null;
  status: string; // "new", "contacted", "qualified", "applied", "approved", "won", "dead"
  leadScore: number;
  temperature: string;
  priority: string;
  daysInStage: number;
  trailerSize?: string | null;
  financingType?: string | null;
  applied?: boolean;
}

interface LeadCardProps {
  lead: LeadCardData;
  isDragging?: boolean;
  onClick?: () => void;
}

export function LeadCard({ lead, isDragging, onClick }: LeadCardProps) {
  const fullName = `${lead.firstName} ${lead.lastName}`;
  const initials = `${lead.firstName[0] || ''}${lead.lastName[0] || ''}`.toUpperCase();

  // Temperature colors and icons
  const temperatureConfig = {
    hot: {
      color: "bg-red-500/10 text-red-700 border-red-500/20",
      icon: <Flame className="w-3 h-3" />,
      label: "Hot",
    },
    warm: {
      color: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      icon: <ThermometerSun className="w-3 h-3" />,
      label: "Warm",
    },
    cold: {
      color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      icon: <Snowflake className="w-3 h-3" />,
      label: "Cold",
    },
    dead: {
      color: "bg-gray-500/10 text-gray-700 border-gray-500/20",
      icon: <Skull className="w-3 h-3" />,
      label: "Dead",
    },
  };

  const temp = temperatureConfig[lead.temperature as keyof typeof temperatureConfig] || temperatureConfig.warm;

  // Priority colors
  const priorityColors = {
    urgent: "bg-red-600 text-white",
    high: "bg-orange-600 text-white",
    medium: "bg-blue-600 text-white",
    low: "bg-gray-600 text-white",
  };

  const priorityColor = priorityColors[lead.priority as keyof typeof priorityColors] || priorityColors.medium;

  // Score color gradient
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-red-600 font-bold";
    if (score >= 40) return "text-orange-600 font-semibold";
    if (score >= 20) return "text-blue-600";
    return "text-gray-600";
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg",
        "border-l-4",
        lead.temperature === "hot" && "border-l-red-500",
        lead.temperature === "warm" && "border-l-orange-500",
        lead.temperature === "cold" && "border-l-blue-500",
        lead.temperature === "dead" && "border-l-gray-500",
        isDragging && "opacity-50 rotate-2",
        lead.applied && "ring-2 ring-green-500"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Avatar + Name + Score */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{fullName}</p>
              {lead.salesRepName && (
                <p className="text-xs text-muted-foreground truncate">
                  Rep: {lead.salesRepName}
                </p>
              )}
            </div>
          </div>

          {/* Lead Score Badge */}
          <div className="flex-shrink-0">
            <div className={cn("text-lg font-bold", getScoreColor(lead.leadScore))}>
              {lead.leadScore}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-1">
          {lead.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{lead.phone}</span>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
        </div>

        {/* Tags: Temperature, Priority, Applied */}
        <div className="flex flex-wrap gap-1.5">
          {/* Temperature Badge */}
          <Badge variant="outline" className={cn("text-xs", temp.color)}>
            {temp.icon}
            <span className="ml-1">{temp.label}</span>
          </Badge>

          {/* Priority Badge */}
          <Badge className={cn("text-xs", priorityColor)}>
            {lead.priority.toUpperCase()}
          </Badge>

          {/* Applied Badge */}
          {lead.applied && (
            <Badge className="text-xs bg-green-600 text-white">
              ✓ Applied
            </Badge>
          )}

          {/* Days in Stage */}
          {lead.daysInStage > 0 && (
            <Badge variant="outline" className="text-xs">
              {lead.daysInStage}d
            </Badge>
          )}
        </div>

        {/* Trailer Info */}
        {(lead.trailerSize || lead.financingType) && (
          <div className="pt-2 border-t space-y-1">
            {lead.trailerSize && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Trailer:</span> {lead.trailerSize}
              </p>
            )}
            {lead.financingType && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Finance:</span>{" "}
                {lead.financingType.toUpperCase()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
