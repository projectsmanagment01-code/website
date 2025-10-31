/**
 * Main Workflow Orchestrator
 * Executes all 11 steps of the recipe automation workflow
 */

import { WorkflowContext } from '../types/workflow.types';
import { logger } from '../utils/logger';
import { executeStep } from '../utils/step-logger';

// Import workflow steps
import { fetchRecipeStep } from './steps/01-fetch-recipe';
import { generateSeoDataStep } from './steps/02-generate-seo';
import { generatePromptsStep } from './steps/03-generate-prompts';
import { downloadReferenceImageStep } from './steps/04-download-reference';
import { generateImagesStep } from './steps/05-generate-images';
import { uploadImagesStep } from './steps/06-upload-images';
import { updateSheetImagesStep } from './steps/07-update-sheet-images';
import { generateArticleStep } from './steps/08-generate-article';
import { publishRecipeStep } from './steps/09-publish-recipe';
import { updateSheetPostDataStep } from './steps/10-update-sheet-post';
import { sendToPinterestStep } from './steps/11-send-pinterest';
import { requestIndexingStep } from './steps/12-request-indexing';

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
    { name: 'Fetch Recipe SPY Data', execute: fetchRecipeStep },
    { name: 'Generate SEO Data', execute: generateSeoDataStep },
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

      // Execute step with logging
      await executeStep(
        context.automationId,
        context.currentStep,
        step.name,
        {
          sheetId: context.config.sheetId,
          model: context.config.geminiFlashModel,
          enablePinterest: context.config.enablePinterest,
          enableIndexing: context.config.enableIndexing,
        },
        {
          recipeRowNumber: context.recipeRowNumber,
          recipeTitle: context.recipe?.title,
          currentStep: context.currentStep,
        },
        async () => {
          await step.execute(context);
        },
        // Extract relevant output data based on step
        () => {
          switch (context.currentStep) {
            case 1: // Fetch Recipe
              return {
                recipeTitle: context.recipe?.title,
                category: context.recipe?.category,
                author: context.recipe?.authorName,
                ingredientsCount: context.recipe?.ingredients?.length,
                instructionsCount: context.recipe?.instructions?.length,
              };
            case 2: // Generate SEO
              return {
                seoTitle: context.seoData?.seoTitle,
                seoDescription: context.seoData?.seoDescription,
                seoKeyword: context.seoData?.seoKeyword,
              };
            case 3: // Generate Prompts
              return {
                promptsGenerated: context.imagePrompts ? Object.keys(context.imagePrompts).length : 0,
                hasFeaturePrompt: !!context.imagePrompts?.image_1_feature,
                hasIngredientsPrompt: !!context.imagePrompts?.image_2_ingredients,
              };
            case 4: // Download Reference
              return {
                referenceImagePath: context.referenceImage,
                imageUrl: context.recipe?.imageUrl,
              };
            case 5: // Generate Images
              return {
                imagesGenerated: context.generatedImages ? Object.keys(context.generatedImages).length : 0,
                hasFeatureImage: !!context.generatedImages?.featureImage,
                hasIngredientsImage: !!context.generatedImages?.ingredientsImage,
                hasCookingImage: !!context.generatedImages?.cookingImage,
                hasFinalDishImage: !!context.generatedImages?.finalDishImage,
              };
            case 6: // Upload Images
              return {
                featureImageUrl: context.uploadedImages?.featureImage,
                ingredientsImageUrl: context.uploadedImages?.ingredientsImage,
                cookingImageUrl: context.uploadedImages?.cookingImage,
                finalDishImageUrl: context.uploadedImages?.finalDishImage,
              };
            case 7: // Update Sheet Images
              return {
                sheetUpdated: true,
                imagesUpdated: context.uploadedImages ? Object.keys(context.uploadedImages).length : 0,
              };
            case 8: // Generate Article
              return {
                articleLength: context.article?.content?.length || 0,
                hasArticle: !!context.article,
              };
            case 9: // Publish Recipe
              return {
                recipeId: context.publishedRecipe?.recipeId,
                slug: context.publishedRecipe?.slug,
                fullUrl: context.publishedRecipe?.fullUrl,
                published: !!context.publishedRecipe,
              };
            case 10: // Update Sheet Post
              return {
                postLinkUpdated: true,
                recipeId: context.publishedRecipe?.recipeId,
              };
            case 11: // Pinterest
              return {
                sentToPinterest: true,
                recipeUrl: context.publishedRecipe?.fullUrl,
              };
            case 12: // Indexing
              return {
                indexingRequested: true,
                recipeUrl: context.publishedRecipe?.fullUrl,
              };
            default:
              return { stepCompleted: true };
          }
        }
      );

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
