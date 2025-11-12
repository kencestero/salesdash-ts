"use client";

/**
 * Sortable Lead Card Wrapper
 * Makes LeadCard draggable using @dnd-kit
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LeadCard, type LeadCardData } from "./lead-card";

interface SortableLeadCardProps {
  lead: LeadCardData;
  onClick: () => void;
}

export function SortableLeadCard({ lead, onClick }: SortableLeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <LeadCard lead={lead} isDragging={isDragging} onClick={onClick} />
    </div>
  );
}
