/**
 * Performance Optimizations Module
 *
 * This module provides utilities to prevent forced reflows and optimize rendering performance.
 * Forced reflows occur when JavaScript reads layout properties (offsetWidth, clientHeight, etc.)
 * after modifying the DOM, forcing the browser to synchronously recalculate layout.
 *
 * Per Lighthouse report: Forced reflow was causing 105ms delay in installHook.js
 */

/**
 * Batch DOM read/write operations to prevent forced reflows
 *
 * Instead of:
 *   element.style.width = '100px';  // Write
 *   const width = element.offsetWidth; // Read - FORCES REFLOW!
 *   element.style.height = '200px';  // Write
 *
 * Use:
 *   batchDOMOperations(() => {
 *     element.style.width = '100px';  // Write
 *   }, () => {
 *     const width = element.offsetWidth; // Read - no reflow
 *     element.style.height = '200px';  // Write
 *   });
 */
export function batchDOMOperations(writeFn: () => void, readFn?: () => void): void {
  if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
    writeFn();
    readFn?.();
    return;
  }

  // Schedule writes in the next animation frame
  requestAnimationFrame(() => {
    writeFn();

    // Schedule reads in the same frame (after writes complete)
    if (readFn) {
      requestAnimationFrame(() => {
        readFn();
      });
    }
  });
}

/**
 * Debounce function to limit how often a function is called
 * Useful for resize/scroll handlers that trigger reflows
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution rate
 * Useful for preventing excessive reflows during rapid events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Measure layout once and cache the result
 * Prevents multiple reflows when reading the same element multiple times
 */
export function cacheLayoutMeasurements<T>(
  measurementFn: () => T,
  cacheKey: string = 'default',
  ttl: number = 1000, // milliseconds
): T {
  if (typeof window === 'undefined') {
    return measurementFn();
  }

  const cache = (window as any).__layoutCache || ((window as any).__layoutCache = {});
  const cacheEntry = cache[cacheKey];

  // Return cached value if still valid
  if (cacheEntry && Date.now() - cacheEntry.timestamp < ttl) {
    return cacheEntry.value;
  }

  // Measure and cache
  const value = measurementFn();
  cache[cacheKey] = {
    value,
    timestamp: Date.now(),
  };

  return value;
}

/**
 * Use ResizeObserver instead of reading offsetWidth/offsetHeight
 * This is more performant and doesn't trigger forced reflows
 */
export function observeElementSize(
  element: HTMLElement,
  callback: (width: number, height: number) => void,
): () => void {
  if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
    // Fallback for older browsers
    callback(element.offsetWidth, element.offsetHeight);
    return () => {};
  }

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      callback(width, height);
    }
  });

  observer.observe(element);

  // Return cleanup function
  return () => observer.disconnect();
}

/**
 * Virtualize long lists to reduce DOM size and improve rendering
 * Only render items that are visible in the viewport
 */
export interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  totalItems: number;
  overscan?: number;
}

export function calculateVisibleItems({
  itemHeight,
  containerHeight,
  totalItems,
  overscan = 3,
}: VirtualizationOptions) {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const overscanCount = overscan * 2;

  return {
    visibleCount: visibleCount + overscanCount,
    totalHeight: totalItems * itemHeight,
  };
}

/**
 * Lazy load images with IntersectionObserver
 * Prevents layout shifts and improves LCP
 */
export function lazyLoadImage(img: HTMLImageElement, src: string, placeholder?: string): void {
  if (placeholder) {
    img.src = placeholder;
  }

  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    img.src = src;
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px', // Start loading 50px before image enters viewport
    },
  );

  observer.observe(img);
}

/**
 * Optimize scroll handlers to prevent forced reflows
 */
export function optimizeScrollHandler(
  handler: (event: Event) => void,
  options?: {
    throttle?: number;
    passive?: boolean;
  },
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const throttledHandler = options?.throttle ? throttle(handler, options.throttle) : handler;

  window.addEventListener('scroll', throttledHandler as EventListener, {
    passive: options?.passive ?? true,
  });

  return () => {
    window.removeEventListener('scroll', throttledHandler as EventListener);
  };
}

/**
 * Use CSS transforms instead of layout properties for animations
 * Transforms don't trigger reflow, only composite
 */
export function animateWithTransform(
  element: HTMLElement,
  transforms: {
    translateX?: number;
    translateY?: number;
    scale?: number;
    rotate?: number;
  },
  duration?: number,
): void {
  const transformParts: string[] = [];

  if (transforms.translateX !== undefined) {
    transformParts.push(`translateX(${transforms.translateX}px)`);
  }
  if (transforms.translateY !== undefined) {
    transformParts.push(`translateY(${transforms.translateY}px)`);
  }
  if (transforms.scale !== undefined) {
    transformParts.push(`scale(${transforms.scale})`);
  }
  if (transforms.rotate !== undefined) {
    transformParts.push(`rotate(${transforms.rotate}deg)`);
  }

  if (duration) {
    element.style.transition = `transform ${duration}ms ease-out`;
  }

  element.style.transform = transformParts.join(' ');
}

/**
 * Preconnect to critical origins to reduce connection latency
 */
export function preconnect(url: string, crossorigin?: boolean): void {
  if (typeof document === 'undefined') {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;

  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * Prefetch critical resources
 */
export function prefetch(url: string, as?: 'script' | 'style' | 'font' | 'image'): void {
  if (typeof document === 'undefined') {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;

  if (as) {
    link.as = as;
  }

  document.head.appendChild(link);
}

/**
 * Clear layout cache on resize/orientation change
 */
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    if ((window as any).__layoutCache) {
      (window as any).__layoutCache = {};
    }
  });

  window.addEventListener('orientationchange', () => {
    if ((window as any).__layoutCache) {
      (window as any).__layoutCache = {};
    }
  });
}

export default {
  batchDOMOperations,
  debounce,
  throttle,
  cacheLayoutMeasurements,
  observeElementSize,
  calculateVisibleItems,
  lazyLoadImage,
  optimizeScrollHandler,
  animateWithTransform,
  preconnect,
  prefetch,
};
