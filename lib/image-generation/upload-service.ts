// Upload Service - Handles uploading generated images to API endpoints
export class UploadService {

  /**
   * Upload an image to the specified API endpoint
   */
  async uploadImage(
    imageBuffer: Buffer,
    fileName: string,
    domain: string,
    token: string,
    category: string = 'recipes'
  ): Promise<string> {
    try {
      console.log(`Uploading image: ${fileName} to ${domain}`);
      
      const uploadUrl = `https://${domain}/api/upload`;
      const formData = new FormData();
      
      // Create blob from buffer
      const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' });
      
      // Append form data
      formData.append('category', category);
      formData.append('file', blob, fileName);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      const uploadedUrl = result.url;
      
      if (!uploadedUrl) {
        throw new Error('No URL returned from upload API');
      }

      console.log(`Successfully uploaded: ${fileName} -> ${uploadedUrl}`);
      return uploadedUrl;
      
    } catch (error) {
      console.error(`Error uploading image ${fileName}:`, error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple images in parallel
   */
  async uploadImages(
    images: Array<{
      buffer: Buffer;
      fileName: string;
    }>,
    domain: string,
    token: string,
    category: string = 'recipes'
  ): Promise<string[]> {
    try {
      const uploadPromises = images.map(image => 
        this.uploadImage(image.buffer, image.fileName, domain, token, category)
      );
      
      return await Promise.all(uploadPromises);
      
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error;
    }
  }

  /**
   * Upload images with retry logic
   */
  async uploadWithRetry(
    imageBuffer: Buffer,
    fileName: string,
    domain: string,
    token: string,
    category: string = 'recipes',
    maxRetries: number = 3
  ): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Upload attempt ${attempt}/${maxRetries} for ${fileName}`);
        return await this.uploadImage(imageBuffer, fileName, domain, token, category);
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`Upload attempt ${attempt} failed for ${fileName}:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
        }
      }
    }
    
    throw new Error(`Failed to upload ${fileName} after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Validate upload response
   */
  private validateUploadResponse(response: any): boolean {
    return response && 
           typeof response === 'object' && 
           typeof response.url === 'string' && 
           response.url.length > 0;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if domain is reachable
   */
  async checkDomainHealth(domain: string): Promise<boolean> {
    try {
      const response = await fetch(`https://${domain}/api/health`, {
        method: 'GET',
        timeout: 5000
      } as RequestInit);
      
      return response.ok;
      
    } catch (error) {
      console.warn(`Domain health check failed for ${domain}:`, error);
      return false;
    }
  }

  /**
   * Get upload endpoint info
   */
  async getUploadEndpointInfo(domain: string, token: string): Promise<{
    maxFileSize: number;
    allowedFormats: string[];
    uploadPath: string;
  }> {
    try {
      const response = await fetch(`https://${domain}/api/upload/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get upload info: ${response.status}`);
      }

      const info = await response.json();
      
      return {
        maxFileSize: info.maxFileSize || 10 * 1024 * 1024, // 10MB default
        allowedFormats: info.allowedFormats || ['jpg', 'jpeg', 'png', 'webp'],
        uploadPath: info.uploadPath || '/api/upload'
      };
      
    } catch (error) {
      console.warn('Could not get upload endpoint info, using defaults:', error);
      return {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        uploadPath: '/api/upload'
      };
    }
  }

  /**
   * Validate image before upload
   */
  validateImageForUpload(
    imageBuffer: Buffer,
    fileName: string,
    maxFileSize: number = 10 * 1024 * 1024,
    allowedFormats: string[] = ['jpg', 'jpeg', 'png', 'webp']
  ): { isValid: boolean; error?: string } {
    // Check file size
    if (imageBuffer.length > maxFileSize) {
      return {
        isValid: false,
        error: `File size ${imageBuffer.length} exceeds maximum ${maxFileSize} bytes`
      };
    }

    // Check file extension
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension || !allowedFormats.includes(extension)) {
      return {
        isValid: false,
        error: `File extension ${extension} not allowed. Allowed: ${allowedFormats.join(', ')}`
      };
    }

    // Check if buffer contains valid image data
    if (imageBuffer.length < 100) {
      return {
        isValid: false,
        error: 'Image buffer too small, likely corrupted'
      };
    }

    return { isValid: true };
  }

  /**
   * Compress image before upload if needed
   */
  async compressIfNeeded(
    imageBuffer: Buffer, 
    maxFileSize: number = 5 * 1024 * 1024
  ): Promise<Buffer> {
    if (imageBuffer.length <= maxFileSize) {
      return imageBuffer;
    }

    try {
      // This would integrate with Sharp or similar library for compression
      console.log(`Image size ${imageBuffer.length} exceeds ${maxFileSize}, compression needed`);
      
      // For now, return original (compression would be implemented here)
      return imageBuffer;
      
    } catch (error) {
      console.warn('Image compression failed, using original:', error);
      return imageBuffer;
    }
  }
}