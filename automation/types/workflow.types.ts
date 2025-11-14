/**
 * Type definitions for automation workflow
 */

export interface WorkflowContext {
  // Core identifiers
  automationId: string;
  recipeRowNumber: number;
  recipeId?: string;
  startTime: number;
  
  // Progress tracking
  currentStep: number;
  totalSteps: number;
  
  // Configuration
  config: AutomationConfig;
  
  // Step data (added progressively during workflow)
  recipe?: any; // From step 1 - SPY data
  seoData?: {
    seoKeyword: string;
    seoTitle: string;
    seoDescription: string;
  }; // From step 2 - Generated SEO data
  imagePrompts?: any; // From step 3
  referenceImage?: string; // From step 4
  generatedImages?: any; // From step 5
  uploadedImages?: {
    featureImage: string;
    ingredientsImage: string;
    cookingImage: string;
    finalDishImage: string;
  }; // From step 6
  article?: any; // From step 8
  publishedRecipe?: {
    recipeId: string;
    slug: string;
    fullUrl: string;
  }; // From step 9
  
  // Legacy compatibility
  recipeData?: RecipeData;
  imageSet?: ImageSetData;
  error?: string;
}

export interface AutomationConfig {
  googleSheetId: string;
  websiteApiToken: string;
  aiGenerator: string;
  nakedDomain: string;
  geminiApiKey: string;
  makeWebhookUrl?: string;
}

export interface RecipeData {
  id: string;
  title: string;
  description?: string;
  keyword?: string;
  category: string;
  categoryId?: string;
  authorId?: string;
  spyImageUrl?: string;
  rowNumber: number;
  sheetUrl: string;
}

export interface ImageSetData {
  imageFeature?: string;
  imageIngredients?: string;
  imageCooking?: string;
  imageFinal?: string;
  pinterestImage?: string;
  pinterestTitle?: string;
  pinterestDesc?: string;
  pinterestCategory?: string;
  prompts?: ImagePrompts;
  referenceImage?: string;
}

export interface ImagePrompts {
  image_1_feature: string;
  image_2_ingredients: string;
  image_3_cooking: string;
  image_4_final_presentation: string;
}

export interface WorkflowStep {
  name: string;
  step: number;
  execute: (context: WorkflowContext) => Promise<WorkflowContext>;
}

export interface WorkflowResult {
  success: boolean;
  recipeId: string;
  postLink?: string;
  error?: string;
  duration: number;
}

// Job data types
export interface AutomationJobData {
  manual?: boolean;
  recipeId?: string;
}

export interface AutomationJobResult extends WorkflowResult {}
