/**
 * Image Provider Types
 * Defines interfaces for different image generation providers (Gemini, Midjourney, etc.)
 */

export type ImageProvider = 'gemini' | 'midjourney';

export interface ImageGenerationConfig {
  provider: ImageProvider;
  apiKey: string;
  webhookSecret?: string;
  promptTemplate?: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  referenceImageUrl?: string;
  recipeTitle: string;
  seoKeyword: string;
  imageNumber: 1 | 2 | 3 | 4;
}

export interface ImageGenerationResult {
  success: boolean;
  imageData?: string; // base64 for Gemini
  imageUrls?: string[]; // URLs for Midjourney (4 images)
  filename?: string;
  error?: string;
  taskId?: string; // For async providers like Midjourney
}

export interface IImageProvider {
  /**
   * Generate images using the provider
   */
  generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResult>;

  /**
   * Get provider name
   */
  getProviderName(): ImageProvider;

  /**
   * Check if provider is configured correctly
   */
  isConfigured(): boolean;
}
