/**
 * Internal Linking System - Core Utilities
 * 
 * This module provides all the utilities needed for the automatic internal linking system:
 * - Keyword extraction and indexing from recipes
 * - Link opportunity matching in recipe content
 * - Link insertion with HTML preservation
 * - Orphan page detection and tracking
 */

// Configuration
export { INTERNAL_LINKING_CONFIG, type ProcessedField } from './config';

// Keyword extraction
export {
  extractKeywordsFromRecipe,
  extractKeywordsFromRecipeWithAI,
  buildKeywordIndex,
  buildKeywordIndexWithAI,
  normalizeKeyword,
  type KeywordEntry,
  type KeywordItem,
  type KeywordIndex,
} from './keyword-extractor';

// Link matching
export {
  findLinkOpportunities,
  extractTextFromInstructions as extractTextFromInstructions_Matcher,
  type LinkOpportunity,
} from './link-matcher';

// Link insertion
export {
  insertLinksInContent,
  removeInternalLinks,
  batchInsertLinks,
  validateLinkInsertion,
  type InsertionResult,
} from './link-inserter';

// Orphan detection
export {
  findOrphanPages,
  updateOrphanPagesInDB,
  getPrioritizedOrphans,
  type OrphanPageData,
} from './orphan-detector';
