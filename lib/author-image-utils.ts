/**
 * Utility function to get the correct author image URL
 * Handles cases where img field might contain:
 * - Just filename: "image.webp"
 * - Full path: "/uploads/authors/image.webp"
 * - Duplicated path: "/uploads/authors//uploads/authors/image.webp"
 */
export function getAuthorImageUrl(author: { avatar?: string | null; img?: string | null }): string | null {
  // Priority 1: Use avatar if available (usually full URL)
  if (author.avatar) {
    return author.avatar;
  }
  
  // Priority 2: Process img field
  if (author.img) {
    // If img already contains the full path, use it as-is
    if (author.img.startsWith('/uploads/authors/')) {
      return author.img;
    }
    
    // If img is just a filename, prepend the uploads path
    return `/uploads/authors/${author.img}`;
  }
  
  // No image available
  return null;
}

/**
 * Get author initials for fallback display
 */
export function getAuthorInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}