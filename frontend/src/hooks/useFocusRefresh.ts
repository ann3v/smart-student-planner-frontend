import { useCallback, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Prevents duplicate API calls when both useEffect and useFocusEffect
 * would trigger on screen mount. Uses a ref to track if the initial
 * load has already happened.
 */
export function useFocusRefresh(
  callback: () => void | Promise<void>,
  deps: unknown[] = []
): void {
  const hasInitiallyLoaded = useRef(false);

  // Initial load on mount
  useEffect(() => {
    if (!hasInitiallyLoaded.current) {
      hasInitiallyLoaded.current = true;
      callback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh on focus (but skip the first focus since useEffect already handled it)
  useFocusEffect(
    useCallback(() => {
      if (hasInitiallyLoaded.current) {
        callback();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
  );
}
