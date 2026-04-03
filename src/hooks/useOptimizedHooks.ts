/**
 * Performance-optimized React hooks
 *
 * Usage:
 * import { useOptimizedQuery, useDebouncedValue } from '@/hooks/useOptimizedHooks';
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

/**
 * Debounce hook for search inputs and fast-typing
 * Prevents excessive re-renders and API calls
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Memoized callback with dependency comparison
 * Prevents unnecessary re-creations
 */
export function useDeepMemo<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<{ deps: any[]; value: T } | null>(null);

  const isSameDeps = useMemo(() => {
    if (!ref.current) return false;
    if (ref.current.deps.length !== deps.length) return false;
    return ref.current.deps.every((dep, i) => dep === deps[i]);
  }, deps);

  if (!ref.current || !isSameDeps) {
    ref.current = { deps, value: factory() };
  }

  return ref.current.value;
}

/**
 * Optimized list rendering with virtualization hints
 */
export function useVirtualList<T>(
  items: T[],
  options: { itemHeight: number; viewportHeight: number },
) {
  const { itemHeight, viewportHeight } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(viewportHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, items.length);

  const visibleItems = useMemo(
    () =>
      items.slice(startIndex, endIndex).map((item, index) => ({
        item,
        index: startIndex + index,
        top: (startIndex + index) * itemHeight,
      })),
    [items, startIndex, endIndex, itemHeight],
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
  };
}

/**
 * Image lazy loading with Intersection Observer
 */
export function useLazyLoad(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

/**
 * Cache hook for expensive computations
 */
export function useCachedValue<T>(key: string, compute: () => T): T {
  const cacheRef = useRef<Map<string, T>>(new Map());

  return useMemo(() => {
    if (cacheRef.current.has(key)) {
      return cacheRef.current.get(key)!;
    }
    const value = compute();
    cacheRef.current.set(key, value);
    return value;
  }, [key, compute]);
}

/**
 * Rate limiter for function calls
 */
export function useRateLimitedCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  interval: number,
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= interval) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, interval - timeSinceLastCall);
      }
    }) as T,
    [callback, limit, interval],
  );
}
