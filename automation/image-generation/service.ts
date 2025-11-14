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
import { PrismaClient } from "@prisma/client";
import { getAutomationSettings } from "@/lib/automation-settings";

const prisma = new PrismaClient();

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
  /**
   * Get watermark domain from site settings
   * Falls back to NEXT_PUBLIC_BASE_URL or default
   */
  private static async getWatermarkDomain(): Promise<string> {
    try {
      // Try to get from site config in database
      const config = await prisma.siteConfig.findFirst({
        where: { key: 'site' },
        select: { data: true }
      });
      
      if (config?.data && typeof config.data === 'object') {
        const siteData = config.data as any;
        if (siteData.name) {
          // Clean the website name to get domain format
          const cleanName = siteData.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
          return `${cleanName}.com`;
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch site config for watermark, using fallback');
    }
    
    // Fallback to environment variable or default
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'recipeswebsite.com';
    // Extract domain from URL (remove protocol and paths)
    return baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0];
  }
  
  /**
   * Step 1: Generate 4 image prompts using Gemini
   */
  static async generateImagePrompts(input: ImagePromptInput): Promise<ImagePrompts> {
    const apiKey = await getGeminiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const systemPrompt = await this.buildPromptGenerationInstruction();
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
   * Step 2: Generate a single image using Gemini 2.5 Flash Image (Nano Banana)
   */
  static async generateSingleImage(
    prompt: string,
    referenceImageBase64: string | null,
    imageNumber: number,
    seoKeyword: string
  ): Promise<{ imageData: string; filename: string }> {
    const apiKey = await getGeminiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log(`🖼️ Generating image ${imageNumber}/4 using Gemini 2.5 Flash Image (Nano Banana)`);

    // Get dynamic watermark domain
    const watermarkDomain = await this.getWatermarkDomain();
    console.log(`🏷️ Using watermark domain: ${watermarkDomain}`);

    // Add image-specific composition enforcement to prevent duplicates
    let compositionEnforcement = '';
    switch (imageNumber) {
      case 1:
        compositionEnforcement = ' COMPOSITION REQUIREMENT: Close-up 45-degree angle of FINISHED COMPLETE dish. Show the FINAL RESULT ONLY, no raw ingredients, no cooking process. The dish must be fully prepared and plated.';
        break;
      case 2:
        compositionEnforcement = ' COMPOSITION REQUIREMENT: Overhead flat lay from directly above showing ONLY RAW INGREDIENTS separated in bowls and containers. NO finished dish visible, NO cooking process. Ingredients must be uncooked and laid out individually.';
        break;
      case 3:
        compositionEnforcement = ' COMPOSITION REQUIREMENT: Side angle or 3/4 view showing COOKING PROCESS in action. Must show mixing, baking, or preparation IN PROGRESS with steam or motion. NO finished dish, NO raw ingredient layout.';
        break;
      case 4:
        compositionEnforcement = ' COMPOSITION REQUIREMENT: Front view or side profile showing FINISHED dish in STYLED PRESENTATION with decorative elements like flowers, cups, or props. Different angle from image 1, more elegant styling.';
        break;
    }

    // Enhanced prompt with composition enforcement and DYNAMIC watermark instruction
    const enhancedPrompt = `${prompt}${compositionEnforcement}. CRITICAL: This is IMAGE ${imageNumber} of 4 - it MUST be visually distinct from the other 3 images with a completely different composition, subject, and angle. IMPORTANT: Add watermark text "www.${watermarkDomain}" centered at the bottom of the image. The watermark must have a semi-transparent dark background overlay (rgba 0,0,0,0.5) behind the white text to ensure it is clearly visible on any background, especially white or light-colored foods. The watermark should be professional and subtle but always readable.`;

    // Build request parts - include reference image only if available
    const requestParts: any[] = [{ text: enhancedPrompt }];
    
    if (referenceImageBase64) {
      requestParts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: referenceImageBase64
        }
      });
      console.log('ℹ️ Using reference image for generation');
    } else {
      console.log('ℹ️ No reference image available - generating without reference');
    }

    // Use Gemini 2.5 Flash Image API (aka Nano Banana)
    // Add timeout for long-running image generation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout per image

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: requestParts
            }],
            generationConfig: {
              responseModalities: ["Image"],
              imageConfig: {
                aspectRatio: "9:16"
              }
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini Image API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
    
      // Extract image data from response (uses camelCase: inlineData not inline_data)
      const parts = result.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((part: any) => part.inlineData || part.inline_data);
      const imageData = imagePart?.inlineData?.data || imagePart?.inline_data?.data;

      if (!imageData) {
        console.error('❌ Could not find image data in response structure');
        console.error('Response structure:', JSON.stringify(result, null, 2).substring(0, 500));
        throw new Error('No image data received from Gemini Image model');
      }
      
      console.log(`✅ Received image data (${imageData.length} chars)`);

      // Generate filename: seoKeyword + 2 words + timestamp
      const filename = this.generateFilename(seoKeyword, imageNumber);

      return { imageData, filename };
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Image generation timed out after 2 minutes for image ${imageNumber}`);
      }
      
      throw error;
    }
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
    
    return `${cleanKeyword}-${word1}-${word2}-${imageNumber}-${timestamp}.webp`;
  }

  /**
   * Build the IGP.txt prompt instructions
   * Uses custom prompt from settings if available, otherwise uses default
   */
  private static async buildPromptGenerationInstruction(): Promise<string> {
    try {
      const settings = await getAutomationSettings();
      if (settings?.imagePromptSystemPrompt && settings.imagePromptSystemPrompt.trim()) {
        console.log('📝 Using custom image prompt from settings');
        // Add JSON format instruction to custom prompt
        return `${settings.imagePromptSystemPrompt}

Output ONLY valid JSON in this exact format:
{
  "image_1_feature": "Finished dish prompt with specific angle and composition",
  "image_2_ingredients": "Raw ingredients prompt with different angle and composition",
  "image_3_cooking": "Cooking process prompt with different angle and composition",
  "image_4_final_presentation": "Styled presentation prompt with different angle and composition"
}`;
      }
    } catch (error) {
      console.warn('⚠️ Could not load custom image prompt, using default');
    }
    
    console.log('📝 Using default image prompt');
    return this.getDefaultImagePrompt();
  }

  /**
   * Default hardcoded image prompt (fallback)
   */
  private static getDefaultImagePrompt(): string {
    return `You are an AI agent responsible for generating FOUR COMPLETELY DIFFERENT AND UNIQUE image prompts for a single recipe. Each prompt MUST describe a DISTINCT stage with DIFFERENT composition, angle, and subject matter. DUPLICATES ARE STRICTLY FORBIDDEN.

CRITICAL REQUIREMENTS:
- ALL images must be set in a KITCHEN ENVIRONMENT ONLY - kitchen counter, kitchen table, or cooking area
- NO HUMANS, NO HANDS, NO BODY PARTS, NO PEOPLE - completely human-free food photography
- All four images share the same kitchen environment, decor, and visual tone
- Every image must be captured in a 16:9 tall aspect ratio
- Background must remain detailed, rich, and realistic — never blurred
- Kitchen setting should be visible (counter, utensils, kitchen decor) but food is the focus

MANDATORY UNIQUENESS REQUIREMENTS - EACH IMAGE MUST BE DIFFERENT:

1. IMAGE 1 - FINISHED DISH HERO SHOT:
   - MUST show the COMPLETE finished dish as the main subject
   - Close-up angled view of the plated final result on kitchen surface
   - Finished cake/dish fully decorated and complete
   - Camera angle: 45-degree angle from above
   - NO raw ingredients visible, NO cooking process, ONLY the final result
   - Example: "Finished brown sugar chai cake on kitchen counter, decorated with frosting swirls and cinnamon sticks, 45-degree angle, warm kitchen lighting, no people"

2. IMAGE 2 - RAW INGREDIENTS LAYOUT (MUST BE COMPLETELY DIFFERENT FROM IMAGE 1):
   - MUST show ONLY raw, uncooked ingredients laid out separately
   - NO finished dish visible, NO cooking in progress
   - Ingredients in individual bowls, measuring cups, on cutting board
   - Overhead flat lay view from directly above
   - Camera angle: straight down from top
   - Example: "Raw ingredients for chai cake on kitchen counter, flour in bowl, sugar, eggs, spices in separate containers, overhead flat lay, no people, no hands"

3. IMAGE 3 - COOKING ACTION SHOT (MUST BE COMPLETELY DIFFERENT FROM IMAGES 1 AND 2):
   - MUST show cooking/mixing/baking IN PROGRESS
   - Batter being mixed, cake in oven visible through glass, or mixing bowl with whisk
   - Steam, bubbles, or action visible
   - Side angle or 3/4 view showing the process
   - NO finished dish, NO raw ingredients layout
   - Example: "Cake batter being mixed in stand mixer on kitchen counter, visible swirls in bowl, side angle view, kitchen in background, no hands visible"

4. IMAGE 4 - STYLED PRESENTATION (MUST BE COMPLETELY DIFFERENT FROM ALL PREVIOUS):
   - MUST show finished dish in an ELEGANT table setting
   - Dish presented with complementary items like coffee cups, flowers, decorative plates
   - Different angle than image 1 (front view or side profile)
   - More styling and props than image 1
   - Example: "Brown sugar chai cake on decorative cake stand with coffee cups and flowers on kitchen table, side profile view, elegant presentation, no people"

STRICT ANTI-DUPLICATION RULES:
- Each image MUST have different subject matter (finished vs ingredients vs cooking vs styled)
- Each image MUST have different camera angle (45-degree vs overhead vs side vs front)
- Each image MUST be visually distinct - someone should immediately see the difference
- If two images look similar, you have FAILED the task

IMPORTANT: Every prompt MUST explicitly mention "kitchen" or "kitchen counter" and MUST specify "no people, no hands visible, human-free".

Output ONLY valid JSON in this exact format:
{
  "image_1_feature": "Finished dish prompt with specific angle and composition",
  "image_2_ingredients": "Raw ingredients prompt with different angle and composition",
  "image_3_cooking": "Cooking process prompt with different angle and composition",
  "image_4_final_presentation": "Styled presentation prompt with different angle and composition"
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
   * Returns null if image URL is missing or invalid - image is optional
   */
  static async imageUrlToBase64(imageUrl: string | null | undefined): Promise<string | null> {
    // Image is optional - return null if not provided
    if (!imageUrl || imageUrl.trim() === '') {
      console.log('ℹ️ No image URL provided - skipping base64 conversion (image is optional)');
      return null;
    }

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch image from ${imageUrl}: ${response.statusText} - continuing without image`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer.toString('base64');
    } catch (error) {
      console.warn(`⚠️ Failed to convert image to base64: ${error instanceof Error ? error.message : 'Unknown error'} - continuing without image`);
      return null;
    }
  }
}
