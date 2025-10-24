export const INTERNAL_LINKING_CONFIG = {
  // Scan behavior
  maxSuggestionsPerRecipe: 20,
  minRelevanceScore: 50,
  
  // Link appearance
  linkColor: 'orange-600',
  linkClass: 'text-orange-600 hover:text-orange-700 underline transition-colors',
  
  // Scope - only recipe content fields
  processedFields: ['intro', 'story', 'description', 'instructions'] as const,
  
  // Orphan detection
  orphanThreshold: 3,
  
  // Blacklist - generic/low-value keywords
  blacklistedKeywords: [
    'click here',
    'this',
    'that',
    'here',
    'there',
    'these',
    'those',
    'read more',
    'see more',
    'learn more',
    'find out',
    'check out',
    'a',
    'an',
    'the',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
  ],
  
  // Performance
  batchSize: 50,
  enableCache: true,
  
  // Quality control
  maxAnchorTextWords: 5,
  minAnchorTextWords: 1,
  maxLinksPerField: 5,
} as const;

export type ProcessedField = typeof INTERNAL_LINKING_CONFIG.processedFields[number];
