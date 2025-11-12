"use client";

/**
 * CRM Pipeline Board
 * Drag-and-drop Kanban board for lead management
 */

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { PipelineColumn } from "./pipeline-column";
import { LeadCard, type LeadCardData } from "./lead-card";
import { toast } from "@/components/ui/use-toast";

interface PipelineBoardProps {
  leads: LeadCardData[];
  onStatusChange: (leadId: string, newStatus: string) => Promise<void>;
  onLeadClick: (leadId: string) => void;
}

// Pipeline stages configuration
const PIPELINE_STAGES = [
  { id: "new", title: "New", color: "bg-gray-100 border-gray-300" },
  { id: "contacted", title: "Contacted", color: "bg-blue-100 border-blue-300" },
  { id: "qualified", title: "Qualified", color: "bg-purple-100 border-purple-300" },
  { id: "applied", title: "Applied", color: "bg-orange-100 border-orange-300" },
  { id: "approved", title: "Approved", color: "bg-green-100 border-green-300" },
  { id: "won", title: "Won", color: "bg-emerald-100 border-emerald-300" },
  { id: "dead", title: "Dead", color: "bg-red-100 border-red-300" },
];

export function PipelineBoard({
  leads,
  onStatusChange,
  onLeadClick,
}: PipelineBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group leads by status
  const groupedLeads = useMemo(() => {
    const groups: Record<string, LeadCardData[]> = {};

    PIPELINE_STAGES.forEach((stage) => {
      groups[stage.id] = leads.filter((lead) => lead.status === stage.id);
    });

    // Handle leads with statuses not in PIPELINE_STAGES
    leads.forEach((lead) => {
      if (!groups[lead.status]) {
        groups["new"] = groups["new"] || [];
        groups["new"].push(lead);
      }
    });

    return groups;
  }, [leads]);

  // Get the active lead being dragged
  const activeLead = useMemo(
    () => (activeId ? leads.find((lead) => lead.id === activeId) : null),
    [activeId, leads]
  );

  // Handle drag start
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  // Handle drag over (optional: for visual feedback)
  function handleDragOver(event: DragOverEvent) {
    // Could add optimistic UI updates here
  }

  // Handle drag end - update lead status
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const leadId = active.id as string;
    const newStatus = over.id as string;

    // Find the lead's current status
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) {
      setActiveId(null);
      return;
    }

    // If status changed, update via API
    if (lead.status !== newStatus) {
      setIsUpdating(true);

      try {
        await onStatusChange(leadId, newStatus);

        toast({
          title: "Status Updated",
          description: `Lead moved to ${PIPELINE_STAGES.find((s) => s.id === newStatus)?.title}`,
        });
      } catch (error) {
        console.error("Failed to update lead status:", error);

        toast({
          title: "Update Failed",
          description: "Could not update lead status. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUpdating(false);
      }
    }

    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <PipelineColumn
            key={stage.id}
            id={stage.id}
            title={stage.title}
            leads={groupedLeads[stage.id] || []}
            color={stage.color}
            count={(groupedLeads[stage.id] || []).length}
            onLeadClick={onLeadClick}
          />
        ))}
      </div>

      {/* Drag Overlay - shows the card being dragged */}
      <DragOverlay>
        {activeLead ? (
          <div className="cursor-grabbing rotate-3 scale-105">
            <LeadCard lead={activeLead} isDragging />
          </div>
        ) : null}
      </DragOverlay>

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <p className="text-sm font-medium">Updating lead status...</p>
          </div>
        </div>
      )}
    </DndContext>
  );
}
