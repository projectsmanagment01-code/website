/**
 * Recipe Automation System - Main Entry Point
 * 
 * This is the public API for the automation system.
 * Import and use these functions from admin dashboard and API routes.
 * 
 * NOTE: Old queue/workflow system removed. Use RecipePipelineOrchestrator instead.
 */

// Old exports removed - queue and workflow systems deleted
// Use RecipePipelineOrchestrator from './pipeline/recipe-pipeline' instead

export {
  // Types
  type WorkflowContext,
  type AutomationConfig,
  type RecipeData,
  type ImageSetData,
  type WorkflowStep,
} from './types/workflow.types';

export {
  type ImageGenerationRequest,
  type ImageGenerationResult,
  type ImageUploadRequest,
  type ImageUploadResult,
  type ImageDownloadRequest,
  type ImageDownloadResult,
} from './types/image.types';

export {
  type RecipeArticleData,
  type RecipePublishResult,
} from './types/recipe.types';

export {
  // Services (for direct use if needed)
  GeminiFlashService,
  GeminiProService,
} from './services/ai';

export {
  GoogleSheetsService,
  GoogleIndexingService,
} from './services/google';

export {
  ImageGeneratorService,
  ImageDownloaderService,
  ImageUploaderService,
} from './services/image';

export {
  RecipeArticleService,
  RecipePublisherService,
} from './services/recipe';

export {
  PinterestService,
} from './services/external';

// Note: logger is not exported to prevent client-side bundle issues
// Import directly from './utils/logger' in server-side code only

export {
  retryWithBackoff,
  withTimeout,
  isRetryableError,
  sleep,
} from './utils/retry';

export {
  ConfigError,
  SheetError,
  ImageError,
  AIError,
  PublishError,
  ValidationError,
} from './utils/errors';

export {
  validateRecipeData,
  validateImagePrompts,
  validateRecipeArticle,
  validateConfig,
} from './utils/validators';

// Re-export constants
export { AUTOMATION_CONSTANTS } from './config/constants';
export { automationEnv } from './config/env';

// Export new pipeline system
export { RecipePipelineOrchestrator } from './pipeline/recipe-pipeline';
export { CategoryMatcher } from './recipe-generation/category-matcher';

/**
 * @deprecated Old automation system removed. Use RecipePipelineOrchestrator instead.
 */
export async function initializeAutomation(): Promise<void> {
  console.warn('⚠️ initializeAutomation() is deprecated. Old automation system removed.');
}

/**
 * @deprecated Use RecipePipelineOrchestrator.executePipeline() instead
 */
export async function startAutomation(): Promise<string> {
  throw new Error('startAutomation() is deprecated. Use RecipePipelineOrchestrator.executePipeline() or call /api/admin/automation/pipeline/run');
}

/**
 * @deprecated Old automation system removed
 */
export async function getAutomationStatus(automationId: string): Promise<any> {
  throw new Error('getAutomationStatus() is deprecated. Old automation system removed.');
}

/**
 * @deprecated Old automation system removed
 */
export async function getAutomationLogs(automationId: string, level?: string): Promise<any[]> {
  throw new Error('getAutomationLogs() is deprecated. Old automation system removed.');
}

/**
 * @deprecated Old automation system removed
 */
export async function getAutomationStats(): Promise<any> {
  throw new Error('getAutomationStats() is deprecated. Old automation system removed.');
}
