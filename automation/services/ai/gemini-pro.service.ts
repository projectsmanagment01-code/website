/**
 * Gemini Pro Service - For complex recipe article generation
 */

import { automationEnv } from '../../config/env';
import { AUTOMATION_CONSTANTS } from '../../config/constants';
import { logger } from '../../utils/logger';
import { retryWithBackoff, withTimeout } from '../../utils/retry';
import { AIError } from '../../utils/errors';
import { RecipeArticleData } from '../../types/recipe.types';

export class GeminiProService {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = automationEnv.gemini.apiKey;
    this.model = automationEnv.gemini.proModel;
  }

  /**
   * Generate complete recipe article
   */
  async generateRecipeArticle(params: {
    title: string;
    description: string;
    category: string;
    categoryId: string;
    authorId: string;
    keyword?: string;
    images: {
      feature: string;
      ingredients: string;
      cooking: string;
      final: string;
    };
    sitemap?: string[];
  }): Promise<RecipeArticleData> {
    logger.info('Generating recipe article with Gemini Pro', {
      title: params.title,
    });

    const systemInstruction = await this.getRecipePrompt();
    const userPrompt = this.buildUserPrompt(params);

    try {
      const result = await retryWithBackoff(
        () =>
          withTimeout(
            this.makeRequest(systemInstruction, userPrompt),
            AUTOMATION_CONSTANTS.TIMEOUTS.GEMINI_API * 2 // Longer timeout for articles
          ),
        { maxAttempts: 2 }
      );

      logger.info('Recipe article generated successfully');
      return result as RecipeArticleData;
    } catch (error) {
      logger.error('Failed to generate recipe article', error);
      throw new AIError(
        'Failed to generate recipe article with Gemini',
        AUTOMATION_CONSTANTS.STEPS.GENERATE_ARTICLE
      );
    }
  }

  /**
   * Build user prompt with all recipe data
   */
  private buildUserPrompt(params: any): string {
    return `Generate a complete recipe article with the following details:

RECIPE INFORMATION:
- Title: ${params.title}
- Description: ${params.description}
- Category: ${params.category}
- Category ID: ${params.categoryId}
- Author ID: ${params.authorId}
${params.keyword ? `- SEO Keyword: ${params.keyword}` : ''}

IMAGES (use these exact URLs):
- Feature Image: ${params.images.feature}
- Ingredients Image: ${params.images.ingredients}
- Cooking Image: ${params.images.cooking}
- Final Presentation: ${params.images.final}

${params.sitemap && params.sitemap.length > 0 ? `SITEMAP FOR INTERNAL LINKING:\n${params.sitemap.join('\n')}` : ''}

Generate a complete, valid JSON recipe article following the schema. Ensure all fields are filled with high-quality, human-like content.`;
  }

  /**
   * Get the recipe generation prompt from file
   */
  private async getRecipePrompt(): Promise<string> {
    // Read the Prompt.txt file
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const promptPath = path.join(process.cwd(), 'Prompt.txt');
    
    try {
      const promptContent = await fs.readFile(promptPath, 'utf-8');
      return promptContent;
    } catch (error) {
      logger.warn('Prompt.txt not found, using default prompt');
      return this.getDefaultPrompt();
    }
  }

  /**
   * Default recipe generation prompt (fallback)
   */
  private getDefaultPrompt(): string {
    return `You are an advanced AI agent that generates complete recipe data strictly in valid JSON format.

PRIMARY OBJECTIVE:
Generate a fully structured recipe JSON object. Autofill all narrative and technical fields based on the input.

AUTHOR PERSONA:
Write in the voice of a 40-year-old woman — a calm, graceful home cook with a background in design.
- Warm, nostalgic, sensory-driven tone
- Short sentences, conversational rhythm
- Use casual interjections: "honestly," "oops," "so," "yeah," "wow"
- Focus on feelings, textures, smells, memories

CORE RULES:
1. Output ONLY valid JSON - no text, no markdown, no comments
2. Never omit or rename fields
3. Apply ingredient substitutions: pork→lamb, bacon→turkey ham, Italian sausage→beef sausage
4. NO alcohol in any form
5. Build slug from title using lowercase and hyphens
6. Build href as /recipes/{slug}
7. Build categoryLink as /categories/{CategoryName}

Output must match exact schema with all required fields filled with natural, human-quality writing.`;
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
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
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
      logger.warn('Failed to parse JSON, attempting to extract', {
        textPreview: text.substring(0, 200),
      });
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error('Invalid JSON response from Gemini');
    }
  }
}

export const geminiPro = new GeminiProService();
