/**
 * Tag management utilities for LifeOS
 * Handles tag normalization, filtering, and autocomplete functionality
 */

/**
 * Normalize a tag string (lowercase, trim whitespace)
 * Used for case-insensitive matching and deduplication
 */
export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

/**
 * Extract unique tags from an array of items
 * Returns sorted array of unique tags (case-insensitive)
 *
 * @param items - Array of items that may have tags property
 * @returns Sorted array of unique tag strings
 */
export function extractUniqueTags(items: Array<{ tags?: string[] | null }>): string[] {
  const tagSet = new Set<string>();

  items.forEach((item) => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach((tag) => {
        if (tag && typeof tag === 'string') {
          tagSet.add(normalizeTag(tag));
        }
      });
    }
  });

  return Array.from(tagSet).sort();
}

/**
 * Filter tags based on search query
 * Case-insensitive substring matching
 *
 * @param availableTags - Array of all available tags
 * @param query - Search query string
 * @returns Filtered and sorted tags matching query
 */
export function filterTags(availableTags: string[], query: string): string[] {
  const normalizedQuery = normalizeTag(query);

  if (!normalizedQuery) {
    return availableTags;
  }

  return availableTags
    .filter((tag) => normalizeTag(tag).includes(normalizedQuery))
    .sort((a, b) => {
      // Prioritize exact matches, then prefix matches
      const aLower = normalizeTag(a);
      const bLower = normalizeTag(b);

      if (aLower === normalizedQuery) return -1;
      if (bLower === normalizedQuery) return 1;

      if (aLower.startsWith(normalizedQuery) && !bLower.startsWith(normalizedQuery)) return -1;
      if (!aLower.startsWith(normalizedQuery) && bLower.startsWith(normalizedQuery)) return 1;

      return a.localeCompare(b);
    });
}

/**
 * Check if an item matches a set of tag filters
 * Supports AND logic (item must have all specified tags)
 *
 * @param itemTags - Tags on the item (can be null/undefined)
 * @param filterTags - Tags to filter by
 * @returns True if item matches all filter tags
 */
export function itemMatchesTags(
  itemTags: string[] | null | undefined,
  filterTags: string[]
): boolean {
  if (!filterTags || filterTags.length === 0) {
    return true; // No filter = show all
  }

  if (!itemTags || itemTags.length === 0) {
    return false; // Item has no tags, can't match filter
  }

  const normalizedItemTags = itemTags.map(normalizeTag);
  const normalizedFilterTags = filterTags.map(normalizeTag);

  // AND logic: item must have ALL filter tags
  return normalizedFilterTags.every((filterTag) =>
    normalizedItemTags.includes(filterTag)
  );
}

/**
 * Add a tag to an existing tag array (case-insensitive deduplication)
 *
 * @param existingTags - Current tags array
 * @param newTag - Tag to add
 * @returns Updated tags array
 */
export function addTag(existingTags: string[] | null | undefined, newTag: string): string[] {
  const tags = existingTags || [];
  const normalizedNew = normalizeTag(newTag);

  // Check if tag already exists (case-insensitive)
  const exists = tags.some((tag) => normalizeTag(tag) === normalizedNew);

  if (!exists && normalizedNew) {
    return [...tags, newTag.trim()]; // Preserve original case
  }

  return tags;
}

/**
 * Remove a tag from an existing tag array (case-insensitive)
 *
 * @param existingTags - Current tags array
 * @param tagToRemove - Tag to remove
 * @returns Updated tags array
 */
export function removeTag(existingTags: string[] | null | undefined, tagToRemove: string): string[] {
  const tags = existingTags || [];
  const normalizedRemove = normalizeTag(tagToRemove);

  return tags.filter((tag) => normalizeTag(tag) !== normalizedRemove);
}
