"use client";

import { useEffect, useRef } from "react";

/**
 * Re-runs callback when the browser tab/window regains focus.
 * Throttled to avoid rapid re-fetches (e.g. quick tab switches).
 * Uses a ref for the callback so callers don't need useCallback wrappers.
 *
 * @param callback - Async function to call on focus (typically a data loader)
 * @param throttleMs - Min interval between refreshes (default: 5000ms)
 */
export function useRefreshOnFocus(
  callback: () => void | Promise<void>,
  throttleMs: number = 5000
) {
  const lastRefresh = useRef<number>(0);
  // Always-current ref so the effect deps don't need to include callback
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastRefresh.current < throttleMs) return;
      lastRefresh.current = now;
      callbackRef.current();
    };

    // visibilitychange is more reliable than focus on mobile browsers
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleFocus();
      }
    };

    // pageshow fires on bfcache restore (iOS Safari back/forward)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) handleFocus();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [throttleMs]); // callback excluded — read from ref at call time
}
