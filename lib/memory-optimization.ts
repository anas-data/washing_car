/**
 * Memory Optimization Utilities
 * Helps reduce memory usage and improve app performance
 */

import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Debounce hook - prevents excessive function calls
 * Reduces memory allocation and improves performance
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook - limits function execution frequency
 * Useful for scroll, resize events
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Pagination hook - loads data in chunks to reduce memory
 */
export function usePagination<T>(
  items: T[],
  itemsPerPage: number = 20
) {
  const [currentPage, setCurrentPage] = React.useState(0);

  const currentItems = React.useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, []);

  return {
    currentItems,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    setCurrentPage,
  };
}

/**
 * Lazy loading hook - loads content on demand
 */
export function useLazyLoad(threshold: number = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return { ref, isVisible };
}

/**
 * Cleanup hook - ensures proper cleanup of resources
 */
export function useCleanup(cleanup: () => void) {
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);
}

/**
 * Memory monitoring hook - tracks memory usage
 */
export function useMemoryMonitor() {
  const [memoryUsage, setMemoryUsage] = React.useState<number | null>(null);

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage(Math.round(memory.usedJSHeapSize / 1048576)); // Convert to MB
      }
    };

    const interval = setInterval(checkMemory, 5000);
    checkMemory();

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
}

/**
 * Cache hook - caches expensive computations
 */
export function useCache<T>(
  key: string,
  computeFn: () => T,
  dependencies: React.DependencyList = []
): T {
  const cacheRef = useRef<Map<string, T>>(new Map());

  return React.useMemo(() => {
    if (cacheRef.current.has(key)) {
      return cacheRef.current.get(key)!;
    }

    const value = computeFn();
    cacheRef.current.set(key, value);

    // Limit cache size to prevent memory leaks
    if (cacheRef.current.size > 100) {
      const firstKey = cacheRef.current.keys().next().value as string;
      if (firstKey) {
        cacheRef.current.delete(firstKey);
      }
    }

    return value;
  }, [key, computeFn, ...dependencies]);
}

/**
 * Data compression utility
 */
export function compressData(data: any): string {
  // Simple compression using JSON stringification
  return JSON.stringify(data);
}

/**
 * Data decompression utility
 */
export function decompressData(compressed: string): any {
  return JSON.parse(compressed);
}

/**
 * Batch updates - reduces re-renders
 */
export function useBatchUpdate<T>(initialState: T) {
  const [state, setState] = React.useState<T>(initialState);
  const batchRef = useRef<Partial<T>>({});

  const addToBatch = useCallback((updates: Partial<T>) => {
    batchRef.current = { ...batchRef.current, ...updates };
  }, []);

  const flushBatch = useCallback(() => {
    if (Object.keys(batchRef.current).length > 0) {
      setState((prev) => ({ ...prev, ...batchRef.current }));
      batchRef.current = {};
    }
  }, []);

  return { state, addToBatch, flushBatch };
}

/**
 * Virtual list hook - renders only visible items
 * Significantly reduces memory for large lists
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleRange = React.useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);

    return {
      startIndex: Math.max(0, startIndex),
      endIndex: Math.min(items.length, endIndex),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = items.slice(visibleRange.startIndex, visibleRange.endIndex);

  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    onScroll: (top: number) => setScrollTop(top),
  };
}

/**
 * Resource pooling - reuses objects instead of creating new ones
 */
export class ObjectPool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();

  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    initialSize: number = 10
  ) {
    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory());
    }
  }

  acquire(): T {
    let obj: T;
    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      obj = this.factory();
    }
    this.inUse.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.reset(obj);
      this.available.push(obj);
    }
  }

  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
    };
  }
}

/**
 * Adaptive sync - adjusts sync frequency based on network
 */
export function getAdaptiveSyncInterval(
  isWiFi: boolean,
  isBatteryLow: boolean
): number {
  if (isBatteryLow) {
    return 60000; // 1 minute on low battery
  }
  if (isWiFi) {
    return 5000; // 5 seconds on WiFi
  }
  return 30000; // 30 seconds on cellular
}

/**
 * Memory leak detection utility
 */
export function useMemoryLeakDetection() {
  const subscriptionsRef = useRef<Set<() => void>>(new Set());

  const subscribe = useCallback((unsubscribe: () => void) => {
    subscriptionsRef.current.add(unsubscribe);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup all subscriptions
      subscriptionsRef.current.forEach((unsubscribe) => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      });
      subscriptionsRef.current.clear();
    };
  }, []);

  return { subscribe };
}
