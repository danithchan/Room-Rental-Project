import { useEffect, useRef } from 'react';

/**
 * Runs `callback` immediately, then again every `intervalMs`,
 * and also whenever the tab/window regains focus or becomes visible.
 * Use this on list/dashboard pages so data doesn't go stale while
 * the page stays open in the background.
 */
export function useAutoRefresh(callback: () => void, intervalMs = 15000) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    savedCallback.current();

    const id = setInterval(() => {
      // Skip the tick while the tab is hidden to avoid wasted requests
      if (document.visibilityState === 'visible') {
        savedCallback.current();
      }
    }, intervalMs);

    const handleFocus = () => savedCallback.current();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') savedCallback.current();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(id);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);
}
