/**
 * Step 3: Download Reference Image
 */

import { WorkflowContext } from '../../types/workflow.types';
import { imageDownloader } from '../../services/image/downloader.service';
import { logger } from '../../utils/logger';
import { ValidationError } from '../../utils/errors';

export async function downloadReferenceImageStep(context: WorkflowContext): Promise<void> {
  logger.info('Step 3: Downloading reference image');

  if (!context.recipe) {
    throw new ValidationError('Recipe data is missing from context');
  }

  if (!context.recipe.referenceImageUrl) {
    logger.warn('No reference image URL provided, skipping download');
    context.referenceImage = undefined;
    return;
  }

  try {
    const imagePath = await imageDownloader.downloadImage(
      context.recipe.referenceImageUrl,
      `reference-${context.automationId}`
    );

    context.referenceImage = imagePath;

    logger.info('Reference image downloaded successfully', {
      url: context.recipe.referenceImageUrl,
      path: imagePath,
    });
  } catch (error) {
    logger.error('Failed to download reference image', error);
    // Don't throw - reference image is optional
    context.referenceImage = undefined;
  }
}
