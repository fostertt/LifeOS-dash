'use client';

import { useRef } from 'react';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  /** Minimum horizontal distance in px to trigger a swipe (default: 60) */
  threshold?: number;
  /** Swipe is ignored if vertical movement exceeds horizontal by this ratio (default: 1.5) */
  directionRatio?: number;
}

/**
 * useSwipe — detects horizontal touch swipe gestures.
 *
 * Returns onTouchStart / onTouchEnd handlers to spread onto a container element.
 * Only fires if the horizontal delta exceeds `threshold` AND is larger than
 * vertical delta * directionRatio, so vertical scrolling doesn't trigger it.
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  directionRatio = 1.5,
}: UseSwipeOptions) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null || startY.current === null) return;

    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;

    startX.current = null;
    startY.current = null;

    // Ignore if not primarily horizontal or below threshold
    if (Math.abs(dx) < threshold) return;
    if (Math.abs(dy) * directionRatio > Math.abs(dx)) return;

    if (dx < 0) {
      onSwipeLeft?.();
    } else {
      onSwipeRight?.();
    }
  };

  return { onTouchStart, onTouchEnd };
}
