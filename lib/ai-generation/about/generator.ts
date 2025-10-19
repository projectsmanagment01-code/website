import type { SiteContext, AIGenerationResult, AIProvider } from '../types';
import { buildAboutHeroTitlePrompt } from './prompts/hero-title';
import { buildAboutHeroSubtitlePrompt } from './prompts/hero-subtitle';
import { buildAboutMetaTitlePrompt } from './prompts/meta-title';
import { buildAboutMetaDescriptionPrompt } from './prompts/meta-description';
import { buildRecipesCardTitlePrompt } from './prompts/recipes-card-title';
import { buildRecipesCardItemPrompt } from './prompts/recipes-card-item';

// OpenAI
async function generateWithOpenAI(
  prompt: string,
  apiKey: string
): Promise<AIGenerationResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert copywriter and SEO specialist for food and recipe websites. Generate exactly what is requested with no additional formatting, explanations, or alternatives.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim() || '';

    return {
      success: true,
      content: content,
      provider: 'openai'
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Failed to generate with OpenAI',
      provider: 'openai'
    };
  }
}

// Google Gemini
async function generateWithGemini(
  prompt: string,
  apiKey: string
): Promise<AIGenerationResult> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert copywriter and SEO specialist for food and recipe websites. Generate exactly what is requested with no additional formatting, explanations, or alternatives.\n\n${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API request failed');
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    return {
      success: true,
      content: content,
      provider: 'gemini'
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Failed to generate with Gemini',
      provider: 'gemini'
    };
  }
}

// Helper function to select AI provider
async function generateContent(
  prompt: string,
  apiKey: string,
  provider: AIProvider = 'gemini'
): Promise<AIGenerationResult> {
  if (provider === 'openai') {
    return generateWithOpenAI(prompt, apiKey);
  } else {
    return generateWithGemini(prompt, apiKey);
  }
}

// About Page Content Generators
export async function generateAboutHeroTitle(
  context: SiteContext,
  apiKey: string,
  provider: AIProvider = 'gemini'
): Promise<AIGenerationResult> {
  const prompt = buildAboutHeroTitlePrompt(context);
  return generateContent(prompt, apiKey, provider);
}

export async function generateAboutHeroSubtitle(
  context: SiteContext,
  apiKey: string,
  provider: AIProvider = 'gemini'
): Promise<AIGenerationResult> {
  const prompt = buildAboutHeroSubtitlePrompt(context);
  return generateContent(prompt, apiKey, provider);
}

export async function generateAboutMetaTitle(
  context: SiteContext,
  apiKey: string,
  provider: AIProvider = 'gemini'
): Promise<AIGenerationResult> {
  const prompt = buildAboutMetaTitlePrompt(context);
  return generateContent(prompt, apiKey, provider);
}

export async function generateAboutMetaDescription(
  context: SiteContext,
  apiKey: string,
  provider: AIProvider = 'gemini'
): Promise<AIGenerationResult> {
  const prompt = buildAboutMetaDescriptionPrompt(context);
  return generateContent(prompt, apiKey, provider);
}

export async function generateRecipesCardTitle(
  context: SiteContext,
  apiKey: string,
  provider: AIProvider = 'gemini'
): Promise<AIGenerationResult> {
  const prompt = buildRecipesCardTitlePrompt(context);
  return generateContent(prompt, apiKey, provider);
}

export async function generateRecipesCardItem(
  context: SiteContext,
  cardTitle: string,
  apiKey: string,
  provider: AIProvider = 'gemini'
): Promise<AIGenerationResult> {
  const prompt = buildRecipesCardItemPrompt(context, cardTitle);
  return generateContent(prompt, apiKey, provider);
}
