/**
 * Image-related type definitions
 */

export interface ImageGenerationRequest {
  prompt: string;
  referenceImagePath?: string;
  aspectRatio?: string;
  type: 'feature' | 'ingredients' | 'cooking' | 'final';
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  localPath?: string;
  error?: string;
}

export interface ImageUploadRequest {
  imagePath: string;
  category: string;
  filename: string;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImageDownloadRequest {
  url: string;
  savePath: string;
}

export interface ImageDownloadResult {
  success: boolean;
  localPath?: string;
  error?: string;
}

export interface PinterestImageData {
  imageUrl: string;
  title: string;
  description: string;
  category: string;
  link: string;
}
