/**
 * API Response Helpers
 * 
 * AGGRESSIVE cache-busting utilities based on Next.js official documentation
 * Prevents caching at ALL layers: Full Route Cache, Data Cache, Router Cache, HTTP Cache
 * 
 * Based on: https://nextjs.org/docs/app/guides/caching
 */

import { NextResponse } from 'next/server';
import { createNoCacheHeaders } from './cache-busting';

/**
 * Create a JSON response with AGGRESSIVE no-cache headers
 * Use for ALL admin API responses to prevent stale data
 * 
 * @param data - Data to return in response
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with aggressive no-cache headers
 */
export function jsonResponseNoCache(data: any, status: number = 200): NextResponse {
  const headers = new Headers(createNoCacheHeaders());
  headers.set('Content-Type', 'application/json; charset=utf-8');
  
  return new NextResponse(JSON.stringify(data), {
    status,
    headers
  });
}

/**
 * Create an error response with no-cache headers
 * 
 * @param error - Error message
 * @param status - HTTP status code (default: 500)
 * @returns NextResponse with error and no-cache headers
 */
export function errorResponseNoCache(error: string, status: number = 500): NextResponse {
  return jsonResponseNoCache({ error }, status);
}
