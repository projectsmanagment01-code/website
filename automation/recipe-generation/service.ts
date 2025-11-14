/**
 * Recipe Generation Service - Core Logic
 */

import { getGeminiKey } from '@/lib/ai-settings-helper';
import { getAutomationSettings } from '@/lib/automation-settings';

export interface RecipeGenerationInput {
  seoKeyword: string;
  seoTitle: string;
  seoDescription: string;
  seoCategory: string;
  featureImage: string;
  preparationImage: string;
  cookingImage: string;
  finalPresentationImage: string;
  authorId: string;
  recipeId: string;
  categoryId?: string; // Matched category ID from database
  categoryName?: string; // Matched category name
  categorySlug?: string; // Matched category slug
  spyData?: any; // Original spy data for reference
}

export interface RecipeGenerationResult {
  success: boolean;
  recipeData?: any;
  error?: string;
}

export class RecipeGenerationService {
  /**
   * Generate UUID v4 for recipe ID
   */
  static generateRecipeId(): string {
    return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Build the recipe generation prompt from recipeprompt.md
   * Uses custom prompt from settings if available, otherwise uses default
   */
  private static async buildRecipePrompt(): Promise<string> {
    try {
      const settings = await getAutomationSettings();
      if (settings?.recipePromptSystemPrompt && settings.recipePromptSystemPrompt.trim()) {
        console.log('📝 Using custom recipe prompt from settings');
        return settings.recipePromptSystemPrompt;
      }
    } catch (error) {
      console.warn('⚠️ Could not load custom recipe prompt, using default');
    }
    
    console.log('📝 Using default recipe prompt');
    return this.getDefaultRecipePrompt();
  }

  /**
   * Default hardcoded recipe prompt (fallback)
   */
  private static getDefaultRecipePrompt(): string {
    return `You are an advanced AI recipe generator. Generate ONLY a valid JSON object - no explanations, no markdown, no extra text.

VOICE: Write as a warm 40-year-old woman home cook. Use conversational tone with words like "honestly," "yeah," "so," "I mean." Focus on feelings, textures, smells, and memories.

RULES:
- Output ONLY valid JSON matching the exact schema below
- Use "id" field (NOT "recipeId")
- Map images: featureImage=image1, preparationImage=image2, cookingImage=image3, finalPresentationImage=image4
- heroImage and img = same as featureImage
- NO alcohol or pork (substitute: pork→lamb, bacon→turkey ham, wine→broth)
- Fill ALL arrays with rich content - never leave empty
- Generate slug from title (lowercase-with-hyphens)
- href = /recipes/{slug}
- categoryLink and categoryHref = /categories/{category}

REQUIRED STRUCTURE:
{
  "id": "use provided ID",
  "authorId": "use provided authorId",
  "title": "",
  "slug": "",
  "category": "",
  "categoryLink": "",
  "categoryHref": "",
  "description": "",
  "shortDescription": "",
  "intro": "2-3 warm paragraphs",
  "story": "3-4 engaging paragraphs with memories",
  "testimonial": "enthusiastic review quote",
  "featureImage": "image1",
  "preparationImage": "image2",
  "cookingImage": "image3",
  "finalPresentationImage": "image4",
  "heroImage": "image1",
  "img": "image1",
  "imageAlt": "",
  "timing": {"prepTime":"","cookTime":"","totalTime":"","riseDough":""},
  "recipeInfo": {"difficulty":"","cuisine":"","servings":"","dietary":"","course":"","method":""},
  "ingredients": [{"section":"","items":[""]}],
  "instructions": [{"step":"1","instruction":""}],
  "whyYouLove": {"type":"list","title":"Why You'll Love This Recipe","items":["at least 5-6 items"]},
  "essIngredientGuide": [{"ingredient":"","note":"detailed note"}],
  "completeProcess": [{"title":"","type":"steps","items":[""]}],
  "questions": {"title":"Frequently Asked Questions","items":[{"question":"","answer":""}]},
  "mustKnowTips": ["at least 5-7 tips"],
  "professionalSecrets": ["at least 4-5 secrets"],
  "serving": "detailed paragraph",
  "storage": "detailed paragraph",
  "allergyInfo": "comprehensive info",
  "nutritionDisclaimer": "warm disclaimer",
  "notes": ["at least 4-5 notes"],
  "tools": ["at least 6-8 tools"],
  "author": {"name":"","bio":"","avatar":"","link":""},
  "featuredText": "",
  "updatedDate": "2024-10-13T00:00:00Z",
  "status": "published",
  "href": ""
}

Generate complete JSON with ALL fields filled. No truncation.`;
  }

  /**
   * Generate a complete recipe using Gemini AI
   */
  static async generateRecipe(input: RecipeGenerationInput): Promise<RecipeGenerationResult> {
    try {
      const apiKey = await getGeminiKey();
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      console.log(`📝 Generating recipe for: ${input.seoTitle}`);

      // Build the user prompt with all the input data
      const userPrompt = this.buildUserPrompt(input);
      const systemPrompt = await this.buildRecipePrompt();

      // Call Gemini API with maximum token limit for complete recipe generation
      // Using gemini-2.5-pro for highest quality and output capacity
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: systemPrompt },
                { text: userPrompt }
              ]
            }],
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192, // Maximum output tokens
              responseMimeType: 'application/json' // Request JSON response
            }
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      // Check for finish reason
      const candidate = result.candidates?.[0];
      const finishReason = candidate?.finishReason;
      
      console.log(`📊 Gemini finish reason: ${finishReason}`);
      
      // Check if response was truncated
      if (finishReason === 'MAX_TOKENS' || finishReason === 'SAFETY') {
        console.error('⚠️ Response was truncated or blocked:', finishReason);
        throw new Error(`Recipe generation incomplete: Response was ${finishReason === 'MAX_TOKENS' ? 'truncated due to length limit' : 'blocked by safety filters'}. Try using a simpler recipe or reduce content requirements.`);
      }
      
      const generatedText = candidate?.content?.parts?.[0]?.text;

      if (!generatedText) {
        console.error('Full response:', JSON.stringify(result, null, 2));
        throw new Error('No content generated from Gemini API');
      }

      console.log(`📝 Generated text length: ${generatedText.length} characters`);

      // Parse the JSON response
      const recipeData = this.parseRecipeJSON(generatedText);

      // Add category info if provided
      if (input.categoryId) {
        recipeData.categoryId = input.categoryId;
      }
      if (input.categoryName) {
        recipeData.category = input.categoryName;
      }
      if (input.categorySlug) {
        recipeData.categoryLink = `/categories/${input.categorySlug}`;
        recipeData.categoryHref = `/categories/${input.categorySlug}`;
      }

      console.log(`✅ Recipe generated successfully: ${recipeData.title}`);

      return {
        success: true,
        recipeData
      };

    } catch (error) {
      console.error('❌ Recipe generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build the user prompt with input data
   */
  private static buildUserPrompt(input: RecipeGenerationInput): string {
    return `Generate complete recipe JSON:

id: ${input.recipeId}
authorId: ${input.authorId}
title: ${input.seoTitle}
description: ${input.seoDescription}
keyword: ${input.seoKeyword}
category: ${input.seoCategory}

Images:
1. ${input.featureImage}
2. ${input.preparationImage}
3. ${input.cookingImage}
4. ${input.finalPresentationImage}

Output valid JSON with ALL fields filled. Include 5+ whyYouLove items, 4+ essIngredientGuide, 3+ completeProcess sections, 5+ questions, 5+ tips, 4+ secrets, 4+ notes, 6+ tools, detailed ingredients and 8+ instruction steps.`;
  }

  /**
   * Validate that recipe has rich content (not empty arrays/fields)
   */
  private static validateRecipeContent(recipe: any): void {
    const contentValidation = [
      { field: 'intro', minLength: 50, type: 'string' },
      { field: 'story', minLength: 100, type: 'string' },
      { field: 'testimonial', minLength: 30, type: 'string' },
      { field: 'essIngredientGuide', minLength: 2, type: 'array' },
      { field: 'completeProcess', minLength: 1, type: 'array' },
      { field: 'mustKnowTips', minLength: 2, type: 'array' },
      { field: 'professionalSecrets', minLength: 2, type: 'array' },
      { field: 'notes', minLength: 2, type: 'array' },
      { field: 'tools', minLength: 2, type: 'array' },
      { field: 'ingredients', minLength: 1, type: 'array' },
      { field: 'instructions', minLength: 3, type: 'array' }
    ];

    const errors: string[] = [];

    for (const validation of contentValidation) {
      const fieldPath = validation.field.split('.');
      let value = recipe;
      
      // Navigate nested fields
      for (const key of fieldPath) {
        value = value?.[key];
      }

      if (validation.type === 'string') {
        if (!value || typeof value !== 'string' || value.length < validation.minLength) {
          errors.push(`Field "${validation.field}" must be a string with at least ${validation.minLength} characters`);
        }
      } else if (validation.type === 'array') {
        if (!Array.isArray(value) || value.length < validation.minLength) {
          errors.push(`Field "${validation.field}" must be an array with at least ${validation.minLength} items`);
        }
      }
    }

    // Special validation for nested objects (whyYouLove and questions can have different structures)
    if (recipe.whyYouLove) {
      if (Array.isArray(recipe.whyYouLove.items) && recipe.whyYouLove.items.length < 3) {
        errors.push('Field "whyYouLove.items" must have at least 3 items');
      } else if (typeof recipe.whyYouLove === 'string' && recipe.whyYouLove.length < 50) {
        errors.push('Field "whyYouLove" must be a detailed string or object with items array');
      }
    }

    if (recipe.questions) {
      if (Array.isArray(recipe.questions.items) && recipe.questions.items.length < 3) {
        errors.push('Field "questions.items" must have at least 3 items');
      }
    }

    if (errors.length > 0) {
      console.error('❌ Recipe content validation failed:');
      errors.forEach(err => console.error(`  - ${err}`));
      throw new Error(`Recipe content is incomplete or lacks depth. The AI must generate rich, detailed content for all fields. Errors: ${errors.join('; ')}`);
    }

    console.log('✅ Recipe content validation passed - all fields have rich content');
  }

  /**
   * Parse and validate the recipe JSON from Gemini response
   */
  private static parseRecipeJSON(text: string): any {
    // Remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    try {
      const parsed = JSON.parse(cleanText);
      
      // Handle both "id" and "recipeId" (AI might use either)
      if (parsed.recipeId && !parsed.id) {
        parsed.id = parsed.recipeId;
      }
      
      // Validate required fields exist
      const requiredFields = ['id', 'title', 'slug', 'category', 'ingredients', 'instructions'];
      for (const field of requiredFields) {
        if (!parsed[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate that content is rich and complete
      this.validateRecipeContent(parsed);

      return parsed;
    } catch (error) {
      console.error('Failed to parse recipe JSON:', error);
      console.error('Raw text length:', text.length);
      console.error('First 1000 chars:', text.substring(0, 1000));
      console.error('Last 500 chars:', text.substring(text.length - 500));
      throw new Error('Failed to parse recipe JSON from AI response');
    }
  }
}
