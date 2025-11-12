"use client";

/**
 * Hot Leads Widget
 * Shows top priority leads requiring immediate attention
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Phone, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HotLead {
  id: string;
  name: string;
  phone: string | null;
  leadScore: number;
  temperature: string;
  status: string;
  daysInStage: number;
  salesRepName: string | null;
}

interface HotLeadsProps {
  leads: HotLead[];
  onLeadClick?: (leadId: string) => void;
}

export function HotLeads({ leads, onLeadClick }: HotLeadsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500" />
          Hot Leads (Score 70+)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leads.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hot leads at the moment
          </p>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-100/50 transition-colors cursor-pointer"
              onClick={() => onLeadClick?.(lead.id)}
            >
              {/* Lead Score */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {lead.leadScore}
                  </span>
                </div>
              </div>

              {/* Lead Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{lead.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {lead.phone && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {lead.phone}
                    </span>
                  )}
                </div>
                {lead.salesRepName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Rep: {lead.salesRepName}
                  </p>
                )}
              </div>

              {/* Metadata */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge className="text-xs bg-red-600 text-white">
                  {lead.status.toUpperCase()}
                </Badge>
                {lead.daysInStage > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {lead.daysInStage}d in stage
                  </span>
                )}
              </div>

              {/* Arrow */}
              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          ))
        )}

        {leads.length > 0 && (
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => {
              // Navigate to pipeline filtered by hot leads
              window.location.href = "/en/crm/pipeline?temperature=hot";
            }}
          >
            View All Hot Leads
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
