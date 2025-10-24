import { Recipe } from '@prisma/client';
import { INTERNAL_LINKING_CONFIG } from './config';
import { extractKeywordsWithAI, convertAIKeywordsToStandard } from './ai-keyword-extractor';

export interface KeywordEntry {
  recipeId: string;
  slug: string;
  title: string;
  keywords: KeywordItem[];
}

export interface KeywordItem {
  text: string;
  priority: number;
  type: 'title' | 'category' | 'ingredient' | 'custom';
}

export interface KeywordIndex {
  [keyword: string]: {
    recipeId: string;
    slug: string;
    title: string;
    priority: number;
    type: string;
  }[];
}

/**
 * Extract keywords from a single recipe (synchronous - no AI)
 */
export function extractKeywordsFromRecipe(recipe: Recipe): KeywordEntry {
  const keywords: KeywordItem[] = [];
  
  // Title - highest priority
  if (recipe.title) {
    const fullTitle = recipe.title.trim();
    keywords.push({
      text: fullTitle,
      priority: 100,
      type: 'title'
    });
    
    // Also extract title without trailing numbers/suffixes (e.g., "Recipe 02" -> "Recipe")
    const titleWithoutSuffix = fullTitle.replace(/\s*\d+\s*$/, '').replace(/\s*-\s*\d+\s*$/, '').trim();
    if (titleWithoutSuffix && titleWithoutSuffix !== fullTitle && titleWithoutSuffix.length > 3) {
      keywords.push({
        text: titleWithoutSuffix,
        priority: 95,
        type: 'title'
      });
    }
  }
  
  // Category - high priority
  if (recipe.category) {
    keywords.push({
      text: recipe.category.trim(),
      priority: 70,
      type: 'category'
    });
  }
  
  // Extract from ingredients (if JSON)
  if (recipe.ingredients) {
    try {
      const ingredientsData = typeof recipe.ingredients === 'string' 
        ? JSON.parse(recipe.ingredients)
        : recipe.ingredients;
        
      if (Array.isArray(ingredientsData)) {
        ingredientsData.forEach((section: any) => {
          if (section.items && Array.isArray(section.items)) {
            section.items.forEach((item: string) => {
              // Extract main ingredient (first 1-3 words)
              const words = item.split(' ').slice(0, 3).join(' ');
              const cleaned = words.replace(/[0-9\/\-\(\)]/g, '').trim();
              
              if (cleaned.length > 3 && !isCommonWord(cleaned)) {
                keywords.push({
                  text: cleaned,
                  priority: 60,
                  type: 'ingredient'
                });
              }
            });
          }
        });
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  // Extract keywords from actual content text (intro, story, description, instructions)
  const contentText = extractAllContentText(recipe);
  const contentKeywords = extractKeywordsFromText(contentText);
  keywords.push(...contentKeywords);
  
  return {
    recipeId: recipe.id,
    slug: recipe.slug,
    title: recipe.title,
    keywords: deduplicateKeywords(keywords)
  };
}

/**
 * Extract all text content from recipe
 */
function extractAllContentText(recipe: Recipe): string {
  const parts: string[] = [];
  
  if (recipe.intro) parts.push(recipe.intro);
  if (recipe.story) parts.push(recipe.story);
  if (recipe.description) parts.push(recipe.description);
  
  // Extract text from instructions
  if (recipe.instructions) {
    try {
      const instructionsData = typeof recipe.instructions === 'string' 
        ? JSON.parse(recipe.instructions)
        : recipe.instructions;
      
      if (Array.isArray(instructionsData)) {
        instructionsData.forEach((step: any) => {
          const text = step.instruction || step.text || step;
          if (typeof text === 'string') {
            parts.push(text);
          }
        });
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  return parts.join(' ');
}

/**
 * Extract important keywords and phrases from text content
 */
function extractKeywordsFromText(text: string): KeywordItem[] {
  if (!text || text.length < 20) return [];
  
  const keywords: KeywordItem[] = [];
  const seen = new Set<string>();
  
  // Extract 2-4 word phrases (most meaningful)
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  // Extract 2-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    const normalized = normalizeKeyword(phrase);
    
    if (normalized.length >= 6 && 
        !isBlacklisted(normalized) && 
        !isCommonPhrase(normalized) &&
        !seen.has(normalized)) {
      keywords.push({
        text: phrase,
        priority: 55,
        type: 'custom'
      });
      seen.add(normalized);
    }
  }
  
  // Extract 3-word phrases (even more specific)
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    const normalized = normalizeKeyword(phrase);
    
    if (normalized.length >= 10 && 
        !isBlacklisted(normalized) && 
        !isCommonPhrase(normalized) &&
        !seen.has(normalized)) {
      keywords.push({
        text: phrase,
        priority: 58,
        type: 'custom'
      });
      seen.add(normalized);
    }
  }
  
  // Limit to most frequent/important keywords (top 30)
  return keywords.slice(0, 30);
}

/**
 * Check if phrase is too common to be useful
 */
function isCommonPhrase(phrase: string): boolean {
  const common = [
    'this is', 'you can', 'it is', 'will be', 'can be', 'this will',
    'make sure', 'you will', 'to make', 'in the', 'on the', 'for the',
    'with the', 'and the', 'of the', 'to the', 'at the', 'from the',
    'is a', 'are a', 'was a', 'were a', 'has a', 'have a',
    'very good', 'very easy', 'so good', 'so easy', 'really good',
    'i love', 'i like', 'you need', 'we use', 'they are'
  ];
  return common.includes(phrase.toLowerCase().trim());
}

/**
 * Extract keywords from a single recipe with AI enhancement (async)
 */
export async function extractKeywordsFromRecipeWithAI(recipe: Recipe): Promise<KeywordEntry> {
  // Get base keywords (title, category, ingredients)
  const baseEntry = extractKeywordsFromRecipe(recipe);
  
  // Try to get AI-enhanced keywords
  try {
    const aiKeywords = await extractKeywordsWithAI(recipe);
    const standardKeywords = convertAIKeywordsToStandard(aiKeywords);
    
    // Combine base + AI keywords
    const allKeywords = [...baseEntry.keywords, ...standardKeywords];
    
    return {
      ...baseEntry,
      keywords: deduplicateKeywords(allKeywords)
    };
  } catch (error) {
    // Fallback to base keywords if AI fails
    return baseEntry;
  }
}

/**
 * Build searchable keyword index from all recipes (synchronous - no AI)
 */
export function buildKeywordIndex(recipes: Recipe[]): KeywordIndex {
  const index: KeywordIndex = {};
  
  recipes.forEach(recipe => {
    const entry = extractKeywordsFromRecipe(recipe);
    
    entry.keywords.forEach(keyword => {
      const normalized = normalizeKeyword(keyword.text);
      
      // Skip blacklisted keywords
      if (isBlacklisted(normalized)) {
        return;
      }
      
      if (!index[normalized]) {
        index[normalized] = [];
      }
      
      index[normalized].push({
        recipeId: entry.recipeId,
        slug: entry.slug,
        title: entry.title,
        priority: keyword.priority,
        type: keyword.type
      });
    });
  });
  
  return index;
}

/**
 * Build searchable keyword index with AI enhancement (async)
 */
export async function buildKeywordIndexWithAI(recipes: Recipe[]): Promise<KeywordIndex> {
  const index: KeywordIndex = {};
  
  // Process in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < recipes.length; i += batchSize) {
    const batch = recipes.slice(i, i + batchSize);
    
    const entries = await Promise.all(
      batch.map(recipe => extractKeywordsFromRecipeWithAI(recipe))
    );
    
    entries.forEach(entry => {
      entry.keywords.forEach(keyword => {
        const normalized = normalizeKeyword(keyword.text);
        
        // Skip blacklisted keywords
        if (isBlacklisted(normalized)) {
          return;
        }
        
        if (!index[normalized]) {
          index[normalized] = [];
        }
        
        index[normalized].push({
          recipeId: entry.recipeId,
          slug: entry.slug,
          title: entry.title,
          priority: keyword.priority,
          type: keyword.type
        });
      });
    });
    
    // Rate limiting between batches
    if (i + batchSize < recipes.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return index;
}

/**
 * Normalize keyword for consistent matching
 */
export function normalizeKeyword(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, ' '); // Normalize spaces
}

/**
 * Check if keyword is blacklisted
 */
function isBlacklisted(keyword: string): boolean {
  const normalized = keyword.toLowerCase().trim();
  return INTERNAL_LINKING_CONFIG.blacklistedKeywords.some(
    blacklisted => normalized === blacklisted || normalized.includes(blacklisted)
  );
}

/**
 * Check if text is a common word
 */
function isCommonWord(text: string): boolean {
  const common = ['cup', 'cups', 'tablespoon', 'teaspoon', 'tsp', 'tbsp', 'oz', 'pound', 'lb', 'gram', 'kg', 'ml', 'liter'];
  const normalized = text.toLowerCase().trim();
  return common.includes(normalized);
}

/**
 * Remove duplicate keywords, keeping highest priority
 */
function deduplicateKeywords(keywords: KeywordItem[]): KeywordItem[] {
  const seen = new Map<string, KeywordItem>();
  
  keywords.forEach(keyword => {
    const normalized = normalizeKeyword(keyword.text);
    const existing = seen.get(normalized);
    
    if (!existing || keyword.priority > existing.priority) {
      seen.set(normalized, keyword);
    }
  });
  
  return Array.from(seen.values());
}
