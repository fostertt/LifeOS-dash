"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DraggableTaskCardProps {
  id: number;
  children: React.ReactNode;
  data?: any;
  context?: string; // Phase 3.10: Context to ensure unique IDs when item appears in multiple sections
}

export default function DraggableTaskCard({ id, children, data, context }: DraggableTaskCardProps) {
  // Phase 3.10: Include context in ID to prevent duplicate IDs when item appears in both overdue and timeline
  const draggableId = context ? `task-${context}-${id}` : `task-${id}`;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggableId,
    data: data,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none", // Prevent scrolling while dragging
    zIndex: isDragging ? 999 : undefined,
    position: isDragging ? "relative" as const : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}
