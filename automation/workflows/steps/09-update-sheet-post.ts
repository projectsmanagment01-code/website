/**
 * Step 9: Update Google Sheet with Post Data
 */

import { WorkflowContext } from '../../types/workflow.types';
import { googleSheets } from '../../services/google/sheets.service';
import { logger } from '../../utils/logger';
import { ValidationError } from '../../utils/errors';

export async function updateSheetPostDataStep(context: WorkflowContext): Promise<void> {
  logger.info('Step 9: Updating Google Sheet with post data');

  if (!context.publishedRecipe) {
    throw new ValidationError('Published recipe data is missing from context');
  }

  try {
    // Note: Pinterest data will be empty strings for now, will be updated in step 10
    await googleSheets.updatePublicationStatus(
      context.recipeRowNumber,
      {
        postLink: context.publishedRecipe.fullUrl,
        recipeId: context.publishedRecipe.recipeId,
        pinterestImage: '',
        pinterestTitle: '',
        pinterestDescription: '',
        pinterestCategory: '',
      }
    );

    logger.info('Google Sheet updated with post data successfully', {
      rowNumber: context.recipeRowNumber,
      postUrl: context.publishedRecipe.fullUrl,
      recipeId: context.publishedRecipe.recipeId,
    });
  } catch (error) {
    logger.error('Failed to update Google Sheet with post data', error);
    throw error;
  }
}
