/**
 * COMPREHENSIVE Cache-Busting Solution for Next.js Admin Dashboard
 * 
 * Based on Next.js 15 official documentation:
 * https://nextjs.org/docs/app/guides/caching
 * 
 * This addresses ALL caching layers:
 * 1. Full Route Cache (server-side rendering cache)
 * 2. Data Cache (server-side fetch cache)
 * 3. Router Cache (client-side navigation cache)
 * 4. Browser HTTP Cache
 */

import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * AGGRESSIVE no-cache headers
 * Use these in all API route responses to prevent ALL types of caching
 */
export const AGGRESSIVE_NO_CACHE_HEADERS = {
  // Primary HTTP/1.1 cache control
  'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate, proxy-revalidate, s-maxage=0',
  
  // Legacy HTTP/1.0
  'Pragma': 'no-cache',
  
  // Explicit expiration
  'Expires': '0',
  
  // Prevent CDN/proxy caching
  'Surrogate-Control': 'no-store',
  'CDN-Cache-Control': 'no-store',
  
  // Tell Next.js to bypass middleware cache
  'X-Middleware-Cache': 'no-cache',
  
  // Vary on all headers to prevent any proxy caching
  'Vary': '*',
  
  // Make response unique with timestamp
  'X-Cache-Bust': () => Date.now().toString(),
  'X-Request-ID': () => crypto.randomUUID(),
} as const;

/**
 * Create headers object with timestamp values resolved
 */
export function createNoCacheHeaders(): HeadersInit {
  const headers: Record<string, string> = {};
  
  Object.entries(AGGRESSIVE_NO_CACHE_HEADERS).forEach(([key, value]) => {
    headers[key] = typeof value === 'function' ? value() : value;
  });
  
  return headers;
}

/**
 * Route segment config for complete cache opt-out
 * Add these exports to EVERY admin API route:
 * 
 * @example
 * ```ts
 * export const dynamic = 'force-dynamic';
 * export const revalidate = 0;
 * export const fetchCache = 'force-no-store';
 * ```
 */
export const CACHE_BUSTING_ROUTE_CONFIG = {
  // Force dynamic rendering (opt out of Full Route Cache)
  dynamic: 'force-dynamic' as const,
  
  // Never revalidate (always fresh)
  revalidate: 0,
  
  // Opt out of Data Cache for all fetches
  fetchCache: 'force-no-store' as const,
};

/**
 * Revalidate ALL admin-related paths after mutations
 * Call this after CREATE, UPDATE, or DELETE operations
 * 
 * According to Next.js docs: "revalidatePath purges the Data Cache and 
 * Full Route Cache, and clears the Router Cache for the associated path"
 */
export async function revalidateAdminPaths(specificPath?: string) {
  try {
    // Revalidate admin dashboard
    revalidatePath('/admin', 'layout');
    
    // Revalidate specific path if provided
    if (specificPath) {
      revalidatePath(specificPath, 'page');
    }
    
    // Revalidate home page (in case changes affect it)
    revalidatePath('/', 'page');
    
    console.log('✅ Cache revalidated:', specificPath || '/admin');
  } catch (error) {
    console.error('❌ Cache revalidation failed:', error);
  }
}

/**
 * Revalidate by cache tags
 * Use this for more granular cache control
 */
export async function revalidateByTags(tags: string[]) {
  try {
    for (const tag of tags) {
      revalidateTag(tag);
    }
    console.log('✅ Cache tags revalidated:', tags);
  } catch (error) {
    console.error('❌ Tag revalidation failed:', error);
  }
}

/**
 * Client-side cache busting for API calls
 * Add timestamp to prevent browser caching
 */
export function addCacheBusterToUrl(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${Date.now()}&_r=${Math.random()}`;
}

/**
 * Fetch with aggressive no-cache options
 * Use this instead of regular fetch in client components
 */
export async function fetchNoCache(url: string, options: RequestInit = {}) {
  return fetch(addCacheBusterToUrl(url), {
    ...options,
    cache: 'no-store',
    headers: {
      ...options.headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}

/**
 * Get recommended fetch options for server components
 */
export const SERVER_NO_CACHE_FETCH_OPTIONS: RequestInit = {
  cache: 'no-store',
  next: {
    revalidate: 0,
  },
};
