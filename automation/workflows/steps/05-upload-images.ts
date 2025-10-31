/**
 * Step 5: Upload Images to Website
 */

import { WorkflowContext } from '../../types/workflow.types';
import { imageUploader } from '../../services/image/uploader.service';
import { logger } from '../../utils/logger';
import { ValidationError, ImageError } from '../../utils/errors';

export async function uploadImagesStep(context: WorkflowContext): Promise<void> {
  logger.info('Step 5: Uploading images to website');

  if (!context.generatedImages) {
    throw new ValidationError('Generated images are missing from context');
  }

  if (!context.recipe) {
    throw new ValidationError('Recipe data is missing from context');
  }

  try {
    // Upload all 4 images in parallel
    const [featureUrl, ingredientsUrl, cookingUrl, finalUrl] = await Promise.all([
      imageUploader.uploadImage(
        context.generatedImages.featureImage,
        `${context.recipe.title}-feature`
      ),
      imageUploader.uploadImage(
        context.generatedImages.ingredientsImage,
        `${context.recipe.title}-ingredients`
      ),
      imageUploader.uploadImage(
        context.generatedImages.cookingImage,
        `${context.recipe.title}-cooking`
      ),
      imageUploader.uploadImage(
        context.generatedImages.finalDishImage,
        `${context.recipe.title}-final`
      ),
    ]);

    if (!featureUrl || !ingredientsUrl || !cookingUrl || !finalUrl) {
      throw new ImageError('Failed to upload one or more images');
    }

    context.uploadedImages = {
      featureImage: featureUrl,
      ingredientsImage: ingredientsUrl,
      cookingImage: cookingUrl,
      finalDishImage: finalUrl,
    };

    logger.info('All images uploaded successfully', {
      featureUrl,
      ingredientsUrl,
      cookingUrl,
      finalUrl,
    });
  } catch (error) {
    logger.error('Failed to upload images to website', error);
    throw error;
  }
}
