export interface LinkSuggestion {
  id: string;
  sourceRecipe: {
    id: string;
    title: string;
    slug: string;
  };
  targetRecipe: {
    id: string;
    title: string;
    slug: string;
  };
  anchorText: string;
  fieldName: string;
  position: number;
  relevanceScore: number;
  sentenceContext: string;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  createdAt: Date;
  appliedAt?: Date;
}

export interface OrphanPage {
  recipeId: string;
  recipeSlug: string;
  recipeTitle: string;
  incomingLinksCount: number;
  outgoingLinksCount: number;
  isOrphan: boolean;
  lastScannedAt: Date;
}

export interface LinkingStats {
  suggestions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    applied: number;
    avgRelevanceScore: number;
  };
  orphans: {
    total: number;
    avgIncomingLinks: number;
    avgOutgoingLinks: number;
  };
  topSourceRecipes: Array<{
    recipeId: string;
    recipeTitle: string;
    recipeSlug: string;
    suggestionCount: number;
  }>;
  topTargetRecipes: Array<{
    recipeId: string;
    recipeTitle: string;
    recipeSlug: string;
    linkCount: number;
  }>;
  lastScanDate: Date | null;
}

export interface ScanResult {
  success: boolean;
  scannedRecipes: number;
  totalSuggestions: number;
  recipesWithSuggestions?: number;
  durationMs?: number;
  recipe?: {
    id: string;
    title: string;
    slug: string;
    suggestions: number;
  };
}
