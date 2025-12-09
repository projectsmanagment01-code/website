import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Author, AuthorEntity } from "@/outils/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the proper author image URL following the new author system approach
 * Priority: author.avatar (external URL) > author.img (local file) > placeholder
 * 
 * @deprecated Use getRecipeAuthorImage from author-recipe-integration.ts for recipe components
 */
export function getAuthorImage(author?: Author | AuthorEntity | null, authorEntity?: AuthorEntity | null): string {
  // If we have an author object
  if (author) {
    // First priority: external avatar URL (from n8n imports)
    if (author.avatar) {
      return author.avatar;
    }

    // Second priority: local image file (from admin uploads)
    if ('img' in author && author.img) {
      return `/uploads/authors/${author.img}`;
    }
  }

  // If we have additional author entity data
  if (authorEntity) {
    if (authorEntity.avatar) {
      return authorEntity.avatar;
    }
    if (authorEntity.img) {
      return `/uploads/authors/${authorEntity.img}`;
    }
  }

  // Fallback to placeholder
  return "/placeholder-user.jpg";
}

/**
 * Get the current hostname for dynamic URL construction
 * Works on both client and server side
 */
export function getHostname(): string {
  // Client-side: use window.location
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }

  // Server-side: Priority order for hostname resolution
  
  // 1. Environment variable (highest priority)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      return new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname;
    } catch (e) {
      // If URL parsing fails, might be just hostname
      return process.env.NEXT_PUBLIC_SITE_URL.replace(/^https?:\/\//, '').split('/')[0];
    }
  }

  // 2. Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL;
  }

  // 3. Try to read from secure site configuration file
  try {
    const fs = require('fs');
    const path = require('path');
    const siteConfigPath = path.join(process.cwd(), 'data', 'config', 'site.json');
    
    if (fs.existsSync(siteConfigPath)) {
      const siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'));
      if (siteConfig.siteDomain) {
        return siteConfig.siteDomain;
      }
    }
  } catch (error) {
    // Silently fail and use fallback
  }

  // 4. Fallback for local development
  return "localhost:3000";
}

/**
 * Get the current protocol (http/https)
 */
export function getProtocol(): string {
  if (typeof window !== "undefined") {
    return window.location.protocol;
  }

  // Default to https for production
  return (process.env as any).NODE_ENV === "production" ? "https:" : "http:";
}

/**
 * Construct a full URL with the current hostname
 */
export function getFullUrl(path: string = ""): string {
  const protocol = getProtocol();
  const hostname = getHostname();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${protocol}//${hostname}${cleanPath}`;
}

/**
 * Safe HTML renderer that sanitizes and processes HTML content
 * Handles internal links and basic HTML elements
 */
export function renderSafeHtml(htmlContent: string): { __html: string } {
  if (!htmlContent || typeof htmlContent !== "string") {
    return { __html: "" };
  }

  // Basic HTML sanitization - remove dangerous tags and attributes
  let sanitized = htmlContent
    // Remove script tags and their content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    // Remove style tags
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    // Remove event handlers
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    // Remove javascript: URLs
    .replace(/javascript:[^"']*/gi, "#")
    // Remove dangerous tags
    .replace(
      /<(iframe|object|embed|form|input|textarea|select|button)[^>]*>[\s\S]*?<\/\1>/gi,
      ""
    )
    .replace(
      /<(iframe|object|embed|form|input|textarea|select|button)[^>]*\/?>/gi,
      ""
    );

  // Process internal links - convert relative URLs to absolute
  sanitized = sanitized.replace(
    /href=(["'])([^"']*)\1/gi,
    (match, quote, url) => {
      if (
        url.startsWith("http") ||
        url.startsWith("//") ||
        url.startsWith("mailto:") ||
        url.startsWith("#")
      ) {
        return match; // Keep external URLs, mailto, and anchors as-is
      }
      // Convert relative URLs to absolute
      const absoluteUrl = url.startsWith("/")
        ? getFullUrl(url)
        : getFullUrl(`/${url}`);
      return `href="${absoluteUrl}"`;
    }
  );

  // Make internal links bold by wrapping the link text with <strong>
  // Match <a> tags with internal URLs (ardeloprints.com or relative paths)
  sanitized = sanitized.replace(
    /<a\s+([^>]*href=["'](?:https?:\/\/(?:www\.)?ardeloprints\.com[^"']*|\/[^"']*)[^>]*)>([^<]*)<\/a>/gi,
    (match, attributes, linkText) => {
      // Check if the link text is already wrapped in <strong> or <b>
      if (linkText.includes('<strong>') || linkText.includes('<b>')) {
        return match;
      }
      return `<a ${attributes}><strong>${linkText}</strong></a>`;
    }
  );

  return { __html: sanitized };
}

/**
 * Check if content contains HTML tags
 */
export function hasHtmlTags(content: string): boolean {
  if (!content || typeof content !== "string") {
    return false;
  }
  return /<[^>]+>/.test(content);
}

/**
 * Safe URL encoding for image paths
 * Handles both new sanitized filenames and legacy filenames with spaces
 * Only encodes the filename portion, not the directory structure
 * 
 * @param imagePath - The image path (e.g., "/uploads/recipes/My Recipe.webp")
 * @returns URL-safe path (e.g., "/uploads/recipes/My%20Recipe.webp")
 */
export function safeImageUrl(imagePath: string): string {
  if (!imagePath || typeof imagePath !== "string") {
    return imagePath;
  }

  // If it's already an external URL, return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Split the path into parts
  const parts = imagePath.split('/');
  
  // Encode only the filename (last part), not the directory structure
  const encodedParts = parts.map((part, index) => {
    // Don't encode empty parts or directory names
    if (!part || index < parts.length - 1) {
      return part;
    }
    
    // Only encode the filename if it contains spaces or special characters that need encoding
    // Check if encoding is needed (has spaces or other characters that need encoding)
    if (/[\s%#]/.test(part)) {
      return encodeURIComponent(part);
    }
    
    return part;
  });
  
  return encodedParts.join('/');
}

/**
 * Sanitize filename for new uploads
 * Converts spaces and special characters to hyphens
 * Makes filenames URL-safe and SEO-friendly
 * 
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") {
    return filename;
  }

  // Get the filename without extension
  const lastDotIndex = filename.lastIndexOf('.');
  const nameWithoutExt = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';

  // Sanitize the name:
  // 1. Convert to lowercase
  // 2. Replace spaces with hyphens
  // 3. Remove special characters except hyphens and underscores
  // 4. Replace multiple hyphens with single hyphen
  // 5. Remove leading/trailing hyphens
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/[^a-z0-9\-_]/g, '-')  // special chars to hyphens
    .replace(/-+/g, '-')             // multiple hyphens to single
    .replace(/^-+|-+$/g, '');        // remove leading/trailing hyphens

  return sanitized + extension;
}
