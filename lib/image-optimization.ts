/**
 * Advanced Sharp-based Image Optimization System
 * Replaces Next.js basic image optimization with intelligent, content-aware processing
 */

import sharp, { Sharp } from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';

// Configuration constants
export const IMAGE_CONFIG = {
  // Quality settings for different content types
  quality: {
    photo: { avif: 85, webp: 90, jpeg: 92 },
    illustration: { avif: 90, webp: 95, jpeg: 95 },
    icon: { avif: 95, webp: 100, jpeg: 100 },
    thumbnail: { avif: 80, webp: 85, jpeg: 88 }
  },
  
  // Device breakpoints for responsive images
  breakpoints: [320, 640, 768, 1024, 1280, 1536, 1920, 2560],
  
  // Supported formats in order of preference
  formats: ['avif', 'webp', 'jpeg', 'png'] as const,
  
  // Content-aware thresholds
  thresholds: {
    largeImage: 1920 * 1080,
    smallImage: 400 * 400,
    iconSize: 128 * 128
  },
  
  // Cache settings
  cache: {
    ttl: 31536000, // 1 year
    directory: 'uploads/.cache'
  }
};

export type SupportedFormat = typeof IMAGE_CONFIG.formats[number];
export type ContentType = keyof typeof IMAGE_CONFIG.quality;

export interface OptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: SupportedFormat;
  contentType?: ContentType;
  progressive?: boolean;
  lossless?: boolean;
  blur?: number;
  sharpen?: boolean;
  autoOrient?: boolean;
  stripMetadata?: boolean;
}

export interface OptimizationResult {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
  originalSize: number;
  compressionRatio: number;
  metadata: sharp.Metadata;
}

export class ImageOptimizer {
  private cacheDir: string;

  constructor() {
    this.cacheDir = path.join(process.cwd(), IMAGE_CONFIG.cache.directory);
    this.ensureCacheDirectory();
  }

  /**
   * Ensure cache directory exists
   */
  private async ensureCacheDirectory(): Promise<void> {
    try {
      await fs.access(this.cacheDir);
    } catch {
      await fs.mkdir(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Generate cache key for image optimization
   */
  private generateCacheKey(filePath: string, options: OptimizationOptions): string {
    const hash = createHash('md5');
    hash.update(filePath);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
  }

  /**
   * Get cached optimized image
   */
  private async getCachedImage(cacheKey: string, format: string): Promise<Buffer | null> {
    try {
      const cachePath = path.join(this.cacheDir, `${cacheKey}.${format}`);
      await fs.access(cachePath);
      return await fs.readFile(cachePath);
    } catch {
      return null;
    }
  }

  /**
   * Cache optimized image
   */
  private async cacheImage(cacheKey: string, format: string, buffer: Buffer): Promise<void> {
    try {
      const cachePath = path.join(this.cacheDir, `${cacheKey}.${format}`);
      await fs.writeFile(cachePath, buffer);
    } catch (error) {
      console.warn('Failed to cache image:', error);
    }
  }

  /**
   * Analyze image content to determine optimal settings
   */
  private async analyzeContent(sharpInstance: Sharp): Promise<ContentType> {
    const metadata = await sharpInstance.metadata();
    const { width = 0, height = 0, density = 72, channels = 3 } = metadata;
    
    const pixelCount = width * height;
    const aspectRatio = width / height;
    
    // Determine content type based on image characteristics
    if (pixelCount < IMAGE_CONFIG.thresholds.iconSize) {
      return 'icon';
    }
    
    if (pixelCount < IMAGE_CONFIG.thresholds.smallImage) {
      return 'thumbnail';
    }
    
    // Check for typical illustration characteristics
    if (channels <= 3 && density <= 72 && (aspectRatio > 2 || aspectRatio < 0.5)) {
      return 'illustration';
    }
    
    return 'photo';
  }

  /**
   * Get optimal quality based on content type and format
   */
  private getOptimalQuality(contentType: ContentType, format: SupportedFormat, customQuality?: number): number {
    if (customQuality) return Math.min(Math.max(customQuality, 1), 100);
    return IMAGE_CONFIG.quality[contentType][format as keyof typeof IMAGE_CONFIG.quality[ContentType]];
  }

  /**
   * Apply content-aware sharpening
   */
  private applySharpening(sharpInstance: Sharp, contentType: ContentType): Sharp {
    if (contentType === 'photo') {
      // Subtle sharpening for photos
      return sharpInstance.sharpen({ sigma: 1.0, m1: 1.0, m2: 2.0, x1: 2.0, y2: 10.0, y3: 20.0 });
    } else if (contentType === 'illustration' || contentType === 'icon') {
      // More aggressive sharpening for illustrations/icons
      return sharpInstance.sharpen({ sigma: 1.5, m1: 1.5, m2: 3.0, x1: 2.0, y2: 15.0, y3: 25.0 });
    }
    return sharpInstance;
  }

  /**
   * Get optimal resize algorithm based on content
   */
  private getResizeKernel(contentType: ContentType): sharp.ResizeOptions['kernel'] {
    switch (contentType) {
      case 'icon':
      case 'illustration':
        return 'nearest'; // Preserve sharp edges
      case 'thumbnail':
        return 'cubic'; // Good balance for small images
      default:
        return 'lanczos3'; // Best quality for photos
    }
  }

  /**
   * Main optimization function
   */
  async optimize(filePath: string, options: OptimizationOptions = {}): Promise<OptimizationResult> {
    const {
      width,
      height,
      format = 'webp',
      progressive = true,
      autoOrient = true,
      stripMetadata = true,
      sharpen = true,
      blur,
      lossless = false
    } = options;

    // Generate cache key
    const cacheKey = this.generateCacheKey(filePath, options);
    
    // Try to get cached image
    const cachedBuffer = await this.getCachedImage(cacheKey, format);
    if (cachedBuffer) {
      const metadata = await sharp(cachedBuffer).metadata();
      const originalStats = await fs.stat(filePath);
      
      return {
        buffer: cachedBuffer,
        format,
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: cachedBuffer.length,
        originalSize: originalStats.size,
        compressionRatio: originalStats.size / cachedBuffer.length,
        metadata
      };
    }

    // Load and analyze image
    let sharpInstance = sharp(filePath);
    const originalMetadata = await sharpInstance.metadata();
    const originalStats = await fs.stat(filePath);
    
    // Auto-detect content type if not provided
    const contentType = options.contentType || await this.analyzeContent(sharpInstance);
    
    // Auto-orientation
    if (autoOrient) {
      sharpInstance = sharpInstance.rotate();
    }

    // Resize if dimensions specified
    if (width || height) {
      const resizeOptions: sharp.ResizeOptions = {
        width,
        height,
        fit: 'cover',
        position: 'center',
        kernel: this.getResizeKernel(contentType),
        withoutEnlargement: true
      };
      sharpInstance = sharpInstance.resize(resizeOptions);
    }

    // Apply blur if specified
    if (blur && blur > 0) {
      sharpInstance = sharpInstance.blur(blur);
    }

    // Apply content-aware sharpening
    if (sharpen && !blur) {
      sharpInstance = this.applySharpening(sharpInstance, contentType);
    }

    // Strip metadata for smaller files
    if (stripMetadata) {
      sharpInstance = sharpInstance.withMetadata({});
    }

    // Apply format-specific optimizations
    const quality = this.getOptimalQuality(contentType, format, options.quality);
    
    switch (format) {
      case 'avif':
        sharpInstance = sharpInstance.avif({
          quality,
          lossless,
          effort: 6, // Max compression effort
          chromaSubsampling: contentType === 'photo' ? '4:2:0' : '4:4:4'
        });
        break;
        
      case 'webp':
        sharpInstance = sharpInstance.webp({
          quality,
          lossless,
          effort: 6,
          smartSubsample: true,
          nearLossless: contentType === 'icon'
        });
        break;
        
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({
          quality,
          progressive,
          mozjpeg: true, // Use mozjpeg encoder for better compression
          chromaSubsampling: contentType === 'photo' ? '4:2:0' : '4:4:4',
          trellisQuantisation: true,
          overshootDeringing: true,
          optimiseScans: true
        });
        break;
        
      case 'png':
        sharpInstance = sharpInstance.png({
          compressionLevel: 9,
          adaptiveFiltering: true,
          force: false // Allow conversion to palette if beneficial
        });
        break;
    }

    // Generate optimized buffer
    const optimizedBuffer = await sharpInstance.toBuffer();
    const finalMetadata = await sharp(optimizedBuffer).metadata();
    
    // Cache the result
    await this.cacheImage(cacheKey, format, optimizedBuffer);
    
    const result: OptimizationResult = {
      buffer: optimizedBuffer,
      format,
      width: finalMetadata.width || 0,
      height: finalMetadata.height || 0,
      size: optimizedBuffer.length,
      originalSize: originalStats.size,
      compressionRatio: originalStats.size / optimizedBuffer.length,
      metadata: finalMetadata
    };

    console.log('🎯 Advanced optimization complete:', {
      contentType,
      originalSize: this.formatBytes(result.originalSize),
      optimizedSize: this.formatBytes(result.size),
      compressionRatio: `${result.compressionRatio.toFixed(2)}x`,
      quality,
      format,
      dimensions: `${result.width}x${result.height}`
    });

    return result;
  }

  /**
   * Generate responsive image set
   */
  async generateResponsiveSet(
    filePath: string, 
    targetFormat: SupportedFormat = 'webp',
    customBreakpoints?: number[]
  ): Promise<{ [width: number]: OptimizationResult }> {
    const breakpoints = customBreakpoints || IMAGE_CONFIG.breakpoints;
    const results: { [width: number]: OptimizationResult } = {};
    
    // Get original dimensions to avoid unnecessary upscaling
    const originalMetadata = await sharp(filePath).metadata();
    const originalWidth = originalMetadata.width || 0;
    
    for (const width of breakpoints) {
      if (width <= originalWidth) {
        results[width] = await this.optimize(filePath, {
          width,
          format: targetFormat,
          contentType: width <= 400 ? 'thumbnail' : 'photo'
        });
      }
    }
    
    return results;
  }

  /**
   * Generate placeholder image (LQIP - Low Quality Image Placeholder)
   */
  async generatePlaceholder(filePath: string, width: number = 20): Promise<string> {
    const result = await this.optimize(filePath, {
      width,
      quality: 20,
      format: 'jpeg',
      blur: 1,
      stripMetadata: true
    });
    
    return `data:image/jpeg;base64,${result.buffer.toString('base64')}`;
  }

  /**
   * Utility function to format bytes
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.cacheDir, file)))
      );
      console.log('🧹 Image cache cleared');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const imageOptimizer = new ImageOptimizer();