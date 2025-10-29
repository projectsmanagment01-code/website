/**
 * API Response Helpers
 * 
 * Utilities for creating consistent API responses with proper cache headers
 */

import { NextResponse } from 'next/server';

/**
 * No-cache headers for admin APIs
 * Prevents aggressive browser caching of dynamic data
 */
export const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0'
};

/**
 * Create a JSON response with no-cache headers
 * Use this for all admin API responses to prevent stale data
 */
export function jsonResponseNoCache(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: NO_CACHE_HEADERS
  });
}

/**
 * Create an error response with no-cache headers
 */
export function errorResponseNoCache(error: string, status: number = 500): NextResponse {
  return NextResponse.json({ error }, {
    status,
    headers: NO_CACHE_HEADERS
  });
}
