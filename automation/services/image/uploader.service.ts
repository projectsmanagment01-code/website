/**
 * Image Uploader Service - Upload images to website
 */

import { automationEnv } from '../../config/env';
import { AUTOMATION_CONSTANTS } from '../../config/constants';
import { logger } from '../../utils/logger';
import { ImageUploadRequest, ImageUploadResult } from '../../types/image.types';
import { retryWithBackoff, withTimeout } from '../../utils/retry';
import { ImageError } from '../../utils/errors';

export class ImageUploaderService {
  private apiUrl: string;
  private apiToken: string;

  constructor() {
    this.apiUrl = automationEnv.website.apiUrl;
    this.apiToken = automationEnv.website.apiToken;
  }

  /**
   * Upload image to website
   */
  async uploadImage(request: ImageUploadRequest): Promise<ImageUploadResult> {
    logger.info(`Uploading image: ${request.filename}`);

    try {
      const result = await retryWithBackoff(
        () =>
          withTimeout(
            this.performUpload(request),
            AUTOMATION_CONSTANTS.TIMEOUTS.UPLOAD
          ),
        { maxAttempts: 3 }
      );

      logger.info('Image uploaded successfully', { url: result });
      return {
        success: true,
        url: result,
      };
    } catch (error) {
      logger.error('Failed to upload image', error);
      throw new ImageError('Failed to upload image to website');
    }
  }

  /**
   * Perform the actual upload
   */
  private async performUpload(request: ImageUploadRequest): Promise<string> {
    const fs = await import('fs/promises');
    const FormData = (await import('formdata-node')).FormData;
    const { File } = await import('formdata-node');

    // Read file
    const fileBuffer = await fs.readFile(request.imagePath);
    const file = new File([fileBuffer], request.filename, {
      type: this.getContentType(request.filename),
    });

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', request.category);

    // Upload
    const response = await fetch(`${this.apiUrl}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: formData as any,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // API returns { url: "..." }
    if (!data.url) {
      throw new Error('No URL in upload response');
    }

    return data.url;
  }

  /**
   * Get content type from filename
   */
  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const types: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    };
    return types[ext || ''] || 'application/octet-stream';
  }
}

export const imageUploader = new ImageUploaderService();
