/**
 * Pinterest Spy Image Generation Service
 * 
 * Handles:
 * 1. Generating 4 image prompts using AI (IGP.txt strategy)
 * 2. Generating actual images using Google Imagen 3
 * 3. Uploading images to server
 * 4. Managing image URLs and metadata
 */

import { getGeminiKey } from "@/lib/ai-settings-helper";

export interface ImagePromptInput {
  recipeTitle: string;
  recipeDescription: string;
  recipeKeyword: string;
  recipeCategory: string;
}

export interface ImagePrompts {
  image_1_feature: string;
  image_2_ingredients: string;
  image_3_cooking: string;
  image_4_final_presentation: string;
}

export interface GeneratedImage {
  imageNumber: number;
  promptUsed: string;
  imageUrl: string;
  filename: string;
  mimeType: string;
}

export class ImageGenerationService {
  private static readonly DOMAIN = "recipeswebsite.com";
  
  /**
   * Step 1: Generate 4 image prompts using Gemini
   */
  static async generateImagePrompts(input: ImagePromptInput): Promise<ImagePrompts> {
    const apiKey = await getGeminiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const systemPrompt = this.buildPromptGenerationInstruction();
    const userPrompt = `Recipe: ${input.recipeTitle}\nDescription: ${input.recipeDescription}\nKeyword: ${input.recipeKeyword}\nCategory: ${input.recipeCategory}`;

    console.log('🎨 Generating 4 image prompts for:', input.recipeTitle);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content received from Gemini');
    }

    return this.parseImagePrompts(content);
  }

  /**
   * Step 2: Generate a single image using Google Imagen 3
   */
  static async generateSingleImage(
    prompt: string,
    referenceImageBase64: string,
    imageNumber: number,
    seoKeyword: string
  ): Promise<{ imageData: string; filename: string }> {
    const apiKey = await getGeminiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log(`🖼️ Generating image ${imageNumber}/4 using Imagen 3`);

    // Enhanced prompt with watermark instruction
    const enhancedPrompt = `${prompt}. Include watermark text "www.${this.DOMAIN}" centered at bottom of image in subtle white text.`;

    // Use Imagen 3 API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{
            prompt: enhancedPrompt,
            image: {
              bytesBase64Encoded: referenceImageBase64
            },
            parameters: {
              sampleCount: 1,
              aspectRatio: "9:16", // Tall aspect ratio
              safetyFilterLevel: "block_few",
              personGeneration: "dont_allow"
            }
          }]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Imagen API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const imageData = result.predictions?.[0]?.bytesBase64Encoded;

    if (!imageData) {
      throw new Error('No image data received from Imagen');
    }

    // Generate filename: seoKeyword + 2 words + timestamp
    const filename = this.generateFilename(seoKeyword, imageNumber);

    return { imageData, filename };
  }

  /**
   * Generate unique filename
   */
  private static generateFilename(seoKeyword: string, imageNumber: number): string {
    const cleanKeyword = seoKeyword.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const words = ['delicious', 'recipe', 'homemade', 'easy', 'perfect', 'tasty'];
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    const timestamp = Date.now();
    
    return `${cleanKeyword}-${word1}-${word2}-${imageNumber}-${timestamp}.jpg`;
  }

  /**
   * Build the IGP.txt prompt instructions
   */
  private static buildPromptGenerationInstruction(): string {
    return `You are an AI agent responsible for generating four separate, highly realistic, and visually cohesive image prompts for a single recipe. Each prompt must describe one stage of the same cooking scene and environment, ensuring lighting, camera angle, and setting consistency across all four photos.

CRITICAL REQUIREMENTS:
- All four images share the same environment, decor, and visual tone
- Feature image focuses on the food with close-up framing
- Two images must use bright natural sunlight, two must use professional studio lighting
- Every image must be captured in a 16:9 tall aspect ratio
- Background must remain detailed, rich, and realistic — never blurred
- Focus remains on the food, but the full environment must be visible and crisp

Generate four separate, detailed, single-line descriptive prompts in valid JSON format:
- image_1_feature: Close-up view of finished dish in focus, rich colors, 16:9 tall ratio, no blur
- image_2_ingredients: All raw ingredients neatly arranged, with bowls, utensils, cutting boards
- image_3_cooking: Action shot of cooking/assembling process with visible steam or textures
- image_4_final_presentation: Completed dish presented creatively and stylishly

Each prompt should be one continuous line without special characters, underscores, or quotation marks inside.

Output ONLY valid JSON in this exact format:
{
  "image_1_feature": "prompt text here",
  "image_2_ingredients": "prompt text here",
  "image_3_cooking": "prompt text here",
  "image_4_final_presentation": "prompt text here"
}`;
  }

  /**
   * Parse AI response to extract image prompts
   */
  private static parseImagePrompts(content: string): ImagePrompts {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate all required fields exist
      const required = ['image_1_feature', 'image_2_ingredients', 'image_3_cooking', 'image_4_final_presentation'];
      for (const field of required) {
        if (!parsed[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      console.log('✅ Generated 4 image prompts successfully');
      return parsed as ImagePrompts;
    } catch (error) {
      console.error('❌ Failed to parse image prompts:', error);
      console.log('Raw response:', content);
      throw new Error(`Failed to parse image prompts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert image URL to base64
   */
  static async imageUrlToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer.toString('base64');
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
