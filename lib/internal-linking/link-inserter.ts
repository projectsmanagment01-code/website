import { LinkOpportunity } from './link-matcher';
import { INTERNAL_LINKING_CONFIG, ProcessedField } from './config';

export interface InsertionResult {
  fieldName: ProcessedField;
  updatedContent: string;
  appliedLinks: Array<{
    targetRecipeId: string;
    targetSlug: string;
    anchorText: string;
    position: number;
  }>;
}

/**
 * Insert links into content based on approved suggestions
 */
export function insertLinksInContent(
  content: string,
  opportunities: LinkOpportunity[],
  fieldName: ProcessedField
): InsertionResult {
  if (!content || opportunities.length === 0) {
    return {
      fieldName,
      updatedContent: content,
      appliedLinks: []
    };
  }
  
  // Sort by relevance score (descending) - apply highest quality links first
  const sortedOpportunities = [...opportunities].sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  let updatedContent = content;
  const appliedLinks: InsertionResult['appliedLinks'] = [];
  const usedAnchors = new Set<string>(); // Track which anchor texts we've already used
  
  for (const opp of sortedOpportunities) {
    // Skip if we've already used this exact anchor text
    const anchorKey = opp.anchorText.toLowerCase();
    if (usedAnchors.has(anchorKey)) {
      continue;
    }
    
    // Find existing links in CURRENT content (recalculate each time)
    const existingLinks = findExistingLinks(updatedContent);
    
    // Search for the anchor text in the current content (case-insensitive)
    const lowerContent = updatedContent.toLowerCase();
    let actualPosition = lowerContent.indexOf(anchorKey);
    
    if (actualPosition === -1) {
      // Text not found
      continue;
    }
    
    // Check if this position is inside an existing link
    if (isInsideExistingLink(actualPosition, existingLinks)) {
      continue;
    }
    
    // Get the actual text with original casing
    const currentText = updatedContent.substring(actualPosition, actualPosition + opp.anchorText.length);
    
    // Build the link HTML
    const link = buildLinkHTML(opp.targetSlug, currentText);
    
    // Replace the text with the link
    updatedContent = 
      updatedContent.substring(0, actualPosition) +
      link +
      updatedContent.substring(actualPosition + opp.anchorText.length);
    
    // Mark this anchor text as used
    usedAnchors.add(anchorKey);
    
    appliedLinks.push({
      targetRecipeId: opp.targetRecipeId,
      targetSlug: opp.targetSlug,
      anchorText: currentText,
      position: actualPosition
    });
  }
  
  return {
    fieldName,
    updatedContent,
    appliedLinks
  };
}

/**
 * Build link HTML with styling
 */
function buildLinkHTML(targetSlug: string, anchorText: string): string {
  const linkClass = INTERNAL_LINKING_CONFIG.linkClass;
  
  return `<a href="/recipes/${targetSlug}" class="${linkClass}">${anchorText}</a>`;
}

/**
 * Find all existing links in content
 */
function findExistingLinks(content: string): Array<{ start: number; end: number }> {
  const links: Array<{ start: number; end: number }> = [];
  const regex = /<a\s[^>]*>.*?<\/a>/gi;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    links.push({
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  return links;
}

/**
 * Check if position is inside an existing link
 */
function isInsideExistingLink(position: number, existingLinks: Array<{ start: number; end: number }>): boolean {
  return existingLinks.some(link => position >= link.start && position < link.end);
}

/**
 * Remove internal links from content
 */
export function removeInternalLinks(
  content: string,
  targetRecipeId: string
): string {
  if (!content) return content;
  
  // Find all links pointing to the target recipe
  const regex = /<a\s+[^>]*href="\/recipes\/([^"]+)"[^>]*>(.*?)<\/a>/gi;
  let updatedContent = content;
  
  // We need to track all matches first, then replace from end to start
  const matches: Array<{ fullMatch: string; anchorText: string; index: number }> = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    matches.push({
      fullMatch: match[0],
      anchorText: match[2],
      index: match.index
    });
  }
  
  // Replace from end to start to preserve positions
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    updatedContent = 
      updatedContent.substring(0, m.index) +
      m.anchorText +
      updatedContent.substring(m.index + m.fullMatch.length);
  }
  
  return updatedContent;
}

/**
 * Batch insert links for multiple fields
 */
export function batchInsertLinks(
  recipeContent: Record<ProcessedField, string>,
  opportunitiesByField: Record<ProcessedField, LinkOpportunity[]>
): Record<ProcessedField, InsertionResult> {
  const results: Record<ProcessedField, InsertionResult> = {} as any;
  
  INTERNAL_LINKING_CONFIG.processedFields.forEach(field => {
    const content = recipeContent[field] || '';
    const opportunities = opportunitiesByField[field] || [];
    
    results[field] = insertLinksInContent(content, opportunities, field);
  });
  
  return results;
}

/**
 * Validate link insertion (check for broken HTML)
 */
export function validateLinkInsertion(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check for unclosed <a> tags
  const openTags = (content.match(/<a\s[^>]*>/gi) || []).length;
  const closeTags = (content.match(/<\/a>/gi) || []).length;
  
  if (openTags !== closeTags) {
    errors.push(`Mismatched <a> tags: ${openTags} opening, ${closeTags} closing`);
  }
  
  // Check for nested <a> tags
  if (/<a\s[^>]*>.*?<a\s[^>]*>/i.test(content)) {
    errors.push('Nested <a> tags detected');
  }
  
  // Check for empty href
  if (/<a\s[^>]*href=""[^>]*>/i.test(content)) {
    errors.push('Empty href attribute found');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
