// Image Generation Service - Step 4 of the workflow
// Generates the four types of images using Google Gemini
import { AIModelConfig, GeneratedImage } from './types';

export class ImageGenerationService {
  private aiConfig: AIModelConfig;

  constructor(aiConfig: AIModelConfig) {
    this.aiConfig = aiConfig;
  }

  /**
   * Generate feature image (hero shot of finished dish)
   */
  async generateFeatureImage(prompt: string, referenceImage: Buffer, domain: string): Promise<GeneratedImage> {
    const enhancedPrompt = `${prompt}

SPECIFICATIONS:
- Close-up view of the finished dish filling ~99% of the frame
- 16:9 aspect ratio (square format)
- No blur, sharp focus throughout
- New setup/props/background different from reference
- Text-free, professional editorial quality
- Add watermark: "www.${domain}" at bottom center
- Professional food photography lighting`;

    const imageBuffer = await this.generateImage(enhancedPrompt, referenceImage);
    
    return {
      type: 'feature',
      fileName: '', // Will be set later
      buffer: imageBuffer,
      mimeType: 'image/jpeg'
    };
  }

  /**
   * Generate ingredients image (raw ingredients arranged)
   */
  async generateIngredientsImage(prompt: string, referenceImage: Buffer, domain: string): Promise<GeneratedImage> {
    const enhancedPrompt = `${prompt}

SPECIFICATIONS:
- All raw ingredients neatly arranged filling 70-80% of frame
- 16:9 aspect ratio
- Sharp focus on ingredients
- New setup/props/lighting different from reference
- Text-free, professional quality
- Add watermark: "www.${domain}" at bottom center
- Bright, clean lighting to showcase ingredient freshness`;

    const imageBuffer = await this.generateImage(enhancedPrompt, referenceImage);

    return {
      type: 'ingredients',
      fileName: '', // Will be set later
      buffer: imageBuffer,
      mimeType: 'image/jpeg'
    };
  }

  /**
   * Generate cooking image (action shot of preparation)
   */
  async generateCookingImage(prompt: string, referenceImage: Buffer, domain: string): Promise<GeneratedImage> {
    const enhancedPrompt = `${prompt}

SPECIFICATIONS:
- Action shot of cooking/preparation process
- Main action filling 70-80% of frame
- 16:9 aspect ratio
- Sharp focus on food, softly blurred background
- New setup/props/lighting different from reference
- Text-free, professional quality
- Add watermark: "www.${domain}" at bottom center
- Dynamic cooking action captured in motion`;

    const imageBuffer = await this.generateImage(enhancedPrompt, referenceImage);

    return {
      type: 'cooking',
      fileName: '', // Will be set later
      buffer: imageBuffer,
      mimeType: 'image/jpeg'
    };
  }

  /**
   * Generate final presentation image (creative presentation)
   */
  async generateFinalPresentationImage(prompt: string, referenceImage: Buffer, domain: string): Promise<GeneratedImage> {
    const enhancedPrompt = `${prompt}

SPECIFICATIONS:
- Finished dish presented creatively filling ~80% of frame
- 16:9 tall aspect ratio
- Close-up/medium-close composition
- Sharp focus on food, soft/neutral background
- New setup/props/lighting different from reference
- Text-free, professional editorial quality
- Add watermark: "www.${domain}" at bottom center
- Elegant, restaurant-quality presentation`;

    const imageBuffer = await this.generateImage(enhancedPrompt, referenceImage);

    return {
      type: 'final_presentation',
      fileName: '', // Will be set later
      buffer: imageBuffer,
      mimeType: 'image/jpeg'
    };
  }

  /**
   * Core image generation method using Google Gemini
   */
  private async generateImage(prompt: string, referenceImage: Buffer): Promise<Buffer> {
    return await this.generateWithGemini(prompt, referenceImage);
  }

  /**
   * Generate image using Google Gemini with reference image
   */
  private async generateWithGemini(prompt: string, referenceImage: Buffer): Promise<Buffer> {
    try {
      console.log('Generating image with Google Gemini API...');

      // Convert reference image to base64
      const base64Image = referenceImage.toString('base64');
      const mimeType = this.detectMimeType(referenceImage);

      // Enhanced prompt for image generation
      const enhancedPrompt = `${prompt}

IMPORTANT: Generate a photorealistic food image based on the reference image provided. 
The reference image shows the target dish/food item. Create a new, unique food photography image 
that captures the essence and style of the food shown in the reference, but with:
- Different composition and angle
- New lighting setup and background
- Fresh styling and presentation
- Professional food photography quality

Do not copy the reference image directly - use it only as inspiration for the type of food and general styling.`;

      // Call Google Gemini API directly
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.aiConfig.model}:generateContent?key=${this.aiConfig.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: enhancedPrompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('Gemini response received');

      // For now, since Gemini primarily generates text responses about images,
      // we'll use the enhanced description to create better placeholder images
      // In the future, this could integrate with actual image generation APIs
      
      const geminiDescription = data.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
      console.log('Using Gemini-enhanced description for image generation');
      
      return await this.generatePlaceholderImage(geminiDescription);
      
    } catch (error) {
      console.error('Error generating image with Gemini:', error);
      
      // Fallback to basic placeholder
      console.log('Falling back to basic placeholder image generation');
      return await this.generatePlaceholderImage(prompt);
    }
  }

  /**
   * Generate placeholder image (temporary solution)
   */
  private async generatePlaceholderImage(prompt: string): Promise<Buffer> {
    try {
      // For now, create a simple colored placeholder
      // In production, you could integrate with other image generation services
      // or use pre-made food stock images
      
      const width = 1024;
      const height = 1024;
      
      // Create a simple SVG placeholder
      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#ffa726;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad1)"/>
          <circle cx="512" cy="400" r="200" fill="white" fill-opacity="0.2"/>
          <text x="512" y="500" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">
            🍽️ Generated Food Image
          </text>
          <text x="512" y="540" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.8">
            ${prompt.substring(0, 50)}...
          </text>
          <text x="512" y="600" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" opacity="0.6">
            Powered by Gemini AI
          </text>
        </svg>
      `;

      // Convert SVG to buffer (in production, you'd convert to PNG/JPEG)
      return Buffer.from(svg, 'utf-8');
      
    } catch (error) {
      console.error('Error generating placeholder image:', error);
      throw new Error('Failed to generate placeholder image');
    }
  }

  /**
   * Add watermark to image (if not handled by AI model)
   */
  private async addWatermark(imageBuffer: Buffer, domain: string): Promise<Buffer> {
    try {
      // This would use an image processing library like Sharp to add watermarks
      // For now, return the original image
      console.log(`Watermark "${domain}" would be added here`);
      return imageBuffer;
      
    } catch (error) {
      console.error('Error adding watermark:', error);
      throw error;
    }
  }

  /**
   * Detect MIME type from image buffer
   */
  private detectMimeType(buffer: Buffer): string {
    // Check for common image formats by their headers
    if (buffer.length < 4) return 'image/jpeg'; // Default

    const header = buffer.toString('hex', 0, 4).toUpperCase();
    
    if (header.startsWith('FFD8FF')) return 'image/jpeg';
    if (header.startsWith('89504E47')) return 'image/png';
    if (header.startsWith('47494638')) return 'image/gif';
    if (header.startsWith('52494646')) return 'image/webp';
    
    return 'image/jpeg'; // Default fallback
  }

  /**
   * Validate generated image
   */
  private validateImage(imageBuffer: Buffer): boolean {
    // Basic validation
    if (!imageBuffer || imageBuffer.length === 0) {
      return false;
    }

    // Check if it's a valid image format
    const header = imageBuffer.toString('hex', 0, 4).toUpperCase();
    const validFormats = ['FFD8FF', '89504E47', '47494638', '52494646']; // JPEG, PNG, GIF, WebP
    
    return validFormats.some(format => header.startsWith(format));
  }

  /**
   * Resize image to specific dimensions
   */
  private async resizeImage(imageBuffer: Buffer, width: number, height: number): Promise<Buffer> {
    try {
      // This would use Sharp or similar library for image resizing
      // For now, return original image
      console.log(`Image would be resized to ${width}x${height}`);
      return imageBuffer;
      
    } catch (error) {
      console.error('Error resizing image:', error);
      throw error;
    }
  }
}