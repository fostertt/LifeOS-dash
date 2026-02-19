"use client";

import { useState, useRef, useEffect } from "react";
import { filterTags, normalizeTag } from "@/lib/tags";

interface TagInputProps {
  tags: string[];
  availableTags: string[]; // All existing tags for autocomplete
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * TagInput - Component for adding/removing tags with autocomplete
 *
 * Features:
 * - Display existing tags as removable chips
 * - Autocomplete from existing tags
 * - Create new tags on-the-fly
 * - Case-insensitive matching
 * - Keyboard navigation (Enter to add, Backspace to remove last)
 */
export default function TagInput({
  tags,
  availableTags,
  onTagsChange,
  placeholder = "Add tags...",
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input and exclude already-selected tags
  const suggestions = filterTags(
    availableTags.filter(
      (tag) => !tags.some((t) => normalizeTag(t) === normalizeTag(tag))
    ),
    inputValue
  );

  // Add tag handler (from suggestion or manual input)
  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    // Check if tag already exists (case-insensitive)
    const exists = tags.some((t) => normalizeTag(t) === normalizeTag(trimmedTag));
    if (exists) {
      setInputValue("");
      return;
    }

    // Add tag preserving original case, keep focus so user can add more
    onTagsChange([...tags, trimmedTag]);
    setInputValue("");
    setSelectedSuggestionIndex(0);
  };

  // Remove tag handler
  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((t) => normalizeTag(t) !== normalizeTag(tagToRemove)));
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        handleAddTag(suggestions[selectedSuggestionIndex]);
      } else if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag when backspace on empty input
      handleRemoveTag(tags[tags.length - 1]);
    } else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Show suggestions when focused and there are available tags to show
  useEffect(() => {
    setShowSuggestions(isFocused && suggestions.length > 0);
    setSelectedSuggestionIndex(0);
  }, [inputValue, suggestions.length, isFocused]);

  return (
    <div className="relative w-full">
      {/* Tags container with input */}
      <div
        className={`flex flex-wrap gap-2 p-2 border rounded-lg bg-white min-h-[42px] ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"
        }`}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {/* Existing tags as chips */}
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-200 text-blue-900 font-medium rounded-full"
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTag(tag);
                }}
                className="hover:text-blue-600 focus:outline-none"
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            )}
          </span>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => { setIsFocused(false); setShowSuggestions(false); }, 200)}
          placeholder={tags.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm text-gray-900"
        />
      </div>

      {/* Autocomplete suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {/* Show header when browsing all tags (empty input) */}
          {!inputValue.trim() && (
            <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase border-b bg-gray-50">
              Existing tags
            </div>
          )}
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleAddTag(suggestion)}
              className={`w-full text-left px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-100 ${
                index === selectedSuggestionIndex ? "bg-purple-50" : ""
              }`}
            >
              {suggestion}
            </button>
          ))}
          {!suggestions.some((s) => normalizeTag(s) === normalizeTag(inputValue)) &&
            inputValue.trim() && (
              <button
                type="button"
                onClick={() => handleAddTag(inputValue)}
                className="w-full text-left px-3 py-3 text-base font-medium text-blue-700 hover:bg-gray-100 border-t"
              >
                Create "{inputValue.trim()}"
              </button>
            )}
        </div>
      )}
    </div>
  );
}
