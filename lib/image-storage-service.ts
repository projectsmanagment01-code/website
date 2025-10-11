/**
 * Image Storage Service
 * Handles image upload, optimization, and management
 */

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  originalName?: string;
  size?: number;
  type?: string;
  category?: string;
  uploadedAt?: string;
  error?: string;
}

export interface UploadOptions {
  category?: string;
  maxSize?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
}

export class ImageStorageService {
  private static readonly API_ENDPOINT = "/api/upload";
  private static readonly DEFAULT_CATEGORY = "recipes";

  private static readonly DEFAULT_OPTIONS: UploadOptions = {
    category: this.DEFAULT_CATEGORY,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    generateThumbnail: false,
  };

  /**
   * Upload a single image file
   */
  static async uploadImage(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const config = { ...this.DEFAULT_OPTIONS, ...options };

      // Validate file on client side
      const validation = this.validateFile(file, config);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", config.category || this.DEFAULT_CATEGORY);

      // Upload file
      const response = await fetch(this.API_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Upload failed",
        };
      }

      return result;
    } catch (error) {
      console.error("Error uploading image:", error);
      return {
        success: false,
        error: "Failed to upload image",
      };
    }
  }

  /**
   * Upload multiple images
   */
  static async uploadImages(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const promises = files.map((file) => this.uploadImage(file, options));
    return Promise.all(promises);
  }

  /**
   * Validate file before upload
   */
  private static validateFile(
    file: File,
    options: UploadOptions
  ): { isValid: boolean; error?: string } {
    const { maxSize, allowedTypes } = options;

    if (maxSize && file.size > maxSize) {
      return {
        isValid: false,
        error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
      };
    }

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Get image URL by filename and category
   */
  static getImageUrl(
    filename: string,
    category: string = this.DEFAULT_CATEGORY
  ): string {
    return `/uploads/${category}/${filename}`;
  }

  /**
   * Generate optimized image URL (for future CDN integration)
   */
  static getOptimizedUrl(
    url: string,
    width?: number,
    height?: number,
    quality?: number
  ): string {
    // For now, return original URL
    // In production, you could integrate with services like Cloudinary, ImageKit, etc.
    let optimizedUrl = url;

    const params = new URLSearchParams();
    if (width) params.append("w", width.toString());
    if (height) params.append("h", height.toString());
    if (quality) params.append("q", quality.toString());

    if (params.toString()) {
      optimizedUrl += `?${params.toString()}`;
    }

    return optimizedUrl;
  }

  /**
   * Create image categories for organization
   */
  static readonly Categories = {
    RECIPES: "recipes",
    INGREDIENTS: "ingredients",
    PROCESS: "process",
    AUTHORS: "authors",
    HERO: "hero",
    THUMBNAILS: "thumbnails",
    GENERAL: "general",
  } as const;

  /**
   * Helper to get category-specific upload options
   */
  static getCategoryOptions(
    category: keyof typeof ImageStorageService.Categories
  ): UploadOptions {
    const baseOptions: UploadOptions = {
      category: this.Categories[category],
    };

    switch (category) {
      case "RECIPES":
        return {
          ...baseOptions,
          maxSize: 5 * 1024 * 1024, // 5MB for recipe images
        };

      case "THUMBNAILS":
        return {
          ...baseOptions,
          maxSize: 2 * 1024 * 1024, // 2MB for thumbnails
        };

      case "HERO":
        return {
          ...baseOptions,
          maxSize: 10 * 1024 * 1024, // 10MB for hero images
        };

      default:
        return baseOptions;
    }
  }
}

// Utility functions for common use cases

/**
 * Quick upload for recipe images
 */
export async function uploadRecipeImage(file: File): Promise<UploadResult> {
  return ImageStorageService.uploadImage(
    file,
    ImageStorageService.getCategoryOptions("RECIPES")
  );
}

/**
 * Quick upload for author avatars
 */
export async function uploadAuthorAvatar(file: File): Promise<UploadResult> {
  return ImageStorageService.uploadImage(
    file,
    ImageStorageService.getCategoryOptions("AUTHORS")
  );
}

/**
 * Quick upload for process step images
 */
export async function uploadProcessImage(file: File): Promise<UploadResult> {
  return ImageStorageService.uploadImage(
    file,
    ImageStorageService.getCategoryOptions("PROCESS")
  );
}
