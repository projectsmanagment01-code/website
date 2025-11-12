/**
 * Gemini Flash Service - For image prompts and quick AI tasks
 */

import { automationEnv } from '../../config/env';
import { AUTOMATION_CONSTANTS } from '../../config/constants';
import { logger } from '../../utils/logger';
import { retryWithBackoff, withTimeout } from '../../utils/retry';
import { AIError } from '../../utils/errors';

export class GeminiFlashService {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = automationEnv.gemini.apiKey;
    this.model = automationEnv.gemini.flashModel;
  }

  /**
   * Generate image prompts for recipe
   */
  async generateImagePrompts(recipeData: {
    title: string;
    description?: string;
    category: string;
  }): Promise<{
    image_1_feature: string;
    image_2_ingredients: string;
    image_3_cooking: string;
    image_4_final_presentation: string;
  }> {
    logger.info('Generating image prompts with Gemini Flash', {
      recipe: recipeData.title,
    });

    const systemInstruction = `You are an expert food photographer and prompt engineer. Generate 4 distinct, detailed image prompts for AI image generation (Midjourney/DALL-E style).

Requirements:
- Generate exactly 4 prompts in JSON format
- Each prompt should be 40-60 words
- Maintain consistent lighting, style, and perspective across all 4 images
- Use professional food photography terminology
- Include camera angles, lighting details, and composition
- Make prompts vivid and specific

Output format (JSON only, no markdown):
{
  "image_1_feature": "...",
  "image_2_ingredients": "...",
  "image_3_cooking": "...",
  "image_4_final_presentation": "..."
}`;

    const userPrompt = `Generate 4 image prompts for this recipe:
Title: ${recipeData.title}
Category: ${recipeData.category}
${recipeData.description ? `Description: ${recipeData.description}` : ''}

Create prompts for:
1. Feature image (hero shot of the final dish)
2. Ingredients (all ingredients laid out)
3. Cooking process (mid-cooking stage)
4. Final presentation (plated dish, restaurant style)`;

    try {
      const result = await retryWithBackoff(
        () =>
          withTimeout(
            this.makeRequest(systemInstruction, userPrompt),
            AUTOMATION_CONSTANTS.TIMEOUTS.GEMINI_API
          ),
        { maxAttempts: 2 }
      );

      logger.info('Image prompts generated successfully');
      return result;
    } catch (error) {
      logger.error('Failed to generate image prompts', error);
      throw new AIError(
        'Failed to generate image prompts with Gemini',
        AUTOMATION_CONSTANTS.STEPS.GENERATE_PROMPTS
      );
    }
  }

  /**
   * Generate Pinterest description
   */
  async generatePinterestDescription(recipe: {
    title: string;
    description?: string;
  }): Promise<{
    title: string;
    description: string;
    category: string;
  }> {
    logger.info('Generating Pinterest description', { recipe: recipe.title });

    const systemInstruction = `You are a Pinterest marketing expert. Create engaging Pinterest content.

Requirements:
- Rewrite the title to be more appealing (keep similar meaning)
- Create 2-3 sentence description that's sensory and enticing
- Use warm, inviting language
- NO hashtags, NO emojis
- Assign appropriate Pinterest category

Output format (JSON only):
{
  "title": "...",
  "description": "...",
  "category": "..."
}

Valid categories: Food and Drink, Desserts, Dinner, Lunch, Breakfast, Appetizers`;

    const userPrompt = `Recipe: ${recipe.title}
${recipe.description ? `Description: ${recipe.description}` : ''}

Create Pinterest content for this recipe.`;

    try {
      const result = await retryWithBackoff(
        () => this.makeRequest(systemInstruction, userPrompt),
        { maxAttempts: 2 }
      );

      logger.info('Pinterest description generated');
      return result;
    } catch (error) {
      logger.error('Failed to generate Pinterest description', error);
      throw new AIError('Failed to generate Pinterest description');
    }
  }

  /**
   * Make API request to Gemini
   */
  private async makeRequest(
    systemInstruction: string,
    userPrompt: string
  ): Promise<any> {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        response_mime_type: 'application/json',
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini API');
    }

    // Parse JSON response
    try {
      return JSON.parse(text);
    } catch {
      logger.warn('Failed to parse JSON, attempting to extract', { text });
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error('Invalid JSON response from Gemini');
    }
  }
}

export const geminiFlash = new GeminiFlashService();
