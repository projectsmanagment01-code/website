/**
 * SEO Generation Service
 * Generates optimized SEO data from SPY data using Gemini Flash
 */

import { geminiFlash } from '../ai/gemini-flash.service';
import { logger } from '../../utils/logger';
import { AIError } from '../../utils/errors';
import { getAutomationSettings } from '@/lib/automation-settings';

export class SeoGenerationService {
  /**
   * Generate SEO keyword, title, and description from SPY data
   */
  async generateSeoData(spyData: {
    spyTitle: string;
    spyDescription: string;
    category: string;
  }): Promise<{
    seoKeyword: string;
    seoTitle: string;
    seoDescription: string;
  }> {
    logger.info('Generating SEO data from SPY data', {
      spyTitle: spyData.spyTitle,
      category: spyData.category,
    });

    try {
      const prompt = await this.buildSeoPrompt(spyData);

      // Use Gemini Flash to generate (reuse existing method infrastructure)
      const apiKey = process.env.GEMINI_API_KEY || '';
      const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
      const model = 'gemini-2.0-flash-exp';
      
      const response = await fetch(
        `${baseUrl}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              topK: 40,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new AIError(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new AIError('Failed to parse SEO data from AI response');
      }

      const seoData = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!seoData.seoKeyword || !seoData.seoTitle || !seoData.seoDescription) {
        throw new AIError('Incomplete SEO data generated');
      }

      logger.info('SEO data generated successfully', {
        keyword: seoData.seoKeyword,
        titleLength: seoData.seoTitle.length,
        descriptionLength: seoData.seoDescription.length,
      });

      return {
        seoKeyword: seoData.seoKeyword.trim(),
        seoTitle: seoData.seoTitle.trim(),
        seoDescription: seoData.seoDescription.trim(),
      };
    } catch (error) {
      logger.error('Failed to generate SEO data', error);
      throw new AIError('SEO generation failed');
    }
  }

  /**
   * Build SEO prompt - uses custom from settings or default
   */
  private async buildSeoPrompt(spyData: {
    spyTitle: string;
    spyDescription: string;
    category: string;
  }): Promise<string> {
    try {
      const settings = await getAutomationSettings();
      if (settings?.seoPromptSystemPrompt && settings.seoPromptSystemPrompt.trim()) {
        console.log('📝 Using custom SEO prompt from settings');
        // Replace placeholders in custom prompt
        return settings.seoPromptSystemPrompt
          .replace(/\{spyTitle\}/g, spyData.spyTitle)
          .replace(/\{spyDescription\}/g, spyData.spyDescription)
          .replace(/\{category\}/g, spyData.category);
      }
    } catch (error) {
      console.warn('⚠️ Could not load custom SEO prompt, using default');
    }
    
    console.log('📝 Using default SEO prompt');
    return this.getDefaultSeoPrompt(spyData);
  }

  /**
   * Default SEO prompt
   */
  private getDefaultSeoPrompt(spyData: {
    spyTitle: string;
    spyDescription: string;
    category: string;
  }): string {
    return `You are an expert SEO specialist for a recipe food blog. Generate optimized SEO data for the following recipe:

**Original Title:** ${spyData.spyTitle}
**Description:** ${spyData.spyDescription}
**Category:** ${spyData.category}

Generate:
1. **SEO Keyword** - The main target keyword (2-4 words, highly searchable)
2. **SEO Title** - Optimized title (50-60 characters, includes keyword, compelling)
3. **SEO Description** - Meta description (150-160 characters, includes keyword, action-oriented)

Requirements:
- SEO Title must be catchy, clear, and include the keyword naturally
- SEO Description must entice clicks and include a call-to-action
- Both must be optimized for Google search
- Maintain the essence of the original recipe

Output format (JSON only, no markdown):
{
  "seoKeyword": "main keyword phrase",
  "seoTitle": "Optimized Title Here",
  "seoDescription": "Compelling meta description here."
}`;
  }
}

export const seoGenerator = new SeoGenerationService();
