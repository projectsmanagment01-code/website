/**
 * Image Downloader Service
 */

import { logger } from '../../utils/logger';
import { ImageDownloadRequest, ImageDownloadResult } from '../../types/image.types';
import { retryWithBackoff } from '../../utils/retry';
import { ImageError } from '../../utils/errors';

export class ImageDownloaderService {
  /**
   * Download image from URL
   */
  async downloadImage(request: ImageDownloadRequest): Promise<ImageDownloadResult> {
    logger.info('Downloading reference image', { url: request.url });

    try {
      const result = await retryWithBackoff(async () => {
        const response = await fetch(request.url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save to file system
        const fs = await import('fs/promises');
        const path = await import('path');

        // Ensure directory exists
        const dir = path.dirname(request.savePath);
        await fs.mkdir(dir, { recursive: true });

        // Write file
        await fs.writeFile(request.savePath, buffer);

        return request.savePath;
      });

      logger.info('Reference image downloaded successfully');
      return {
        success: true,
        localPath: result,
      };
    } catch (error) {
      logger.error('Failed to download reference image', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const imageDownloader = new ImageDownloaderService();
