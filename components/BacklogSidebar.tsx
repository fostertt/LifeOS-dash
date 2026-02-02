"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import DraggableTaskCard from "./DraggableTaskCard";

interface Item {
  id: number;
  name: string;
  description?: string;
  itemType: "task" | "habit" | "reminder";
  priority?: string;
  complexity?: string;
  energy?: string;
  duration?: string;
  tags?: string[];
  isParent: boolean; // Required field for type compatibility
  state?: string;
  dueDate?: string;
  dueTime?: string;
  showOnCalendar?: boolean;
}

interface BacklogSidebarProps {
  items: Item[];
  onEditItem: (item: Item) => void;
}

export default function BacklogSidebar({ items, onEditItem }: BacklogSidebarProps) {
  // Make the entire sidebar a droppable zone for unscheduling items
  const { isOver, setNodeRef } = useDroppable({
    id: "backlog-drop-zone",
    data: {
      type: "backlog",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="hidden md:flex flex-col w-80 bg-white rounded-2xl shadow-lg h-[calc(100vh-140px)] sticky top-24 border border-gray-100"
      style={{
        backgroundColor: isOver ? "rgba(156, 163, 175, 0.1)" : undefined, // gray-400 with opacity
        borderColor: isOver ? "#6b7280" : undefined, // gray-500
        borderWidth: isOver ? "2px" : undefined,
        borderStyle: isOver ? "dashed" : undefined,
      }}
    >
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
        <h3 className="font-semibold text-gray-700">
          Backlog {isOver && "← Drop here to unschedule"}
        </h3>
        <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
          {items.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No unscheduled tasks.
            <br />
            Great job!
          </div>
        ) : (
          items.map((item) => (
            <DraggableTaskCard key={item.id} id={item.id} data={item}>
              <div 
                onClick={() => onEditItem(item)}
                className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-900 text-sm line-clamp-2">{item.name}</span>
                  {item.priority === "high" && (
                    <span className="text-red-500 text-xs font-bold">!</span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.complexity && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {item.complexity}
                    </span>
                  )}
                  {item.duration && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                      {item.duration}
                    </span>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded">
                      {item.tags[0]}
                      {item.tags.length > 1 && ` +${item.tags.length - 1}`}
                    </span>
                  )}
                </div>
              </div>
            </DraggableTaskCard>
          ))
        )}
      </div>
    </div>
  );
}
