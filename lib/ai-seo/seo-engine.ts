/**
 * AI-Powered SEO Enhancement Engine
 * 
 * This module provides AI-driven SEO optimization for recipes, including:
 * - Automated meta title and description generation
 * - Image alt text generation
 * - Internal link suggestions
 * - Schema markup enhancement
 * - Content optimization recommendations
 */

import { Recipe } from "@/outils/types";

export interface SEOEnhancement {
  id: string;
  type: 'metadata' | 'image' | 'internal-link' | 'schema' | 'content';
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  confidence: number; // 0-1 confidence score
  originalContent?: string;
  suggestedContent: string;
  reasoning: string;
  keywords: string[];
  estimatedImpact: 'low' | 'medium' | 'high';
  createdAt: Date;
  appliedAt?: Date;
}

export interface MetadataSuggestion {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
}

export interface ImageSEOSuggestion {
  imageUrl: string;
  altText: string;
  caption?: string;
  title?: string;
  structuredData?: any;
}

export interface InternalLinkSuggestion {
  anchorText: string;
  targetUrl: string;
  targetPageTitle: string;
  contextBefore: string;
  contextAfter: string;
  relevanceScore: number;
  linkType: 'related-recipe' | 'category' | 'ingredient' | 'technique' | 'author';
}

export class AISeOEngine {
  private readonly basePrompts: Record<string, string>;

  constructor() {
    this.basePrompts = {
      metadata: `You are an expert SEO specialist focused on food and recipe websites. Generate compelling, SEO-optimized metadata that will improve search rankings and click-through rates.`,
      imageAlt: `You are an SEO and accessibility expert. Create descriptive, keyword-rich alt text for recipe images that serves both SEO and accessibility purposes.`,
      internalLinks: `You are an internal linking strategist for a recipe website. Identify opportunities to add relevant internal links that improve user experience and SEO.`,
      contentOptimization: `You are a content SEO expert specializing in recipe websites. Analyze content for SEO improvements while maintaining readability and user value.`
    };
  }

  /**
   * Get AI configuration from admin settings
   */
  private async getAIConfig(): Promise<{ provider: 'openai' | 'gemini', apiKey: string, model: string }> {
    const { loadAISettings, getOpenAIKey, getGeminiKey, getAIProvider } = await import('@/lib/ai-settings-helper');
    
    // Load settings to check if SEO is enabled
    const settings = await loadAISettings();
    
    if (!settings?.enabled) {
      throw new Error('AI is not enabled. Please enable it in Admin Dashboard → AI Plugin settings.');
    }
    
    if (!settings.features?.seoOptimization) {
      throw new Error('SEO Optimization feature is not enabled. Please enable it in Admin Dashboard → AI Plugin → Features.');
    }
    
    const provider = await getAIProvider();
    const apiKey = provider === 'gemini' ? await getGeminiKey() : await getOpenAIKey();
    
    if (!apiKey) {
      throw new Error(`${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API key not configured. Please add it in Admin Dashboard → AI Plugin settings.`);
    }
    
    // Get model from settings or use default
    const model = settings.model || (provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini');
    
    return { provider, apiKey, model };
  }

  /**
   * Call AI API with provider support (OpenAI or Gemini)
   */
  private async callAI(prompt: string): Promise<string> {
    const { provider, apiKey, model } = await this.getAIConfig();
    
    if (provider === 'gemini') {
      return await this.callGemini(prompt, apiKey, model);
    } else {
      return await this.callOpenAI(prompt, apiKey, model);
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string, apiKey: string, model: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Call Gemini API
   */
  private async callGemini(prompt: string, apiKey: string, model: string): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Generate AI-powered metadata suggestions for a recipe
   */
  async generateMetadataSuggestions(recipe: Recipe): Promise<MetadataSuggestion> {
    const prompt = `${this.basePrompts.metadata}

Recipe Data:
- Title: ${recipe.title}
- Description: ${recipe.description}
- Category: ${recipe.category}
- Cuisine: ${recipe.cuisine || 'Not specified'}
- Prep Time: ${recipe.prepTime}
- Cook Time: ${recipe.cookTime}
- Difficulty: ${recipe.difficulty}
- Ingredients: ${recipe.ingredients?.slice(0, 10).join(', ')}

Current SEO Title: ${recipe.title}
Current Description: ${recipe.description}

Tasks:
1. Create an SEO-optimized title (50-60 characters) that includes primary keywords
2. Write a compelling meta description (150-160 characters) that includes benefits and keywords
3. Suggest 5-8 relevant keywords (mix of short and long-tail)
4. Create optimized Open Graph title and description for social sharing
5. Create Twitter-optimized title and description

Focus on:
- Including cooking method, time, and key ingredients in titles
- Emotional triggers in descriptions (easy, delicious, quick, homemade)
- Long-tail keywords that people actually search for
- Clear value propositions

Return as JSON with this structure:
{
  "title": "SEO title here",
  "description": "Meta description here",
  "keywords": ["keyword1", "keyword2", ...],
  "ogTitle": "Social media optimized title",
  "ogDescription": "Social media description",
  "twitterTitle": "Twitter optimized title",
  "twitterDescription": "Twitter description"
}`;

    try {
      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating metadata suggestions:', error);
      return this.getFallbackMetadata(recipe);
    }
  }

  /**
   * Generate SEO-optimized alt text for recipe images
   */
  async generateImageAltText(
    imageUrl: string, 
    recipe: Recipe, 
    imageContext: string = 'hero'
  ): Promise<ImageSEOSuggestion> {
    const prompt = `${this.basePrompts.imageAlt}

Recipe Context:
- Recipe Title: ${recipe.title}
- Category: ${recipe.category}
- Cuisine: ${recipe.cuisine || 'Not specified'}
- Key Ingredients: ${recipe.ingredients?.slice(0, 5).join(', ')}
- Image Context: ${imageContext} (hero, ingredient, step, final-result)

Image URL: ${imageUrl}

Create SEO-optimized image attributes:

1. Alt Text (125 characters max):
   - Descriptive and specific
   - Include recipe name and key visual elements
   - Natural keyword integration
   - Accessible for screen readers

2. Image Caption (optional, 200 characters max):
   - Engaging and informative
   - Include cooking tips or context
   - Can be more promotional

3. Image Title attribute:
   - Concise and keyword-rich
   - Used for tooltips

Guidelines:
- Don't start with "Image of" or "Picture of"
- Be specific about what's shown
- Include relevant cooking terms
- Consider the context (preparation step, final dish, ingredients)

Return as JSON:
{
  "altText": "Alt text here",
  "caption": "Optional caption here",
  "title": "Title attribute here",
  "structuredData": {
    "@type": "ImageObject",
    "caption": "Caption for schema",
    "description": "Longer description"
  }
}`;

    try {
      const response = await this.callAI(prompt);
      return { imageUrl, ...JSON.parse(response) };
    } catch (error) {
      console.error('Error generating image alt text:', error);
      return this.getFallbackImageSEO(imageUrl, recipe, imageContext);
    }
  }

  /**
   * Analyze content and suggest internal links
   */
  async generateInternalLinkSuggestions(
    content: string,
    recipe: Recipe,
    availableRecipes: Recipe[],
    categories: string[]
  ): Promise<InternalLinkSuggestion[]> {
    const prompt = `${this.basePrompts.internalLinks}

Current Recipe:
- Title: ${recipe.title}
- Category: ${recipe.category}
- Content: ${content.substring(0, 2000)}...

Available Internal Pages:
Categories: ${categories.join(', ')}
Related Recipes: ${availableRecipes.slice(0, 20).map(r => `${r.title} (${r.category})`).join(', ')}

Analyze the content and suggest 3-8 strategic internal links that:

1. Add genuine value for users
2. Use natural, keyword-rich anchor text
3. Link to highly relevant pages
4. Improve topical authority
5. Don't disrupt reading flow

For each suggestion, provide:
- Exact anchor text (natural, descriptive, 2-6 words)
- Target URL/page
- Context (surrounding text)
- Relevance score (0-1)
- Link type (related-recipe, category, ingredient, technique)

Prioritize:
- Complementary recipes (same cuisine, similar ingredients)
- Technique explanations
- Ingredient information
- Category hubs

Return as JSON array:
[
  {
    "anchorText": "homemade chocolate cake",
    "targetUrl": "/recipes/chocolate-cake",
    "targetPageTitle": "Easy Chocolate Cake Recipe",
    "contextBefore": "text before link",
    "contextAfter": "text after link",
    "relevanceScore": 0.9,
    "linkType": "related-recipe"
  }
]`;

    try {
      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating internal link suggestions:', error);
      return this.getFallbackInternalLinks(recipe, availableRecipes);
    }
  }

  /**
   * Generate enhanced schema markup suggestions
   */
  async generateSchemaEnhancements(recipe: Recipe): Promise<any> {
    const prompt = `${this.basePrompts.metadata}

Current Recipe Schema Data:
${JSON.stringify({
      name: recipe.title,
      description: recipe.description,
      category: recipe.category,
      cuisine: recipe.cuisine,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
    }, null, 2)}

Generate enhanced schema markup that includes:

1. Nutrition Information (estimate based on ingredients):
   - calories, protein, carbs, fat, fiber, sugar, sodium
   - Use realistic estimates for recipe type

2. Equipment/Tools needed:
   - Extract from instructions
   - Format as HowToTool schema

3. Recipe Tips:
   - Storage instructions
   - Substitution suggestions
   - Common mistakes to avoid

4. Enhanced Recipe Instructions:
   - Add time estimates for each step
   - Include temperature information
   - Add technique descriptions

5. Recipe Video (placeholder structure)

Return complete enhanced Recipe schema as JSON following schema.org Recipe specification.
Include realistic nutrition estimates and comprehensive metadata.`;

    try {
      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating schema enhancements:', error);
      return this.getFallbackSchema(recipe);
    }
  }

  /**
   * Analyze content for SEO improvements
   */
  async analyzeContentSEO(recipe: Recipe): Promise<{
    score: number;
    issues: string[];
    suggestions: string[];
    keywords: { primary: string[]; secondary: string[]; longTail: string[] };
  }> {
    const prompt = `${this.basePrompts.contentOptimization}

Recipe Content Analysis:
- Title: ${recipe.title}
- Description: ${recipe.description}
- Instructions: ${recipe.instructions?.join(' ').substring(0, 1000)}...
- Ingredients: ${recipe.ingredients?.join(', ')}
- Category: ${recipe.category}
- Word Count: ~${(recipe.description?.length || 0) + (recipe.instructions?.join(' ').length || 0)}

Analyze this recipe content for SEO optimization:

1. Content Quality Score (0-100):
   - Keyword optimization
   - Content depth and usefulness
   - Readability
   - Structure and organization

2. SEO Issues Found:
   - Missing elements
   - Poor keyword targeting
   - Thin content areas
   - Technical problems

3. Improvement Suggestions:
   - Content additions
   - Keyword opportunities
   - Structure improvements
   - User experience enhancements

4. Keyword Strategy:
   - Primary keywords (1-3 main targets)
   - Secondary keywords (3-5 supporting)
   - Long-tail opportunities (5-8 specific phrases)

Focus on food/recipe SEO best practices and user intent.

Return as JSON:
{
  "score": 85,
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "keywords": {
    "primary": ["main keyword"],
    "secondary": ["supporting keyword"],
    "longTail": ["how to make specific dish"]
  }
}`;

    try {
      const response = await this.callAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing content SEO:', error);
      return this.getFallbackContentAnalysis();
    }
  }

  /**
   * Batch process multiple recipes for SEO enhancements
   */
  async batchProcessRecipes(
    recipes: Recipe[],
    options: {
      includeMetadata?: boolean;
      includeImages?: boolean;
      includeInternalLinks?: boolean;
      includeSchema?: boolean;
    } = {}
  ): Promise<Record<string, SEOEnhancement[]>> {
    const results: Record<string, SEOEnhancement[]> = {};

    for (const recipe of recipes) {
      results[recipe.id] = [];

      try {
        if (options.includeMetadata !== false) {
          const metadata = await this.generateMetadataSuggestions(recipe);
          results[recipe.id].push({
            id: `metadata-${recipe.id}-${Date.now()}`,
            type: 'metadata',
            status: 'pending',
            confidence: 0.85,
            suggestedContent: JSON.stringify(metadata),
            reasoning: 'AI-generated SEO-optimized metadata for improved search visibility',
            keywords: metadata.keywords,
            estimatedImpact: 'high',
            createdAt: new Date()
          });
        }

        if (options.includeSchema !== false) {
          const schema = await this.generateSchemaEnhancements(recipe);
          results[recipe.id].push({
            id: `schema-${recipe.id}-${Date.now()}`,
            type: 'schema',
            status: 'pending',
            confidence: 0.9,
            suggestedContent: JSON.stringify(schema),
            reasoning: 'Enhanced schema markup with nutrition info and detailed metadata',
            keywords: [],
            estimatedImpact: 'high',
            createdAt: new Date()
          });
        }

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error processing recipe ${recipe.id}:`, error);
      }
    }

    return results;
  }



  /**
   * Fallback methods for when AI is unavailable
   */
  private getFallbackMetadata(recipe: Recipe): MetadataSuggestion {
    const baseTitle = recipe.title;
    const title = baseTitle.length > 60 ? baseTitle.substring(0, 57) + '...' : baseTitle;
    
    return {
      title: `${title} - Easy Recipe`,
      description: `Learn how to make ${recipe.title.toLowerCase()}. ${recipe.description?.substring(0, 100) || 'Delicious and easy to follow recipe with step-by-step instructions.'}`,
      keywords: [
        recipe.title.toLowerCase(),
        `${recipe.title.toLowerCase()} recipe`,
        recipe.category?.toLowerCase() || 'recipe',
        'homemade',
        'easy'
      ],
      ogTitle: title,
      ogDescription: recipe.description?.substring(0, 150) || `Delicious ${recipe.title} recipe`,
      twitterTitle: title,
      twitterDescription: recipe.description?.substring(0, 120) || `Try this amazing ${recipe.title} recipe`
    };
  }

  private getFallbackImageSEO(imageUrl: string, recipe: Recipe, context: string): ImageSEOSuggestion {
    return {
      imageUrl,
      altText: `${recipe.title} - ${context} image`,
      caption: `Delicious ${recipe.title} ready to serve`,
      title: recipe.title,
      structuredData: {
        '@type': 'ImageObject',
        caption: `${recipe.title} recipe photo`,
        description: `Image showing ${recipe.title} in ${context} context`
      }
    };
  }

  private getFallbackInternalLinks(recipe: Recipe, availableRecipes: Recipe[]): InternalLinkSuggestion[] {
    const related = availableRecipes
      .filter(r => r.category === recipe.category && r.id !== recipe.id)
      .slice(0, 3);

    return related.map(r => ({
      anchorText: r.title.toLowerCase(),
      targetUrl: `/recipes/${r.id}`,
      targetPageTitle: r.title,
      contextBefore: 'You might also enjoy our',
      contextAfter: 'recipe for a similar delicious meal.',
      relevanceScore: 0.7,
      linkType: 'related-recipe' as const
    }));
  }

  private getFallbackSchema(recipe: Recipe): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipe.title,
      description: recipe.description,
      nutrition: {
        '@type': 'NutritionInformation',
        calories: '250 calories'
      }
    };
  }

  private getFallbackContentAnalysis(): any {
    return {
      score: 70,
      issues: ['Content could be more detailed', 'Consider adding more keywords'],
      suggestions: ['Add nutrition information', 'Include cooking tips', 'Expand instructions'],
      keywords: {
        primary: ['recipe'],
        secondary: ['cooking', 'homemade'],
        longTail: ['how to cook', 'easy recipe ideas']
      }
    };
  }
}

export default AISeOEngine;