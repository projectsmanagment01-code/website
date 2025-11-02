export interface PinterestSpyData {
  id: string;
  spyTitle?: string;
  spyDescription?: string;
  spyAuthor?: string;
  spyImageUrl?: string;
  spyArticleUrl?: string;
  spyCategory?: string;
  spyTags?: string;
  spyCookingTime?: string;
  spyPrepTime?: string;
  spyServings?: string;
  spyDifficulty?: string;
  spyIngredients?: string;
  spyInstructions?: string;
  spyNutrition?: string;
  spyNotes?: string;
  spySource?: string;
  spyKeywords?: string;
  spyStatus?: string;
  spyPinCount?: number;
  spyLikes?: number;
  spyComments?: number;
  spyShares?: number;
  spyViews?: number;
  spyEngagementRate?: number;
  spyDatePublished?: string;
  spyLastUpdated?: string;
  spyAuthorImage?: string;
  spyAuthorBio?: string;
  markForGeneration?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Stats {
  total: number;
  byStatus: Record<string, number>;
  markedForGeneration: number;
}

export interface ExtractionResult {
  imageUrl: string;
  alt: string;
  selector: string;
}

export interface ExtractionProgress {
  current: number;
  total: number;
}

export interface BulkImportField {
  field: keyof PinterestSpyData;
  label: string;
  required?: boolean;
}

export interface SEOResult {
  id: string;
  title: string;
  description: string;
  keywords: string;
  category: string;
  tags: string;
  author: string;
  cookingTime: string;
  prepTime: string;
  servings: string;
  difficulty: string;
  status: 'processing' | 'completed' | 'error';
}

export interface PromptSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  extractionPrompt: string;
}

export type TabType = 'data' | 'extract' | 'seo' | 'settings';

export interface TabConfig {
  id: TabType;
  name: string;
  icon: string;
}