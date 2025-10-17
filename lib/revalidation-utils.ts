/**
 * Revalidation Utilities
 * Helper functions for cache revalidation and immediate UI updates
 */

/**
 * Revalidate specific pages after content changes
 */
export async function revalidatePages(pages: string | string[]): Promise<boolean> {
  try {
    const token = localStorage.getItem('admin_token');
    if (!token) return false;

    const pageList = Array.isArray(pages) ? pages : [pages];
    
    // Call revalidation for each page
    const promises = pageList.map(page => 
      fetch('/api/admin/revalidate-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ page })
      })
    );

    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Revalidation error:', error);
    return false;
  }
}

/**
 * Trigger full cache purge for Cloudflare
 */
export async function purgeCloudflareCache(): Promise<boolean> {
  try {
    // If you have Cloudflare API integration, call it here
    // For now, we'll just revalidate all pages
    return await revalidatePages('all');
  } catch (error) {
    console.error('Cache purge error:', error);
    return false;
  }
}

/**
 * Force browser to refetch data with cache bypass
 */
export async function forceRefetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    cache: 'no-store',
    headers: {
      ...options.headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

/**
 * Comprehensive refresh after save/delete
 */
export async function refreshAfterChange(affectedPages: string | string[]): Promise<void> {
  // 1. Revalidate affected pages
  await revalidatePages(affectedPages);
  
  // 2. Small delay to ensure revalidation completes
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // 3. Force router refresh if available
  if (typeof window !== 'undefined') {
    // Try to refresh the current page data without full reload
    const event = new CustomEvent('admin-data-refresh', { detail: { pages: affectedPages } });
    window.dispatchEvent(event);
  }
}
