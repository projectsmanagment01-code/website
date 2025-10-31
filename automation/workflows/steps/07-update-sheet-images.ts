/**
 * Step 6: Update Google Sheet with Image URLs
 */

import { WorkflowContext } from '../../types/workflow.types';
import { googleSheets } from '../../services/google/sheets.service';
import { logger } from '../../utils/logger';
import { ValidationError } from '../../utils/errors';

export async function updateSheetImagesStep(context: WorkflowContext): Promise<void> {
  logger.info('Step 6: Updating Google Sheet with image URLs');

  if (!context.uploadedImages) {
    throw new ValidationError('Uploaded image URLs are missing from context');
  }

  try {
    await googleSheets.updateImageUrls(
      context.config.sheetId,
      context.recipeRowNumber,
      context.uploadedImages.featureImage,
      context.uploadedImages.ingredientsImage,
      context.uploadedImages.cookingImage,
      context.uploadedImages.finalDishImage,
      context.config.imageColumns
    );

    logger.info('Google Sheet updated with image URLs successfully', {
      rowNumber: context.recipeRowNumber,
    });
  } catch (error) {
    logger.error('Failed to update Google Sheet with image URLs', error);
    throw error;
  }
}
