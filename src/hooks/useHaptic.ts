'use client';

import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error';

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 20],
  error: [30, 50, 30, 50, 30],
};

/**
 * Provides haptic feedback via Vibration API.
 * Falls back silently on unsupported devices.
 */
export function useHaptic() {
  const vibrate = useCallback((pattern: HapticPattern = 'light') => {
    navigator.vibrate?.(patterns[pattern]);
  }, []);

  return vibrate;
}
