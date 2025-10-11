/**
 * Simplified Image Loader for Next.js
 * Fast and efficient image loading without complex processing
 */

export default function imageLoader({ src, width, quality }) {
  // For local uploads, use simplified query params
  if (src.startsWith("/uploads/")) {
    const params = new URLSearchParams();
    
    if (width) {
      params.set("w", width.toString());
    }
    
    // Use reasonable quality for speed
    const q = quality ? Math.min(quality, 85) : 75;
    params.set("q", q.toString());
    
    return src + (params.toString() ? "?" + params.toString() : "");
  }

  // For external images, pass through with minimal processing
  if (width || quality) {
    const params = new URLSearchParams();
    if (width) params.set("w", width.toString());
    if (quality) params.set("q", (quality || 75).toString());
    return `${src}?${params.toString()}`;
  }

  return src;
}
