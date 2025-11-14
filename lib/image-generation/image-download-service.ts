// Image Download Service - Step 2 of the workflow
export class ImageDownloadService {
  
  /**
   * Download an image from a URL
   */
  async downloadImage(url: string): Promise<Buffer> {
    try {
      console.log(`Downloading image from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log(`Successfully downloaded image: ${buffer.length} bytes`);
      return buffer;
      
    } catch (error) {
      console.error(`Error downloading image from ${url}:`, error);
      throw new Error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download multiple images in parallel
   */
  async downloadImages(urls: string[]): Promise<Buffer[]> {
    try {
      const downloadPromises = urls.map(url => this.downloadImage(url));
      return await Promise.all(downloadPromises);
    } catch (error) {
      console.error('Error downloading multiple images:', error);
      throw error;
    }
  }

  /**
   * Validate if a URL points to a valid image
   */
  async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) return false;
      
      const contentType = response.headers.get('content-type');
      return contentType ? contentType.startsWith('image/') : false;
      
    } catch (error) {
      console.error(`Error validating image URL ${url}:`, error);
      return false;
    }
  }

  /**
   * Get image metadata without downloading the full image
   */
  async getImageMetadata(url: string): Promise<{
    contentType: string;
    contentLength?: number;
    lastModified?: string;
  }> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        contentType: response.headers.get('content-type') || 'unknown',
        contentLength: response.headers.get('content-length') ? 
          parseInt(response.headers.get('content-length')!) : undefined,
        lastModified: response.headers.get('last-modified') || undefined
      };
      
    } catch (error) {
      console.error(`Error getting image metadata for ${url}:`, error);
      throw error;
    }
  }
}