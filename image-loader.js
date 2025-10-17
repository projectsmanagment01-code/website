/**
 * Simplified Image Loader for Next.js
 * Fast and efficient image loading without complex processing
 * UPDATED: Handles legacy filenames with spaces by URL-encoding them
 */

export default function imageLoader({ src, width, quality }) {
  // Helper function to safely encode image URLs (handles legacy files with spaces)
  function safeEncodeImageUrl(url) {
    if (!url) return url;
    
    // Split the path into parts
    const parts = url.split('/');
    
    // Encode only the filename (last part), not the directory structure
    const encodedParts = parts.map((part, index) => {
      // Don't encode empty parts or directory names
      if (!part || index < parts.length - 1) {
        return part;
      }
      
      // Only encode the filename if it contains spaces or special characters
      if (/[\s%#]/.test(part)) {
        return encodeURIComponent(part);
      }
      
      return part;
    });
    
    return encodedParts.join('/');
  }

  // For local uploads, use simplified query params
  if (src.startsWith("/uploads/")) {
    // Encode the URL to handle legacy files with spaces
    const safeSrc = safeEncodeImageUrl(src);
    
    const params = new URLSearchParams();
    
    if (width) {
      params.set("w", width.toString());
    }
    
    // Use quality capped at 80% for good balance between size and quality
    const q = quality ? Math.min(quality, 80) : 75;
    params.set("q", q.toString());
    
    return safeSrc + (params.toString() ? "?" + params.toString() : "");
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
