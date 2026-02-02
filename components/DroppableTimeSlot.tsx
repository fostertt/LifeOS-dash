"use client";

import { useDroppable } from "@dnd-kit/core";

interface DroppableTimeSlotProps {
  id: string;
  time: string;
  date: Date;
  children?: React.ReactNode;
  isOver?: boolean;
}

export default function DroppableTimeSlot({ id, time, date, children }: DroppableTimeSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: {
      type: "time-slot",
      time,
      date,
    },
  });

  const style = {
    backgroundColor: isOver ? "rgba(167, 139, 250, 0.2)" : undefined, // purple-400 with opacity
    border: isOver ? "2px dashed #8b5cf6" : undefined, // purple-500
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full h-full relative">
      {children}
    </div>
  );
}
