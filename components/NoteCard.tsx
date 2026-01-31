"use client";

interface NoteCardProps {
  id: number;
  title?: string | null;
  content: string;
  tags?: string[] | null;
  pinned: boolean;
  createdAt: string;
  onClick: () => void;
  onPin: () => void;
}

/**
 * NoteCard - Display component for a single note
 *
 * Features:
 * - Shows title (if present) and content preview
 * - Displays tags as chips
 * - Pin/unpin button
 * - Delete button
 * - Click to edit
 */
export default function NoteCard({
  id,
  title,
  content,
  tags,
  pinned,
  createdAt,
  onClick,
  onPin,
}: NoteCardProps) {
  // Truncate content for preview (first 150 characters)
  const contentPreview =
    content.length > 150 ? content.substring(0, 150) + "..." : content;

  return (
    <div
      className="border-2 border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer bg-white relative"
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

      {/* Title */}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-8">
          {title}
        </h3>
      )}

      {/* Content preview */}
      <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
        {contentPreview}
      </p>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer with actions */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span>{new Date(createdAt).toLocaleDateString()}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPin();
          }}
          className="hover:text-yellow-600 transition-colors"
          title={pinned ? "Unpin note" : "Pin note"}
        >
          {pinned ? "📌" : "📍"}
        </button>
      </div>
    </div>
  );
}
