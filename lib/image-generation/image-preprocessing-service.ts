// Image Preprocessing Service - Step 3 of the workflow
// This service cleans up Pinterest-style collages, removes text, watermarks, etc.
import { AIModelConfig } from './types';

export class ImagePreprocessingService {
  private aiConfig: AIModelConfig;

  constructor(aiConfig: AIModelConfig) {
    this.aiConfig = aiConfig;
  }

  /**
   * Clean and preprocess a spy pin image using AI
   * Removes Pinterest collages, text, watermarks, and unifies multiple food images
   */
  async cleanImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      console.log('Starting image preprocessing...');
      
      const prompt = this.buildPreprocessingPrompt();
      const processedImageBuffer = await this.callImageProcessingAPI(imageBuffer, prompt);
      
      console.log('Image preprocessing completed successfully');
      return processedImageBuffer;
      
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw new Error(`Failed to preprocess image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build the preprocessing prompt for AI image manipulation
   */
  private buildPreprocessingPrompt(): string {
    return `Clean up this Pinterest-style image and create a single, cohesive food photograph:

TASKS:
1. Detect and ignore all non-food elements (text, frames, watermarks, logos, Pinterest UI elements)
2. If multiple food images are in a grid or collage, combine their visual cues into one unified dish image
3. Remove any overlay text, captions, or design elements
4. Create a single, high-quality, realistic photo showing only one cohesive food subject
5. Place the food on a clean, appropriate background (wooden table, marble counter, etc.)
6. Ensure natural lighting and realistic food textures
7. Remove any Pinterest-specific branding or watermarks

OUTPUT REQUIREMENTS:
- Single food image, never a grid or collage
- Clean background without text or design elements  
- Natural, realistic lighting and colors
- High quality, professional food photography look
- Focus on the main dish/food item only
- Realistic textures and presentation`;
  }

  /**
   * Call AI image processing API based on configuration
   */
  private async callImageProcessingAPI(imageBuffer: Buffer, prompt: string): Promise<Buffer> {
    switch (this.aiConfig.provider) {
      case 'github':
        return await this.callGitHubImageAPI(imageBuffer, prompt);
      case 'azure':
        return await this.callAzureImageAPI(imageBuffer, prompt);
      case 'openai':
        return await this.callOpenAIImageAPI(imageBuffer, prompt);
      default:
        throw new Error(`Unsupported AI provider for image processing: ${this.aiConfig.provider}`);
    }
  }

  /**
   * Call GitHub Models Vision API for image preprocessing
   */
  private async callGitHubImageAPI(imageBuffer: Buffer, prompt: string): Promise<Buffer> {
    try {
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.detectMimeType(imageBuffer);

      const response = await fetch('https://models.github.ai/inference/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.aiConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.aiConfig.model || 'openai/gpt-4o', // Use vision model
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      // For now, return original image as GitHub models don't support image editing
      // This would need to be integrated with an actual image editing API
      console.log('Note: GitHub models do not support image editing, returning original image');
      return imageBuffer;
      
    } catch (error) {
      console.error('Error calling GitHub image API:', error);
      throw error;
    }
  }

  /**
   * Call Azure AI Vision API for image preprocessing
   */
  private async callAzureImageAPI(imageBuffer: Buffer, prompt: string): Promise<Buffer> {
    try {
      // This would integrate with Azure Computer Vision or Azure OpenAI DALL-E for image editing
      // For now, return original image as placeholder
      console.log('Note: Azure image editing integration needed, returning original image');
      return imageBuffer;
      
    } catch (error) {
      console.error('Error calling Azure image API:', error);
      throw error;
    }
  }

  /**
   * Call OpenAI DALL-E API for image preprocessing
   */
  private async callOpenAIImageAPI(imageBuffer: Buffer, prompt: string): Promise<Buffer> {
    try {
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.detectMimeType(imageBuffer);

      // Use OpenAI's image editing endpoint
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(imageBuffer)], { type: mimeType });
      formData.append('image', blob, 'image.png');
      formData.append('prompt', prompt);
      formData.append('n', '1');
      formData.append('size', '1024x1024');

      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.aiConfig.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const editedImageUrl = data.data[0]?.url;
      
      if (!editedImageUrl) {
        throw new Error('No edited image URL returned from OpenAI');
      }

      // Download the edited image
      const imageResponse = await fetch(editedImageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to download edited image from OpenAI');
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      return Buffer.from(arrayBuffer);
      
    } catch (error) {
      console.error('Error calling OpenAI image API:', error);
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
   * Basic image validation and cleanup without AI (fallback)
   */
  async basicCleanup(imageBuffer: Buffer): Promise<Buffer> {
    try {
      // This could implement basic image processing using libraries like Sharp
      // For now, just return the original image
      console.log('Performing basic image cleanup (fallback mode)');
      return imageBuffer;
      
    } catch (error) {
      console.error('Error in basic image cleanup:', error);
      throw error;
    }
  }
}