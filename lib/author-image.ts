/**
 * Author Image Utility
 * 
 * Single source of truth for author image URLs
 * Handles both local uploads (img field) and external URLs (avatar field)
 */

export interface AuthorImageData {
  img?: string | null;
  avatar?: string | null;
  name: string;
}

/**
 * Get the correct author image URL
 * Priority: avatar (external URL) > img (local file) > placeholder
 */
export function getAuthorImageUrl(author: AuthorImageData): string {
  // 1. Check for external avatar URL
  if (author.avatar && author.avatar.trim()) {
    return author.avatar;
  }

  // 2. Check for local img file
  if (author.img && author.img.trim()) {
    // If it already starts with /api/uploads/, return as-is
    if (author.img.startsWith('/api/uploads/')) {
      return author.img;
    }
    // If it already starts with /uploads/, return as-is (will be rewritten by Next.js)
    if (author.img.startsWith('/uploads/')) {
      return author.img;
    }
    // If it starts with http, return as-is (external URL)
    if (author.img.startsWith('http')) {
      return author.img;
    }
    // Otherwise, prepend the API uploads path directly
    return `/api/uploads/authors/${author.img}`;
  }

  // 3. Fallback to placeholder
  return '/placeholder-user.jpg';
}

/**
 * Get author initials for avatar fallback
 */
export function getAuthorInitials(name: string): string {
  const names = name.trim().split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Check if image is external URL
 */
export function isExternalImage(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
