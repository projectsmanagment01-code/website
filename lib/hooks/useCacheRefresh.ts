/**
 * Client-Side Cache Refresh Hook
 * 
 * Provides utilities to force refresh data after mutations in admin dashboard
 * Uses router.refresh() to invalidate client-side Router Cache
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useCacheRefresh() {
  const router = useRouter();

  /**
   * Force refresh the current route
   * This invalidates the Router Cache and fetches fresh data
   * 
   * Call this after CREATE, UPDATE, or DELETE mutations
   */
  const refreshCache = useCallback(() => {
    router.refresh();
  }, [router]);

  /**
   * Fetch with cache-busting
   * Adds timestamp to URL to prevent browser caching
   */
  const fetchNoCache = useCallback(async (url: string, options: RequestInit = {}) => {
    const separator = url.includes('?') ? '&' : '?';
    const cacheBustUrl = `${url}${separator}_t=${Date.now()}&_r=${Math.random()}`;
    
    return fetch(cacheBustUrl, {
      ...options,
      cache: 'no-store',
      headers: {
        ...options.headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  }, []);

  /**
   * Complete cache refresh strategy
   * 1. Refresh router cache
   * 2. Wait a moment for revalidation
   * 3. Optionally reload specific data
   */
  const refreshWithDelay = useCallback(async (delayMs: number = 100) => {
    router.refresh();
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }, [router]);

  return {
    refreshCache,
    fetchNoCache,
    refreshWithDelay,
  };
}
