/**
 * Pinterest Spy Data SEO Extraction Service
 * 
 * Processes raw Pinterest spy data and extracts:
 * - SEO Keyword
 * - SEO Title  
 * - SEO Description
 * - SEO Category (from existing website categories)
 * 
 * Uses AI to analyze spy title, description, and article content
 */

import { getOpenAIKey, getGeminiKey, getAIProvider } from "@/lib/ai-settings-helper";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  seoCategory?: string; // Category slug from website's existing categories
  confidence: number; // 0-1 confidence score
  reasoning: string; // AI's reasoning for the choices
}

export class SEOExtractionService {
  /**
   * Fetch all active categories from the database
   */
  private static async getWebsiteCategories(): Promise<string[]> {
    try {
      const categories = await prisma.category.findMany({
        where: {
          isActive: true
        },
        select: {
          slug: true,
          name: true
        },
        orderBy: {
          order: 'asc'
        }
      });

      if (categories.length === 0) {
        console.warn('⚠️ No categories found in database, using fallback');
        return ['breakfast', 'lunch', 'dinner', 'dessert', 'snacks', 'appetizers', 'salads', 'soups'];
      }

      console.log(`✅ Loaded ${categories.length} website categories:`, categories.map(c => c.slug).join(', '));
      return categories.map(c => c.slug);
    } catch (error) {
      console.error('❌ Failed to fetch categories from database:', error);
      // Fallback categories
      return ['breakfast', 'lunch', 'dinner', 'dessert', 'snacks', 'appetizers', 'salads', 'soups'];
    }
  }

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

    const prompt = await this.buildExtractionPrompt(spyData);

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
   * BATCH: Extract SEO for multiple entries with OpenAI in ONE request
   */
  private static async batchExtractWithOpenAI(
    spyDataList: SpyDataInput[], 
    startIndex: number
  ): Promise<Array<{ index: number; success: boolean; data?: SEOMetadata; error?: string }>> {
    const apiKey = await getOpenAIKey();
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const categories = await this.getWebsiteCategories();
    
    // Build batch prompt with numbered entries
    const batchPrompt = `You will analyze ${spyDataList.length} Pinterest spy entries and extract SEO metadata for each.

**AVAILABLE WEBSITE CATEGORIES:**
Choose ONE category from this list for each entry: ${categories.join(', ')}

**ENTRIES TO ANALYZE:**
${spyDataList.map((data, idx) => `
--- ENTRY #${idx + 1} ---
Title: ${data.spyTitle}
Description: ${data.spyDescription}
Article URL: ${data.spyArticleUrl}
${data.annotation ? `Annotation: ${data.annotation}` : ''}
`).join('\n')}

**TASK:**
For EACH entry above, extract:
1. seoCategory: Choose the most relevant category from the list
2. seoKeyword: Primary keyword (2-4 words)
3. seoTitle: SEO-optimized title (50-60 characters)
4. seoDescription: Meta description (150-160 characters)

**OUTPUT FORMAT:**
Return a JSON array with one object per entry, IN THE SAME ORDER:
[
  {
    "entryNumber": 1,
    "seoCategory": "category-slug",
    "seoKeyword": "keyword phrase",
    "seoTitle": "SEO title",
    "seoDescription": "Meta description",
    "confidence": 0.85
  },
  {
    "entryNumber": 2,
    ...
  }
]

CRITICAL: Return exactly ${spyDataList.length} results in the same order as the entries above.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO analyst. Analyze multiple recipe entries and return structured JSON array.'
          },
          {
            role: 'user',
            content: batchPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000, // Increased for batch
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

    return this.parseBatchResponse(content, spyDataList.length, startIndex);
  }

  /**
   * Extract SEO metadata using Google Gemini
   */
  private static async extractWithGemini(spyData: SpyDataInput): Promise<SEOMetadata> {
    const apiKey = await getGeminiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = await this.buildExtractionPrompt(spyData);

    // Use gemini-2.0-flash-exp (available model) instead of 2.5
    const model = 'gemini-2.0-flash-exp';
    console.log(`🤖 Using Gemini model: ${model}`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
      const errorText = await response.text();
      console.error('❌ Gemini API Error Response:', errorText);
      let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;
      
      try {
        const error = JSON.parse(errorText);
        errorMessage += ` - ${error.error?.message || JSON.stringify(error)}`;
      } catch {
        errorMessage += ` - ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Gemini API Response:', JSON.stringify(result, null, 2));
    
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      console.error('❌ No content in Gemini response. Full response:', JSON.stringify(result, null, 2));
      
      // Check for safety filters or other blocks
      if (result.candidates?.[0]?.finishReason) {
        throw new Error(`Gemini blocked response: ${result.candidates[0].finishReason}`);
      }
      
      throw new Error('No content received from Gemini - response structure may have changed');
    }

    return this.parseAIResponse(content);
  }

  /**
   * BATCH: Extract SEO for multiple entries with Gemini in ONE request
   */
  private static async batchExtractWithGemini(
    spyDataList: SpyDataInput[], 
    startIndex: number
  ): Promise<Array<{ index: number; success: boolean; data?: SEOMetadata; error?: string }>> {
    const apiKey = await getGeminiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const categories = await this.getWebsiteCategories();
    const model = 'gemini-2.0-flash-exp';
    
    // Build batch prompt with numbered entries
    const batchPrompt = `You will analyze ${spyDataList.length} Pinterest spy entries and extract SEO metadata for each.

**AVAILABLE WEBSITE CATEGORIES:**
Choose ONE category from this list for each entry: ${categories.join(', ')}

**ENTRIES TO ANALYZE:**
${spyDataList.map((data, idx) => `
--- ENTRY #${idx + 1} ---
Title: ${data.spyTitle}
Description: ${data.spyDescription}
Article URL: ${data.spyArticleUrl}
${data.annotation ? `Annotation: ${data.annotation}` : ''}
`).join('\n')}

**TASK:**
For EACH entry above, extract:
1. seoCategory: Choose the most relevant category from the list
2. seoKeyword: Primary keyword (2-4 words)
3. seoTitle: SEO-optimized title (50-60 characters)
4. seoDescription: Meta description (150-160 characters)

**OUTPUT FORMAT:**
Return a JSON array with one object per entry, IN THE SAME ORDER:
[
  {
    "entryNumber": 1,
    "seoCategory": "category-slug",
    "seoKeyword": "keyword phrase",
    "seoTitle": "SEO title",
    "seoDescription": "Meta description",
    "confidence": 0.85
  },
  {
    "entryNumber": 2,
    ...
  }
]

CRITICAL: Return exactly ${spyDataList.length} results in the same order as the entries above.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
                  text: `You are an expert SEO analyst. Analyze multiple recipe entries and return structured JSON array.\n\n${batchPrompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 3000, // Increased for batch
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error Response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      console.error('❌ No content in Gemini response');
      throw new Error('No content received from Gemini');
    }

    return this.parseBatchResponse(content, spyDataList.length, startIndex);
  }

  /**
   * Build the AI prompt for SEO extraction
   */
  private static async buildExtractionPrompt(spyData: SpyDataInput): Promise<string> {
    const categories = await this.getWebsiteCategories();
    
    return `
Analyze this Pinterest spy data and extract SEO metadata for recipe content generation:

**SPY DATA:**
Title: ${spyData.spyTitle}
Description: ${spyData.spyDescription}
Article URL: ${spyData.spyArticleUrl}
${spyData.annotation ? `Annotation: ${spyData.annotation}` : ''}

**AVAILABLE WEBSITE CATEGORIES:**
You MUST choose ONE category from this exact list (use the slug):
${categories.map((cat, i) => `${i + 1}. ${cat}`).join('\n')}

**TASK:**
Extract the following SEO metadata optimized for recipe content:

1. **SEO Category**: Choose the MOST RELEVANT category slug from the list above (REQUIRED)
2. **SEO Keyword**: The primary keyword this recipe should target (2-4 words max)
3. **SEO Title**: Optimized title for search engines (50-60 characters ideal)
4. **SEO Description**: Meta description for search results (150-160 characters ideal)

**GUIDELINES:**
- **Category Selection**: Carefully analyze the recipe and choose the ONE category that best fits
- Focus on food/recipe keywords with good search potential
- Ensure titles are clickable and include the main keyword
- Descriptions should be compelling and include key benefits
- Consider search intent (people looking for recipes)
- Analyze the spy data to understand the core recipe concept
- Use natural, appetizing language

**OUTPUT FORMAT:**
Return your response as valid JSON:
{
  "seoCategory": "category-slug-from-list",
  "seoKeyword": "primary keyword phrase",
  "seoTitle": "Optimized SEO title",
  "seoDescription": "Compelling meta description",
  "confidence": 0.85,
  "reasoning": "Brief explanation of your choices including why this category"
}

**EXAMPLE:**
For spy data about "Easy Chicken Parmesan Recipe" (assuming 'dinner' is in the category list):
{
  "seoCategory": "dinner",
  "seoKeyword": "easy chicken parmesan",
  "seoTitle": "Easy Chicken Parmesan Recipe - Crispy & Delicious in 30 Minutes",
  "seoDescription": "Make restaurant-quality chicken parmesan at home! This easy recipe delivers crispy chicken with melted cheese in just 30 minutes. Perfect for family dinners.",
  "confidence": 0.92,
  "reasoning": "Selected 'dinner' category as chicken parmesan is a main course. Focused on 'easy' as the main differentiator, included time benefit, and emphasized family appeal"
}

**IMPORTANT:** You MUST select a category from the provided list. Do not make up category names.

Analyze the provided spy data and return the SEO metadata in the exact JSON format shown above.
`;
  }

  /**
   * Parse batch AI response and map results to entries
   */
  private static parseBatchResponse(
    content: string, 
    expectedCount: number, 
    startIndex: number
  ): Array<{ index: number; success: boolean; data?: SEOMetadata; error?: string }> {
    try {
      // Extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      if (parsed.length !== expectedCount) {
        console.warn(`⚠️ Expected ${expectedCount} results, got ${parsed.length}`);
      }

      const results: Array<{ index: number; success: boolean; data?: SEOMetadata; error?: string }> = [];

      parsed.forEach((item, idx) => {
        try {
          // Validate required fields
          if (!item.seoKeyword || !item.seoTitle || !item.seoDescription) {
            results.push({
              index: startIndex + idx,
              success: false,
              error: 'Missing required SEO fields'
            });
            return;
          }

          // Validate category
          if (item.seoCategory) {
            console.log(`✅ Entry #${idx + 1}: Category: ${item.seoCategory}`);
          }

          // Truncate if needed
          let seoTitle = item.seoTitle.trim();
          let seoDescription = item.seoDescription.trim();

          if (seoTitle.length > 70) {
            seoTitle = seoTitle.substring(0, 67) + '...';
          }

          if (seoDescription.length > 170) {
            seoDescription = seoDescription.substring(0, 167) + '...';
          }

          results.push({
            index: startIndex + idx,
            success: true,
            data: {
              seoKeyword: item.seoKeyword.trim(),
              seoTitle,
              seoDescription,
              seoCategory: item.seoCategory ? item.seoCategory.trim() : undefined,
              confidence: item.confidence || 0.8,
              reasoning: item.reasoning || `Batch processed entry #${idx + 1}`,
            }
          });
        } catch (error) {
          console.error(`❌ Failed to parse entry #${idx + 1}:`, error);
          results.push({
            index: startIndex + idx,
            success: false,
            error: error instanceof Error ? error.message : 'Parse error'
          });
        }
      });

      return results;
    } catch (error) {
      console.error('❌ Failed to parse batch AI response:', error);
      console.log('Raw AI response:', content);
      
      // Return all as failed
      return Array.from({ length: expectedCount }, (_, idx) => ({
        index: startIndex + idx,
        success: false,
        error: `Batch parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    }
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

      // Validate category if provided
      if (parsed.seoCategory) {
        console.log(`✅ AI selected category: ${parsed.seoCategory}`);
      } else {
        console.warn('⚠️ No category selected by AI');
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
        seoCategory: parsed.seoCategory ? parsed.seoCategory.trim() : undefined,
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
   * Extract SEO metadata for multiple entries in ONE API call (TRUE BATCH)
   * Sends 10-20 entries at once to reduce API calls
   */
  static async batchExtractSEO(
    spyDataList: SpyDataInput[], 
    batchSize: number = 10
  ): Promise<Array<{ index: number; success: boolean; data?: SEOMetadata; error?: string }>> {
    console.log(`🚀 Starting TRUE BATCH SEO extraction for ${spyDataList.length} entries (batches of ${batchSize})`);
    
    const results: Array<{ index: number; success: boolean; data?: SEOMetadata; error?: string }> = [];
    
    // Split into batches
    for (let i = 0; i < spyDataList.length; i += batchSize) {
      const batch = spyDataList.slice(i, Math.min(i + batchSize, spyDataList.length));
      const batchStartIndex = i;
      
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}: ${batch.length} entries in ONE request`);
      
      try {
        const aiProvider = await getAIProvider();
        const batchResults = aiProvider === 'gemini' 
          ? await this.batchExtractWithGemini(batch, batchStartIndex)
          : await this.batchExtractWithOpenAI(batch, batchStartIndex);
        
        results.push(...batchResults);
        
        console.log(`✅ Batch complete: ${batchResults.filter(r => r.success).length}/${batch.length} successful`);
        
        // Delay between batches to avoid rate limiting
        if (i + batchSize < spyDataList.length) {
          console.log('⏳ Waiting 2 seconds before next batch...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Batch failed:`, error);
        // Mark all entries in this batch as failed
        batch.forEach((_, idx) => {
          results.push({
            index: batchStartIndex + idx,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown batch error'
          });
        });
      }
    }
    
    return results;
  }

  /**
   * OLD METHOD: Process entries one by one (kept for backward compatibility)
   */
  static async batchExtractSEOLegacy(spyDataList: SpyDataInput[]): Promise<{
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