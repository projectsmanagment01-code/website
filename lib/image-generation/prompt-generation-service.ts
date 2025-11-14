// AI Prompt Generation Service - Step 1 of the workflow
import { AIModelConfig, RecipeData, ImagePrompts } from './types';

export class PromptGenerationService {
  private aiConfig: AIModelConfig;

  constructor(aiConfig: AIModelConfig) {
    this.aiConfig = aiConfig;
  }

  /**
   * Generate four descriptive image prompts using AI
   */
  async generatePrompts(recipeData: RecipeData): Promise<ImagePrompts> {
    try {
      const systemMessage = this.buildSystemMessage();
      const userMessage = this.buildUserMessage(recipeData);

      const response = await this.callAIModel(systemMessage, userMessage);
      const cleanedResponse = this.cleanJsonResponse(response);
      
      return this.validatePrompts(cleanedResponse);
    } catch (error) {
      console.error('Error generating prompts:', error);
      throw new Error(`Failed to generate image prompts: ${error.message}`);
    }
  }

  /**
   * Build the system message for AI prompt generation
   */
  private buildSystemMessage(): string {
    return `You are a professional food photography prompt generator. Your task is to generate four distinct, highly realistic, and visually cohesive image prompts for a single recipe.

REQUIREMENTS:
- Generate four distinct image prompts for different stages of the cooking process
- Each prompt must describe a different stage: feature, ingredients, cooking, final presentation
- Maintain consistent lighting, camera angle, and setting across all four photos
- Make them look like a series from the same professional photoshoot
- Two images use bright natural sunlight, two use professional studio lighting (your choice)
- All images are 16:9 tall aspect ratio
- Backgrounds must be detailed and realistic, never blurred
- Focus on photorealistic, editorial-quality food photography

OUTPUT FORMAT:
Return a JSON object with exactly these keys:
{
  "image_1_feature": "single-line prompt for feature image",
  "image_2_ingredients": "single-line prompt for ingredients image", 
  "image_3_cooking": "single-line prompt for cooking process image",
  "image_4_final_presentation": "single-line prompt for final presentation image"
}

STYLE GUIDELINES:
- Use descriptive, specific language
- Include lighting details (natural sunlight or studio lighting)  
- Specify camera angles and composition
- Mention props, surfaces, and background details
- Emphasize texture, color, and visual appeal
- Each prompt should be 1-2 sentences maximum`;
  }

  /**
   * Build the user message with recipe data
   */
  private buildUserMessage(recipeData: RecipeData): string {
    return `Generate four professional food photography prompts for this recipe:

Title: ${recipeData.seoTitle}
Description: ${recipeData.seoDescription}
Keyword: ${recipeData.seoKeyword}
Category: ${recipeData.category}

Create prompts that capture the essence of this dish across four stages:
1. Feature image - hero shot of the finished dish
2. Ingredients image - raw ingredients beautifully arranged  
3. Cooking image - action shot of the preparation/cooking process
4. Final presentation image - creative presentation of the completed dish

Make sure all four images feel like they belong to the same photoshoot with consistent styling and lighting.`;
  }

  /**
   * Call the AI model based on configuration
   */
  private async callAIModel(systemMessage: string, userMessage: string): Promise<string> {
    switch (this.aiConfig.provider) {
      case 'gemini':
        return await this.callGeminiModel(systemMessage, userMessage);
      default:
        throw new Error(`Unsupported AI provider: ${this.aiConfig.provider}. Only 'gemini' is supported.`);
    }
  }

  /**
   * Call Google Gemini API
   */
  private async callGeminiModel(systemMessage: string, userMessage: string): Promise<string> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.aiConfig.model}:generateContent?key=${this.aiConfig.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `${systemMessage}\n\n${userMessage}` }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  /**
   * Clean JSON response from AI model
   */
  private cleanJsonResponse(response: string): any {
    try {
      // Remove markdown code blocks if present
      let cleaned = response.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Parse JSON
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.error('Raw response:', response);
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  /**
   * Validate that all required prompts are present
   */
  private validatePrompts(prompts: any): ImagePrompts {
    const requiredKeys = [
      'image_1_feature',
      'image_2_ingredients', 
      'image_3_cooking',
      'image_4_final_presentation'
    ];

    for (const key of requiredKeys) {
      if (!prompts[key] || typeof prompts[key] !== 'string') {
        throw new Error(`Missing or invalid prompt: ${key}`);
      }
    }

    return prompts as ImagePrompts;
  }
}