// File Naming Service - Dynamic filename generation
export class FileNamingService {
  private randomWords = [
    'flavor', 'taste', 'bliss', 'delight', 'savory', 'sweet', 'spicy', 'fresh',
    'crispy', 'tender', 'juicy', 'creamy', 'rich', 'zesty', 'aromatic', 'golden',
    'perfect', 'homemade', 'gourmet', 'classic', 'modern', 'fusion', 'artisan',
    'premium', 'authentic', 'traditional', 'innovative', 'delicious', 'amazing',
    'incredible', 'wonderful', 'fantastic', 'ultimate', 'best', 'signature'
  ];

  /**
   * Generate a unique filename for an image
   */
  generateFileName(
    keyword: string, 
    imageType: 'feature' | 'ingredients' | 'cooking' | 'final_presentation',
    extension: string = 'jpg'
  ): string {
    try {
      // Sanitize the keyword
      const safeKeyword = this.sanitizeKeyword(keyword);
      
      // Get a random word
      const randomWord = this.getRandomWord();
      
      // Generate unique suffix
      const uniqueSuffix = this.generateUniqueSuffix();
      
      // Construct filename based on image type
      const typePrefix = this.getTypePrefix(imageType);
      const baseName = `${safeKeyword}_${typePrefix}_${randomWord}_${uniqueSuffix}`;
      
      return `${baseName}.${extension}`;
      
    } catch (error) {
      console.error('Error generating filename:', error);
      // Fallback filename
      const timestamp = Date.now();
      return `recipe_${imageType}_${timestamp}.${extension}`;
    }
  }

  /**
   * Generate multiple filenames for all image types
   */
  generateFileNames(keyword: string, extension: string = 'jpg'): {
    feature: string;
    ingredients: string;
    cooking: string;
    final_presentation: string;
  } {
    return {
      feature: this.generateFileName(keyword, 'feature', extension),
      ingredients: this.generateFileName(keyword, 'ingredients', extension),
      cooking: this.generateFileName(keyword, 'cooking', extension),
      final_presentation: this.generateFileName(keyword, 'final_presentation', extension)
    };
  }

  /**
   * Sanitize keyword to be filename-safe
   */
  private sanitizeKeyword(keyword: string): string {
    return keyword
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_')         // Replace spaces with underscores
      .replace(/_+/g, '_')          // Remove multiple underscores
      .replace(/^_|_$/g, '')        // Remove leading/trailing underscores
      .substring(0, 30);            // Limit length
  }

  /**
   * Get a random word from the list
   */
  private getRandomWord(): string {
    const randomIndex = Math.floor(Math.random() * this.randomWords.length);
    return this.randomWords[randomIndex];
  }

  /**
   * Generate a unique suffix using timestamp and random number
   */
  private generateUniqueSuffix(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${timestamp}_${random}`;
  }

  /**
   * Get prefix based on image type
   */
  private getTypePrefix(imageType: 'feature' | 'ingredients' | 'cooking' | 'final_presentation'): string {
    const prefixes = {
      feature: 'hero',
      ingredients: 'ingredients',
      cooking: 'process',
      final_presentation: 'final'
    };
    
    return prefixes[imageType];
  }

  /**
   * Extract file extension from filename or mime type
   */
  getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif'
    };
    
    return mimeToExt[mimeType as keyof typeof mimeToExt] || 'jpg';
  }

  /**
   * Validate filename is safe and meets requirements
   */
  validateFileName(filename: string): boolean {
    // Check basic requirements
    if (!filename || filename.length === 0) return false;
    if (filename.length > 255) return false;
    
    // Check for valid characters
    const validPattern = /^[a-zA-Z0-9._-]+$/;
    if (!validPattern.test(filename)) return false;
    
    // Check for valid extension
    const extension = filename.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!extension || !validExtensions.includes(extension)) return false;
    
    return true;
  }

  /**
   * Generate SEO-friendly alt text for images
   */
  generateAltText(keyword: string, imageType: 'feature' | 'ingredients' | 'cooking' | 'final_presentation'): string {
    const typeDescriptions = {
      feature: 'delicious homemade recipe',
      ingredients: 'fresh ingredients for cooking',
      cooking: 'cooking process and preparation',
      final_presentation: 'beautifully presented dish'
    };
    
    const cleanKeyword = keyword.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    return `${cleanKeyword} - ${typeDescriptions[imageType]}`;
  }

  /**
   * Generate filename with SEO considerations
   */
  generateSEOFileName(
    keyword: string,
    imageType: 'feature' | 'ingredients' | 'cooking' | 'final_presentation',
    includeDate: boolean = false
  ): string {
    const safeKeyword = this.sanitizeKeyword(keyword);
    const typePrefix = this.getTypePrefix(imageType);
    
    let filename = `${safeKeyword}-${typePrefix}`;
    
    if (includeDate) {
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      filename += `-${date}`;
    }
    
    // Add unique suffix to prevent collisions
    const uniqueId = Math.floor(Math.random() * 10000);
    filename += `-${uniqueId}`;
    
    return `${filename}.jpg`;
  }
}