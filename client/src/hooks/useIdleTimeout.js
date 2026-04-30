import { useEffect, useRef, useCallback } from 'react';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export function useIdleTimeout(onTimeout) {
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onTimeout, IDLE_TIMEOUT_MS);
  }, [onTimeout]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];

    events.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer(); // Start timer immediately

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);
}
