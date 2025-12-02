/**
 * AI Generation Service for Site Settings
 * Handles all AI-powered content generation for website settings
 */

import { buildSiteTitlePrompt } from './prompts/site-title';
import { buildSiteDescriptionPrompt } from './prompts/site-description';
import { buildLogoTextPrompt } from './prompts/logo-text';
import { buildLogoTaglinePrompt } from './prompts/logo-tagline';
import type { SiteContext, AIGenerationResult, AIProvider } from '../types';


/**
 * Generate SEO-optimized Site Title
 * Critical for search engine rankings and brand visibility
 */
export async function generateSiteTitle(
  context: SiteContext,
  apiKey: string,
  provider: AIProvider
): Promise<AIGenerationResult> {
  const prompt = buildSiteTitlePrompt(context);
  
  try {
    const content = provider === 'openai' 
      ? await generateWithOpenAI(prompt, apiKey, 100)
      : provider === 'ollama'
      ? await generateWithOllama(prompt, apiKey, 100)
      : await generateWithGemini(prompt, apiKey, 100);
      
    return {
      success: true,
      content: content.trim()
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Generation failed'
    };
  }
}

/**
 * Generate SEO-optimized Site Description
 * Critical for search engine snippets and click-through rates
 */
export async function generateSiteDescription(
  context: SiteContext,
  apiKey: string,
  provider: AIProvider
): Promise<AIGenerationResult> {
  const prompt = buildSiteDescriptionPrompt(context);
  
  try {
    const content = provider === 'openai' 
      ? await generateWithOpenAI(prompt, apiKey, 200)
      : provider === 'ollama'
      ? await generateWithOllama(prompt, apiKey, 200)
      : await generateWithGemini(prompt, apiKey, 200);
      
    return {
      success: true,
      content: content.trim()
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Generation failed'
    };
  }
}

/**
 * Generate Logo Text
 * Brand name for website identity
 */
export async function generateLogoText(
  context: SiteContext,
  apiKey: string,
  provider: AIProvider
): Promise<AIGenerationResult> {
  const prompt = buildLogoTextPrompt(context);
  
  try {
    const content = provider === 'openai' 
      ? await generateWithOpenAI(prompt, apiKey, 50)
      : provider === 'ollama'
      ? await generateWithOllama(prompt, apiKey, 50)
      : await generateWithGemini(prompt, apiKey, 50);
      
    return {
      success: true,
      content: content.trim()
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Generation failed'
    };
  }
}

/**
 * Generate Logo Tagline
 * Short descriptive tagline for branding
 */
export async function generateLogoTagline(
  context: SiteContext,
  apiKey: string,
  provider: AIProvider
): Promise<AIGenerationResult> {
  const prompt = buildLogoTaglinePrompt(context);
  
  try {
    const content = provider === 'openai' 
      ? await generateWithOpenAI(prompt, apiKey, 80)
      : provider === 'ollama'
      ? await generateWithOllama(prompt, apiKey, 80)
      : await generateWithGemini(prompt, apiKey, 80);
      
    return {
      success: true,
      content: content.trim()
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Generation failed'
    };
  }
}

// ============================================================================
// AI API FUNCTIONS - OpenAI, Google Gemini, and Ollama Cloud
// ============================================================================

async function generateWithOpenAI(prompt: string, apiKey: string, maxTokens: number = 100): Promise<string> {
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
          content: 'You are an expert SEO copywriter. Generate concise, optimized content. Return ONLY the requested content with no explanations or formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateWithGemini(prompt: string, apiKey: string, maxTokens: number = 100): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: maxTokens,
      },
      systemInstruction: {
        parts: [{
          text: 'You are an expert SEO copywriter. Generate concise, optimized content. Return ONLY the requested content with no explanations or formatting.'
        }]
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function generateWithOllama(prompt: string, apiKey: string, maxTokens: number = 100): Promise<string> {
  const response = await fetch('https://ollama.com/api/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-v3.1:671b-cloud',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO copywriter. Generate concise, optimized content. Return ONLY the requested content with no explanations or formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.message.content;
}
