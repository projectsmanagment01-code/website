/**
 * Image Download Utility
 * Downloads images from URLs and saves them to server
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface DownloadResult {
  success: boolean;
  localPath?: string;
  filename?: string;
  error?: string;
}

export async function downloadImage(
  imageUrl: string,
  filename: string
): Promise<DownloadResult> {
  try {
    // Fetch image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    // Get image buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'recipes');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save to disk
    const localPath = join(uploadsDir, filename);
    await writeFile(localPath, buffer);

    // Return public path
    const publicPath = `/uploads/recipes/${filename}`;

    return {
      success: true,
      localPath: publicPath,
      filename
    };
  } catch (error: any) {
    console.error('Image download error:', error);
    return {
      success: false,
      error: error.message || 'Failed to download image'
    };
  }
}

export async function downloadMultipleImages(
  imageUrls: string[],
  baseFilename: string
): Promise<DownloadResult[]> {
  const results: DownloadResult[] = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const filename = `${baseFilename}-${i + 1}.jpg`;
    const result = await downloadImage(url, filename);
    results.push(result);
  }

  return results;
}
