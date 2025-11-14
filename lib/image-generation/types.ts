// Types for the image generation workflow

export interface RecipeData {
  id: string;
  seoTitle: string;
  seoDescription: string;
  seoKeyword: string;
  category: string;
  spyPinImageUrl: string;
  nakedDomain: string;
  websiteToken: string;
}

export interface ImagePrompts {
  image_1_feature: string;
  image_2_ingredients: string;
  image_3_cooking: string;
  image_4_final_presentation: string;
}

export interface GeneratedImage {
  type: 'feature' | 'ingredients' | 'cooking' | 'final_presentation';
  fileName: string;
  buffer: Buffer;
  mimeType: string;
  url?: string; // Populated after upload
}

export interface CronJobConfig {
  id: string;
  userId: string;
  name: string;
  schedule: string; // Cron expression
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  batchSize: number; // How many records to process at once
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageGenerationJob {
  id: string;
  cronJobId: string;
  recipeId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  step: 'prompt_generation' | 'image_download' | 'image_preprocessing' | 'image_generation' | 'upload' | 'completed';
  progress: number; // 0-100
  error?: string;
  generatedImages: GeneratedImage[];
  startedAt: Date;
  completedAt?: Date;
}

export interface AIModelConfig {
  provider: 'gemini';
  model: string; // gemini-2.0-flash-exp, gemini-1.5-pro, etc.
  apiKey: string;
  endpoint?: string;
}

export interface ImageOptimizationSettings {
  quality: number; // 1-100
  format: 'webp' | 'jpeg' | 'png';
  maxWidth: number;
  maxHeight: number;
  watermarkText?: string;
  watermarkPosition: 'bottom-center' | 'bottom-right' | 'center';
}