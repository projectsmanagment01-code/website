/**
 * Step 10: Update Google Sheet with Post Data
 * Writes SEO data, images, recipe info, and publication status
 */

import { WorkflowContext } from '../../types/workflow.types';
import { googleSheets } from '../../services/google/sheets.service';
import { logger } from '../../utils/logger';
import { ValidationError } from '../../utils/errors';

export async function updateSheetPostDataStep(context: WorkflowContext): Promise<void> {
  logger.info('Step 10: Updating Google Sheet with complete post data');

  if (!context.publishedRecipe) {
    throw new ValidationError('Published recipe data is missing from context');
  }

  if (!context.seoData) {
    throw new ValidationError('SEO data is missing from context');
  }

  if (!context.uploadedImages) {
    throw new ValidationError('Uploaded images are missing from context');
  }

  try {
    // Extract image URLs from uploadedImages object
    const image01 = context.uploadedImages.featureImage || '';
    const image02 = context.uploadedImages.ingredientsImage || '';
    const image03 = context.uploadedImages.cookingImage || '';
    const image04 = context.uploadedImages.finalDishImage || '';

    // Note: Pinterest and indexing data will be updated in subsequent steps
    await googleSheets.updatePublicationStatus(
      context.recipeRowNumber,
      {
        seoKeyword: context.seoData.seoKeyword,
        seoTitle: context.seoData.seoTitle,
        seoDescription: context.seoData.seoDescription,
        image01,
        image02,
        image03,
        image04,
        recipeId: context.publishedRecipe.recipeId,
        postLink: context.publishedRecipe.fullUrl,
        pinterestDescription: '', // Will be updated in step 11
        pinterestTitle: '',       // Will be updated in step 11
        pinterestImage: '',       // Will be updated in step 11
        pinterestCategory: '',    // Will be updated in step 11
        isIndexed: '',            // Will be updated in step 12 (empty string initially)
      }
    );

    logger.info('Google Sheet updated with complete post data successfully', {
      rowNumber: context.recipeRowNumber,
      seoKeyword: context.seoData.seoKeyword,
      postUrl: context.publishedRecipe.fullUrl,
      recipeId: context.publishedRecipe.recipeId,
      hasImages: !!(image01 && image02 && image03 && image04),
    });
  } catch (error) {
    logger.error('Failed to update Google Sheet with post data', error);
    throw error;
  }
}
