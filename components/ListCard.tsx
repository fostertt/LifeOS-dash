"use client";

interface ListCardProps {
  id: number;
  name: string;
  listType: "simple" | "smart";
  description?: string;
  color?: string;
  pinned: boolean;
  stats: string;
  createdAt?: string;
  onClick: () => void;
  onPin: () => void;
  onDelete: () => void;
}

const COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];

/**
 * ListCard - Display component for a single list
 *
 * Features:
 * - Shows list name, type badge, and description
 * - Displays statistics (items checked/total or smart list task count)
 * - Pin/unpin button
 * - Delete button
 * - Click to view list details
 */
export default function ListCard({
  id,
  name,
  listType,
  description,
  color,
  pinned,
  stats,
  onClick,
  onPin,
  onDelete,
}: ListCardProps) {
  return (
    <div
      className="border-2 border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer bg-white relative"
      style={{ borderLeftColor: color || COLORS[0], borderLeftWidth: "4px" }}
      onClick={onClick}
    >
      {/* Pin indicator */}
      {pinned && (
        <div className="absolute top-3 right-3">
          <span className="text-yellow-500" title="Pinned">
            📌
          </span>
        </div>
      )}

      {/* Header with name and type badge */}
      <div className="flex items-center gap-2 mb-2 pr-8">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            listType === "smart"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {listType === "smart" ? "Smart" : "Simple"}
        </span>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 mb-2">{description}</p>
      )}

      {/* Stats */}
      <p className="text-sm text-gray-600 mb-3">{stats}</p>

      {/* Footer with actions */}
      <div className="flex items-center justify-end gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}
            className="hover:text-yellow-600 transition-colors"
            title={pinned ? "Unpin list" : "Pin list"}
          >
            {pinned ? "📌" : "📍"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this list and all its items?")) {
                onDelete();
              }
            }}
            className="hover:text-red-600 transition-colors"
            title="Delete list"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
