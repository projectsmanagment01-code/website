/**
 * Admin-specific fetch utility with aggressive no-cache settings
 * Use this for ALL admin dashboard API calls
 */

/**
 * Fetch with no-cache headers for admin dashboard
 * Ensures fresh data on every request
 */
export async function adminFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const timestamp = Date.now();
  const urlWithCache = url.includes('?')
    ? `${url}&_t=${timestamp}`
    : `${url}?_t=${timestamp}`;

  return fetch(urlWithCache, {
    ...options,
    cache: 'no-store',
    headers: {
      ...options?.headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

/**
 * Fetch JSON with no-cache for admin dashboard
 */
export async function adminFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await adminFetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}
