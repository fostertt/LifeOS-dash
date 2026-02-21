"use client";

interface ListCardProps {
  id: number;
  name: string;
  listType: "simple" | "smart";
  description?: string;
  color?: string;
  tags?: string[];
  pinned: boolean;
  stats: string;
  createdAt?: string;
  onClick: () => void;
  onPin: () => void;
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
  tags,
  pinned,
  stats,
  onClick,
  onPin,
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

      {/* Header with name */}
      <div className="flex items-center gap-2 mb-2 pr-8">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 mb-2">{description}</p>
      )}

      {/* Stats */}
      <p className="text-sm text-gray-600 mb-3">{stats}</p>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-1 text-xs bg-blue-200 text-blue-900 font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer with actions */}
      <div className="flex items-center justify-end text-xs text-gray-500 pt-3 border-t border-gray-100">
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
      </div>
    </div>
  );
}
