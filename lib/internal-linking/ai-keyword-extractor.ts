import { Recipe } from '@prisma/client';

/**
 * AI-powered keyword extraction using LLM
 * Extracts semantically relevant keywords and phrases from recipe content
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MODEL_ENDPOINT = 'https://models.inference.ai.azure.com';
const MODEL_NAME = 'gpt-4o-mini'; // Fast and cost-effective

export interface AIKeyword {
  text: string;
  relevance: number; // 0-100
  category: 'topic' | 'technique' | 'ingredient' | 'cuisine' | 'occasion' | 'dietary';
}

/**
 * Extract keywords from recipe using AI
 */
export async function extractKeywordsWithAI(recipe: Recipe): Promise<AIKeyword[]> {
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not set, skipping AI keyword extraction');
    return [];
  }

  try {
    const prompt = buildPrompt(recipe);
    const response = await callAI(prompt);
    return parseAIResponse(response);
  } catch (error) {
    console.error('AI keyword extraction error:', error);
    return [];
  }
}

/**
 * Batch extract keywords for multiple recipes
 */
export async function batchExtractKeywordsWithAI(
  recipes: Recipe[],
  batchSize: number = 5
): Promise<Map<string, AIKeyword[]>> {
  const results = new Map<string, AIKeyword[]>();
  
  for (let i = 0; i < recipes.length; i += batchSize) {
    const batch = recipes.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (recipe) => {
        const keywords = await extractKeywordsWithAI(recipe);
        results.set(recipe.id, keywords);
      })
    );
    
    // Rate limiting - wait 1 second between batches
    if (i + batchSize < recipes.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Build prompt for AI keyword extraction
 */
function buildPrompt(recipe: Recipe): string {
  const content = [
    `Title: ${recipe.title}`,
    `Category: ${recipe.category}`,
    recipe.intro ? `Intro: ${recipe.intro.slice(0, 300)}` : '',
    recipe.description ? `Description: ${recipe.description.slice(0, 300)}` : '',
    recipe.story ? `Story: ${recipe.story.slice(0, 400)}` : '',
  ].filter(Boolean).join('\n\n');

  return `You are a recipe SEO expert. Extract 8-12 relevant keywords and phrases from this recipe that would be useful for internal linking. Focus on:
- Cooking techniques (e.g., "pan-seared", "slow-cooked", "air-fried")
- Cuisine types (e.g., "Italian", "Asian-inspired", "Mediterranean")
- Key ingredients (main proteins, vegetables, spices)
- Meal occasions (e.g., "weeknight dinner", "holiday dessert", "meal prep")
- Dietary attributes (e.g., "gluten-free", "low-carb", "vegetarian")
- Flavor profiles (e.g., "spicy", "sweet and savory", "umami-rich")

Return ONLY a JSON array with this format:
[
  {"text": "keyword or phrase", "relevance": 85, "category": "technique"},
  {"text": "another keyword", "relevance": 90, "category": "cuisine"}
]

Recipe content:
${content}

Return only the JSON array, no other text.`;
}

/**
 * Call AI model
 */
async function callAI(prompt: string): Promise<string> {
  const response = await fetch(`${MODEL_ENDPOINT}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Parse AI response to extract keywords
 */
function parseAIResponse(response: string): AIKeyword[] {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const keywords = JSON.parse(cleaned);
    
    if (!Array.isArray(keywords)) {
      console.error('AI response is not an array');
      return [];
    }
    
    // Validate and normalize
    return keywords
      .filter((k: any) => k.text && typeof k.relevance === 'number')
      .map((k: any) => ({
        text: k.text.trim(),
        relevance: Math.min(100, Math.max(0, k.relevance)),
        category: k.category || 'topic'
      }))
      .filter((k: AIKeyword) => k.text.length >= 3 && k.text.length <= 50);
      
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Response was:', response);
    return [];
  }
}

/**
 * Convert AI keywords to standard KeywordItem format
 */
export function convertAIKeywordsToStandard(aiKeywords: AIKeyword[]): Array<{
  text: string;
  priority: number;
  type: 'custom';
}> {
  return aiKeywords.map(k => ({
    text: k.text,
    priority: Math.round(40 + (k.relevance * 0.2)), // Scale 0-100 to 40-60 priority range
    type: 'custom' as const
  }));
}
