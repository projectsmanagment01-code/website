export interface ImagePrompts {
  image_1_feature: string;
  image_2_ingredients: string;
  image_3_cooking: string;
  image_4_final_presentation: string;
}

export interface GeneratedImage {
  imageNumber: number;
  filename: string;
  url: string;
  promptUsed: string;
}

export interface ImagePromptData {
  entryId: string;
  entryTitle: string;
  prompts: ImagePrompts;
  entry: any;
}

export type ImageGenerationStage = 'select' | 'prompts-generated' | 'generating-images';

export interface ProcessingStatus {
  status: 'idle' | 'generating-prompts' | 'prompts-ready' | 'generating-images' | 'uploading' | 'completed' | 'error';
  currentImage?: number;
  error?: string;
  imageUrls?: Record<string, string>;
}
