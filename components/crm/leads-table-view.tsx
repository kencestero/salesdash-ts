"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Flame,
  Thermometer,
  Snowflake,
  Skull,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CallNotesDialog } from "./call-notes-dialog";
import { CustomerDetailsDialog } from "./customer-details-dialog";
import { toast } from "@/components/ui/use-toast";

interface LeadsTableViewProps {
  leads: Array<{
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
  }>;
  onCall?: (customerId: string, notes: string, outcome: string) => void;
  onEmail?: (customerId: string) => void;
  onSMS?: (customerId: string) => void;
}

export function LeadsTableView({ leads, onCall, onEmail, onSMS }: LeadsTableViewProps) {
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<typeof leads[0] | null>(null);

  const temperatureConfig = {
    hot: { icon: Flame, color: "text-destructive", bg: "bg-destructive/10", label: "HOT" },
    warm: { icon: Thermometer, color: "text-orange-600", bg: "bg-orange-100", label: "WARM" },
    cold: { icon: Snowflake, color: "text-primary", bg: "bg-primary/10", label: "COLD" },
    dead: { icon: Skull, color: "text-muted-foreground", bg: "bg-muted", label: "DEAD" },
  };

  const handleCallClick = (lead: typeof leads[0]) => {
    setSelectedLead(lead);
    setCallDialogOpen(true);
  };

  const handleMoreClick = (lead: typeof leads[0]) => {
    setSelectedLead(lead);
    setDetailsDialogOpen(true);
  };

  const handleCallSubmit = (notes: string, outcome: string) => {
    if (selectedLead && onCall) {
      onCall(selectedLead.id, notes, outcome);
    }
    toast({
      title: "Call Logged",
      description: `Call notes saved for ${selectedLead?.firstName} ${selectedLead?.lastName}`,
    });
  };

  const handleEmailClick = (lead: typeof leads[0]) => {
    if (onEmail) {
      onEmail(lead.id);
    }
    toast({
      title: "Email Sent",
      description: `Email logged for ${lead.firstName} ${lead.lastName}`,
    });
  };

  const handleSMSClick = (lead: typeof leads[0]) => {
    if (onSMS) {
      onSMS(lead.id);
    }
    toast({
      title: "SMS Sent",
      description: `Message logged for ${lead.firstName} ${lead.lastName}`,
    });
  };

  const getTotalDealValue = (deals?: { value: number }[]) => {
    return deals?.reduce((sum, deal) => sum + deal.value, 0) || 0;
  };

  const formatDate = (date?: Date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-center">Temp</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-right">Deal Value</TableHead>
              <TableHead className="text-center">Activities</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const initials = `${lead.firstName[0]}${lead.lastName[0]}`.toUpperCase();
              const tempConfig = temperatureConfig[lead.temperature];
              const TempIcon = tempConfig.icon;
              const totalValue = getTotalDealValue(lead.deals);

              return (
                <TableRow key={lead.id} className="hover:bg-muted/50">
                  {/* Customer */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className={cn("h-10 w-10", tempConfig.bg)}>
                        <AvatarFallback className={cn("text-sm font-bold", tempConfig.color)}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">Rep: {lead.salesRepName}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-primary">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </a>
                      )}
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-primary truncate max-w-[150px]">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{lead.email}</span>
                        </a>
                      )}
                    </div>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <div className="text-sm">
                      {lead.city && lead.state ? (
                        <>{lead.city}, {lead.state}</>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Temperature */}
                  <TableCell className="text-center">
                    <Badge className={cn("text-xs", tempConfig.bg, tempConfig.color)}>
                      <TempIcon className="w-3 h-3 mr-1" />
                      {tempConfig.label}
                    </Badge>
                  </TableCell>

                  {/* Score */}
                  <TableCell className="text-center">
                    <span className={cn(
                      "text-xl font-bold",
                      lead.leadScore >= 70 ? "text-primary" :
                      lead.leadScore >= 50 ? "text-orange-600" :
                      lead.leadScore >= 30 ? "text-blue-600" :
                      "text-muted-foreground"
                    )}>
                      {lead.leadScore}
                    </span>
                  </TableCell>

                  {/* Deal Value */}
                  <TableCell className="text-right">
                    {totalValue > 0 ? (
                      <span className="font-semibold text-primary">
                        ${totalValue.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  {/* Activities */}
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {lead.activityCount}
                    </Badge>
                  </TableCell>

                  {/* Last Contact */}
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(lead.lastContactDate)}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleCallClick(lead)}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEmailClick(lead)}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSMSClick(lead)}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 w-8 p-0"
                        onClick={() => handleMoreClick(lead)}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {selectedLead && (
        <>
          <CallNotesDialog
            open={callDialogOpen}
            onOpenChange={setCallDialogOpen}
            customerName={`${selectedLead.firstName} ${selectedLead.lastName}`}
            customerPhone={selectedLead.phone}
            onSubmit={handleCallSubmit}
          />

          <CustomerDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            customer={selectedLead}
          />
        </>
      )}
    </>
  );
}
