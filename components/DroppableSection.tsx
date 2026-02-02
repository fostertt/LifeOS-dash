"use client";

import { useDroppable } from "@dnd-kit/core";

interface DroppableSectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Generic droppable section wrapper for drag & drop zones
 * Provides visual feedback when an item is being dragged over it
 */
export default function DroppableSection({ id, children, className = "" }: DroppableSectionProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: {
      type: "section",
    },
  });

  const style = {
    backgroundColor: isOver ? "rgba(167, 139, 250, 0.1)" : undefined, // purple-400 with opacity
    border: isOver ? "2px dashed #8b5cf6" : undefined, // purple-500
    padding: isOver ? "8px" : undefined,
    borderRadius: isOver ? "12px" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children}
    </div>
  );
}
