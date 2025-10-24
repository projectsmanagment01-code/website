import { KeywordIndex, normalizeKeyword } from './keyword-extractor';
import { INTERNAL_LINKING_CONFIG, ProcessedField } from './config';

export interface LinkOpportunity {
  sourceRecipeId: string;
  targetRecipeId: string;
  targetSlug: string;
  targetTitle: string;
  anchorText: string;
  fieldName: ProcessedField;
  position: number;
  sentenceContext: string;
  relevanceScore: number;
  keywordType: string;
}

/**
 * Find all link opportunities in content
 */
export function findLinkOpportunities(
  content: string,
  keywordIndex: KeywordIndex,
  sourceRecipeId: string,
  fieldName: ProcessedField
): LinkOpportunity[] {
  if (!content || content.length === 0) {
    return [];
  }
  
  const opportunities: LinkOpportunity[] = [];
  const usedKeywords = new Set<string>(); // Prevent duplicate links to same keyword
  
  // Search for each keyword in the index
  Object.keys(keywordIndex).forEach(keyword => {
    const entries = keywordIndex[keyword];
    
    // Skip if already used
    if (usedKeywords.has(keyword)) {
      return;
    }
    
    // Create case-insensitive regex with word boundaries
    const escapedKeyword = escapeRegex(keyword);
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
    const matches = [...content.matchAll(regex)];
    
    if (matches.length > 0) {
      // Take first match only
      const match = matches[0];
      const position = match.index!;
      
      // Get sentence context
      const sentenceContext = extractSentence(content, position);
      
      // Find best target recipe (highest priority, not self)
      const validEntries = entries.filter(e => e.recipeId !== sourceRecipeId);
      
      if (validEntries.length > 0) {
        // Sort by priority and take highest
        const bestEntry = validEntries.sort((a, b) => b.priority - a.priority)[0];
        
        const relevanceScore = calculateRelevanceScore(
          match[0],
          sentenceContext,
          bestEntry.priority,
          bestEntry.type
        );
        
        if (relevanceScore >= INTERNAL_LINKING_CONFIG.minRelevanceScore) {
          opportunities.push({
            sourceRecipeId,
            targetRecipeId: bestEntry.recipeId,
            targetSlug: bestEntry.slug,
            targetTitle: bestEntry.title,
            anchorText: match[0], // Use actual matched text (preserves case)
            fieldName,
            position,
            sentenceContext,
            relevanceScore,
            keywordType: bestEntry.type
          });
          
          usedKeywords.add(keyword);
        }
      }
    }
  });
  
  // Sort by relevance score (descending) and apply limits
  return filterAndLimitOpportunities(opportunities);
}

/**
 * Calculate relevance score based on multiple factors
 */
function calculateRelevanceScore(
  anchorText: string,
  context: string,
  basePriority: number,
  keywordType: string
): number {
  let score = basePriority;
  
  // Adjust based on anchor text length (prefer 2-4 words)
  const wordCount = anchorText.split(' ').length;
  if (wordCount >= INTERNAL_LINKING_CONFIG.minAnchorTextWords && 
      wordCount <= INTERNAL_LINKING_CONFIG.maxAnchorTextWords) {
    score += 5;
  } else if (wordCount > INTERNAL_LINKING_CONFIG.maxAnchorTextWords) {
    score -= 10;
  }
  
  // Boost if in beginning of content
  if (context.indexOf(anchorText) < 200) {
    score += 5;
  }
  
  // Boost title matches
  if (keywordType === 'title') {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Extract sentence containing the keyword
 */
function extractSentence(content: string, position: number): string {
  const beforeContext = 100;
  const afterContext = 100;
  
  const start = Math.max(0, position - beforeContext);
  const end = Math.min(content.length, position + afterContext);
  
  let sentence = content.substring(start, end);
  
  // Add ellipsis if truncated
  if (start > 0) sentence = '...' + sentence;
  if (end < content.length) sentence = sentence + '...';
  
  return sentence.trim();
}

/**
 * Filter low-quality suggestions and apply limits
 */
function filterAndLimitOpportunities(opportunities: LinkOpportunity[]): LinkOpportunity[] {
  return opportunities
    .filter(opp => {
      // Filter by word count
      const wordCount = opp.anchorText.split(' ').length;
      return wordCount >= INTERNAL_LINKING_CONFIG.minAnchorTextWords &&
             wordCount <= INTERNAL_LINKING_CONFIG.maxAnchorTextWords;
    })
    .filter(opp => {
      // Filter by relevance score
      return opp.relevanceScore >= INTERNAL_LINKING_CONFIG.minRelevanceScore;
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, INTERNAL_LINKING_CONFIG.maxLinksPerField);
}

/**
 * Escape special regex characters
 */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract text content from instructions JSON
 */
export function extractTextFromInstructions(instructions: any): string {
  if (!instructions) return '';
  
  try {
    const data = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
    
    if (Array.isArray(data)) {
      return data
        .map((step: any) => step.instruction || step.text || '')
        .join(' ')
        .trim();
    }
  } catch (e) {
    // Return as-is if not JSON
    return String(instructions);
  }
  
  return '';
}
