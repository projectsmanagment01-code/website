/**
 * Step 10: Send to Pinterest via Make.com Webhook
 */

import { WorkflowContext } from '../../types/workflow.types';
import { geminiFlash } from '../../services/ai/gemini-flash.service';
import { pinterest } from '../../services/external/pinterest.service';
import { googleSheets } from '../../services/google/sheets.service';
import { logger } from '../../utils/logger';
import { ValidationError } from '../../utils/errors';

export async function sendToPinterestStep(context: WorkflowContext): Promise<void> {
  // Skip if Pinterest is disabled
  if (!context.config.enablePinterest) {
    logger.info('Step 10: Pinterest disabled, skipping');
    return;
  }

  logger.info('Step 10: Sending to Pinterest');

  if (!context.publishedRecipe) {
    throw new ValidationError('Published recipe data is missing from context');
  }

  if (!context.uploadedImages) {
    throw new ValidationError('Uploaded images are missing from context');
  }

  if (!context.article) {
    throw new ValidationError('Recipe article is missing from context');
  }

  try {
    // Generate Pinterest description
    const pinterestDescription = await geminiFlash.generatePinterestDescription(
      context.article.title,
      context.article.metaDescription || '',
      context.article.category || ''
    );

    // Send to Pinterest via Make.com webhook
    await pinterest.sendToPinterest({
      imageUrl: context.uploadedImages.featureImage,
      title: context.article.title,
      description: pinterestDescription,
      category: context.article.category || 'Recipes',
      link: context.publishedRecipe.fullUrl,
    });

    // Update Google Sheet with Pinterest data
    await googleSheets.updatePublicationStatus(
      context.recipeRowNumber,
      {
        postLink: context.publishedRecipe.fullUrl,
        recipeId: context.publishedRecipe.recipeId,
        pinterestImage: context.uploadedImages.featureImage,
        pinterestTitle: context.article.title,
        pinterestDescription: pinterestDescription,
        pinterestCategory: context.article.category || 'Recipes',
      }
    );

    logger.info('Recipe sent to Pinterest successfully');
  } catch (error) {
    logger.error('Failed to send to Pinterest', error);
    // Don't throw - Pinterest is optional, continue workflow
    logger.warn('Continuing workflow despite Pinterest error');
  }
}
