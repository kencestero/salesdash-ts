"use client";

/**
 * Pipeline Column Component
 * Represents a single status column in the Kanban board
 */

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SortableLeadCard } from "./sortable-lead-card";
import type { LeadCardData } from "./lead-card";

interface PipelineColumnProps {
  id: string;
  title: string;
  leads: LeadCardData[];
  color: string;
  count: number;
  onLeadClick: (leadId: string) => void;
}

export function PipelineColumn({
  id,
  title,
  leads,
  color,
  count,
  onLeadClick,
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const leadIds = leads.map((lead) => lead.id);

  return (
    <div className="flex flex-col h-full min-w-[320px] w-full">
      {/* Column Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-t-lg border-b-2",
          color
        )}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm uppercase tracking-wide">
            {title}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </div>
      </div>

      {/* Droppable Area */}
      <Card
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-t-none overflow-y-auto p-3 space-y-3 min-h-[200px] transition-colors",
          isOver && "bg-primary/5 ring-2 ring-primary"
        )}
      >
        <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <SortableLeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadClick(lead.id)}
            />
          ))}
        </SortableContext>

        {/* Empty State */}
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No leads in this stage
          </div>
        )}
      </Card>
    </div>
  );
}
