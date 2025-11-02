/**
 * Pinterest Spy Data SEO Extraction Service
 * 
 * Processes raw Pinterest spy data and extracts:
 * - SEO Keyword
 * - SEO Title  
 * - SEO Description
 * 
 * Uses AI to analyze spy title, description, and article content
 */

import { getOpenAIKey, getGeminiKey, getAIProvider } from "@/lib/ai-settings-helper";

export interface SpyDataInput {
  spyTitle?: string;
  spyDescription?: string;
  spyImageUrl?: string;
  spyArticleUrl?: string;
  spyPinImage?: string;
  annotation?: string;
}

export interface SEOMetadata {
  seoKeyword: string;
  seoTitle: string;
  seoDescription: string;
  confidence: number; // 0-1 confidence score
  reasoning: string; // AI's reasoning for the choices
}

export class SEOExtractionService {
  /**
   * Extract SEO metadata from Pinterest spy data
   */
  static async extractSEOMetadata(spyData: SpyDataInput): Promise<SEOMetadata> {
    try {
      console.log('🔍 Starting SEO extraction for:', spyData.spyTitle);
      
      const aiProvider = await getAIProvider();
      console.log(`🤖 Using AI provider: ${aiProvider}`);
      
      if (aiProvider === 'gemini') {
        return await this.extractWithGemini(spyData);
      } else {
        return await this.extractWithOpenAI(spyData);
      }
    } catch (error) {
      console.error('❌ SEO extraction failed:', error);
      throw new Error(`SEO extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract SEO metadata using OpenAI
   */
  private static async extractWithOpenAI(spyData: SpyDataInput): Promise<SEOMetadata> {
    const apiKey = await getOpenAIKey();
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.buildExtractionPrompt(spyData);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cost-effective model
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO analyst specializing in food and recipe content. Extract SEO metadata from Pinterest spy data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for consistent results
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return this.parseAIResponse(content);
  }

  /**
   * Extract SEO metadata using Google Gemini
   */
  private static async extractWithGemini(spyData: SpyDataInput): Promise<SEOMetadata> {
    const apiKey = await getGeminiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = this.buildExtractionPrompt(spyData);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert SEO analyst specializing in food and recipe content. Extract SEO metadata from Pinterest spy data.\n\n${prompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No content received from Gemini');
    }

    return this.parseAIResponse(content);
  }

  /**
   * Build the AI prompt for SEO extraction
   */
  private static buildExtractionPrompt(spyData: SpyDataInput): string {
    return `
Analyze this Pinterest spy data and extract SEO metadata for recipe content generation:

**SPY DATA:**
Title: ${spyData.spyTitle}
Description: ${spyData.spyDescription}
Article URL: ${spyData.spyArticleUrl}
${spyData.annotation ? `Annotation: ${spyData.annotation}` : ''}

**TASK:**
Extract the following SEO metadata optimized for recipe content:

1. **SEO Keyword**: The primary keyword this recipe should target (2-4 words max)
2. **SEO Title**: Optimized title for search engines (50-60 characters ideal)
3. **SEO Description**: Meta description for search results (150-160 characters ideal)

**GUIDELINES:**
- Focus on food/recipe keywords with good search potential
- Ensure titles are clickable and include the main keyword
- Descriptions should be compelling and include key benefits
- Consider search intent (people looking for recipes)
- Analyze the spy data to understand the core recipe concept
- Use natural, appetizing language

**OUTPUT FORMAT:**
Return your response as valid JSON:
{
  "seoKeyword": "primary keyword phrase",
  "seoTitle": "Optimized SEO title",
  "seoDescription": "Compelling meta description",
  "confidence": 0.85,
  "reasoning": "Brief explanation of your choices"
}

**EXAMPLE:**
For spy data about "Easy Chicken Parmesan Recipe":
{
  "seoKeyword": "easy chicken parmesan",
  "seoTitle": "Easy Chicken Parmesan Recipe - Crispy & Delicious in 30 Minutes",
  "seoDescription": "Make restaurant-quality chicken parmesan at home! This easy recipe delivers crispy chicken with melted cheese in just 30 minutes. Perfect for family dinners.",
  "confidence": 0.92,
  "reasoning": "Focused on 'easy' as the main differentiator, included time benefit, and emphasized family appeal"
}

Analyze the provided spy data and return the SEO metadata in the exact JSON format shown above.
`;
  }

  /**
   * Parse AI response and extract SEO metadata
   */
  private static parseAIResponse(content: string): SEOMetadata {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.seoKeyword || !parsed.seoTitle || !parsed.seoDescription) {
        throw new Error('Missing required SEO fields in AI response');
      }

      // Ensure reasonable lengths
      if (parsed.seoTitle.length > 70) {
        console.warn('⚠️ SEO title too long, truncating...');
        parsed.seoTitle = parsed.seoTitle.substring(0, 67) + '...';
      }

      if (parsed.seoDescription.length > 170) {
        console.warn('⚠️ SEO description too long, truncating...');
        parsed.seoDescription = parsed.seoDescription.substring(0, 167) + '...';
      }

      return {
        seoKeyword: parsed.seoKeyword.trim(),
        seoTitle: parsed.seoTitle.trim(),
        seoDescription: parsed.seoDescription.trim(),
        confidence: parsed.confidence || 0.8,
        reasoning: parsed.reasoning || 'AI-generated SEO metadata',
      };
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      console.log('Raw AI response:', content);
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch process multiple spy data entries
   */
  static async batchExtractSEO(spyDataList: SpyDataInput[]): Promise<{
    success: SEOMetadata[];
    failed: { index: number; error: string; data: SpyDataInput }[];
  }> {
    const success: SEOMetadata[] = [];
    const failed: { index: number; error: string; data: SpyDataInput }[] = [];

    for (let i = 0; i < spyDataList.length; i++) {
      try {
        console.log(`🔄 Processing ${i + 1}/${spyDataList.length}: ${spyDataList[i].spyTitle}`);
        
        const result = await this.extractSEOMetadata(spyDataList[i]);
        success.push(result);
        
        // Add delay between requests to avoid rate limiting
        if (i < spyDataList.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Failed to process item ${i + 1}:`, error);
        failed.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: spyDataList[i]
        });
      }
    }

    console.log(`✅ Batch processing complete: ${success.length} success, ${failed.length} failed`);
    return { success, failed };
  }

  /**
   * Validate spy data before processing
   */
  static validateSpyData(spyData: SpyDataInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Only require title OR description (at least one)
    if ((!spyData.spyTitle || spyData.spyTitle.trim().length === 0) && 
        (!spyData.spyDescription || spyData.spyDescription.trim().length === 0)) {
      errors.push('Either spy title or spy description is required');
    }

    // URLs are optional, but if provided, they should be valid
    if (spyData.spyArticleUrl && spyData.spyArticleUrl.trim() && !this.isValidUrl(spyData.spyArticleUrl)) {
      errors.push('Spy article URL must be valid if provided');
    }

    if (spyData.spyImageUrl && spyData.spyImageUrl.trim() && !this.isValidUrl(spyData.spyImageUrl)) {
      errors.push('Spy image URL must be valid if provided');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper to validate URLs
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}