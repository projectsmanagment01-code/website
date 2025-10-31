/**
 * Main Workflow Orchestrator
 * Executes all 11 steps of the recipe automation workflow
 */

import { WorkflowContext } from '../types/workflow.types';
import { logger } from '../utils/logger';

// Import workflow steps
import { fetchRecipeStep } from './steps/01-fetch-recipe';
import { generatePromptsStep } from './steps/02-generate-prompts';
import { downloadReferenceImageStep } from './steps/03-download-reference';
import { generateImagesStep } from './steps/04-generate-images';
import { uploadImagesStep } from './steps/05-upload-images';
import { updateSheetImagesStep } from './steps/06-update-sheet-images';
import { generateArticleStep } from './steps/07-generate-article';
import { publishRecipeStep } from './steps/08-publish-recipe';
import { updateSheetPostDataStep } from './steps/09-update-sheet-post';
import { sendToPinterestStep } from './steps/10-send-pinterest';
import { requestIndexingStep } from './steps/11-request-indexing';

export interface WorkflowResult {
  success: boolean;
  recipeId?: string;
  recipeUrl?: string;
  error?: string;
}

export type ProgressCallback = (currentStep: number, totalSteps: number) => Promise<void>;

/**
 * Execute the complete automation workflow
 */
export async function executeWorkflow(
  context: WorkflowContext,
  onProgress?: ProgressCallback
): Promise<WorkflowResult> {
  logger.info('Starting automation workflow', {
    automationId: context.automationId,
    recipeRowNumber: context.recipeRowNumber,
  });

  const steps = [
    { name: 'Fetch Recipe', execute: fetchRecipeStep },
    { name: 'Generate Image Prompts', execute: generatePromptsStep },
    { name: 'Download Reference Image', execute: downloadReferenceImageStep },
    { name: 'Generate AI Images', execute: generateImagesStep },
    { name: 'Upload Images to Website', execute: uploadImagesStep },
    { name: 'Update Sheet with Image URLs', execute: updateSheetImagesStep },
    { name: 'Generate Recipe Article', execute: generateArticleStep },
    { name: 'Publish Recipe to Website', execute: publishRecipeStep },
    { name: 'Update Sheet with Post Data', execute: updateSheetPostDataStep },
    { name: 'Send to Pinterest', execute: sendToPinterestStep },
    { name: 'Request Google Indexing', execute: requestIndexingStep },
  ];

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      context.currentStep = i + 1;

      logger.info(`Executing step ${context.currentStep}/${context.totalSteps}: ${step.name}`, {
        automationId: context.automationId,
      });

      // Execute step
      await step.execute(context);

      // Call progress callback if provided
      if (onProgress) {
        await onProgress(context.currentStep, context.totalSteps);
      }

      logger.info(`Step ${context.currentStep} completed: ${step.name}`, {
        automationId: context.automationId,
      });
    }

    logger.info('Workflow completed successfully', {
      automationId: context.automationId,
      recipeId: context.publishedRecipe?.recipeId,
      recipeUrl: context.publishedRecipe?.fullUrl,
    });

    return {
      success: true,
      recipeId: context.publishedRecipe?.recipeId,
      recipeUrl: context.publishedRecipe?.fullUrl,
    };
  } catch (error) {
    logger.error('Workflow failed', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
