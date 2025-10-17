import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { AppError } from '../middleware/error-handler';

interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
}

interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
  thumbnailBuffer?: Buffer;
  thumbnailPath?: string;
}

export class ImageProcessor {
  /**
   * Process image with Sharp: resize, optimize, convert format
   */
  static async process(
    inputBuffer: Buffer,
    options: ProcessImageOptions = {}
  ): Promise<ProcessedImage> {
    try {
      const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 85,
        format = 'webp',
        generateThumbnail = true,
        thumbnailWidth = 400,
      } = options;

      // Get metadata
      const metadata = await sharp(inputBuffer).metadata();

      // Auto-rotate based on EXIF orientation
      let pipeline = sharp(inputBuffer).rotate();

      // Resize if image is larger than max dimensions
      if (
        metadata.width && metadata.height &&
        (metadata.width > maxWidth || metadata.height > maxHeight)
      ) {
        pipeline = pipeline.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert to target format and optimize
      switch (format) {
        case 'webp':
          pipeline = pipeline.webp({ quality, effort: 6 });
          break;
        case 'avif':
          pipeline = pipeline.avif({ quality, effort: 6 });
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality, mozjpeg: true });
          break;
        case 'png':
          pipeline = pipeline.png({ quality, compressionLevel: 9 });
          break;
      }

      // Process main image
      const processedBuffer = await pipeline.toBuffer();
      const processedMetadata = await sharp(processedBuffer).metadata();

      const result: ProcessedImage = {
        buffer: processedBuffer,
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        format: processedMetadata.format || format,
        size: processedBuffer.length,
      };

      // Generate thumbnail if requested
      if (generateThumbnail) {
        const thumbnailBuffer = await sharp(inputBuffer)
          .rotate()
          .resize(thumbnailWidth, null, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();

        result.thumbnailBuffer = thumbnailBuffer;
      }

      return result;
    } catch (error) {
      console.error('Image processing error:', error);
      throw new AppError('Failed to process image', 500);
    }
  }

  /**
   * Save processed image and thumbnail to disk
   */
  static async saveToDisk(
    buffer: Buffer,
    outputPath: string,
    thumbnailBuffer?: Buffer
  ): Promise<{ path: string; thumbnailPath?: string }> {
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });

      // Save main image
      await fs.writeFile(outputPath, buffer);

      let thumbnailPath: string | undefined;

      // Save thumbnail if provided
      if (thumbnailBuffer) {
        const ext = path.extname(outputPath);
        const basename = path.basename(outputPath, ext);
        thumbnailPath = path.join(dir, `${basename}_thumb${ext}`);
        await fs.writeFile(thumbnailPath, thumbnailBuffer);
      }

      return { path: outputPath, thumbnailPath };
    } catch (error) {
      console.error('Save to disk error:', error);
      throw new AppError('Failed to save image to disk', 500);
    }
  }

  /**
   * Delete image and thumbnail from disk
   */
  static async deleteFromDisk(imagePath: string): Promise<void> {
    try {
      // Delete main image
      await fs.unlink(imagePath);

      // Try to delete thumbnail
      const ext = path.extname(imagePath);
      const basename = path.basename(imagePath, ext);
      const dir = path.dirname(imagePath);
      const thumbnailPath = path.join(dir, `${basename}_thumb${ext}`);

      try {
        await fs.unlink(thumbnailPath);
      } catch (err) {
        // Thumbnail might not exist, ignore error
      }
    } catch (error) {
      console.error('Delete from disk error:', error);
      throw new AppError('Failed to delete image from disk', 500);
    }
  }

  /**
   * Get image metadata without processing
   */
  static async getMetadata(inputBuffer: Buffer) {
    try {
      const metadata = await sharp(inputBuffer).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: metadata.size || 0,
        hasAlpha: metadata.hasAlpha || false,
        orientation: metadata.orientation,
      };
    } catch (error) {
      console.error('Get metadata error:', error);
      throw new AppError('Failed to read image metadata', 400);
    }
  }
}
