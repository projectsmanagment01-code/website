/**
 * Step 4: Generate AI Images
 */

import { WorkflowContext } from '../../types/workflow.types';
import { imageGenerator } from '../../services/image/generator.service';
import { logger } from '../../utils/logger';
import { ValidationError, ImageError } from '../../utils/errors';

export async function generateImagesStep(context: WorkflowContext): Promise<void> {
  logger.info('Step 4: Generating AI images');

  if (!context.imagePrompts) {
    throw new ValidationError('Image prompts are missing from context');
  }

  if (!context.recipe) {
    throw new ValidationError('Recipe data is missing from context');
  }

  try {
    const images = await imageGenerator.generateAllImages(
      context.imagePrompts,
      context.referenceImage
    );

    if (!images || Object.keys(images).length !== 4) {
      throw new ImageError('Not all images were generated');
    }

    context.images = images;

    logger.info('All AI images generated successfully', {
      featurePath: images.featureImage,
      ingredientsPath: images.ingredientsImage,
      cookingPath: images.cookingImage,
      finalPath: images.finalDishImage,
    });
  } catch (error) {
    logger.error('Failed to generate AI images', error);
    throw error;
  }
}
