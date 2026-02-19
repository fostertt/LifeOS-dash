"use client";

import { useEffect, useRef } from "react";

/**
 * Re-runs callback when the browser tab/window regains focus.
 * Throttled to avoid rapid re-fetches (e.g. quick tab switches).
 * Drop-in replacement path: swap this for SWR/React Query revalidateOnFocus later.
 *
 * @param callback - Async function to call on focus (typically a data loader)
 * @param enabled - Whether the hook is active (default: true)
 * @param throttleMs - Min interval between refreshes (default: 5000ms)
 */
export function useRefreshOnFocus(
  callback: () => void | Promise<void>,
  enabled: boolean = true,
  throttleMs: number = 5000
) {
  const lastRefresh = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => {
      const now = Date.now();
      if (now - lastRefresh.current < throttleMs) return;
      lastRefresh.current = now;
      callback();
    };

    // visibilitychange is more reliable than focus on mobile browsers
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleFocus();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [callback, enabled, throttleMs]);
}
