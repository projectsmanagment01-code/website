/**
 * Step 8: Publish Recipe to Website
 */

import { WorkflowContext } from '../../types/workflow.types';
import { recipePublisher } from '../../services/recipe/publisher.service';
import { logger } from '../../utils/logger';
import { ValidationError, PublishError } from '../../utils/errors';

export async function publishRecipeStep(context: WorkflowContext): Promise<void> {
  logger.info('Step 8: Publishing recipe to website');

  if (!context.article) {
    throw new ValidationError('Recipe article is missing from context');
  }

  try {
    const result = await recipePublisher.publishRecipe(context.article);

    if (!result || !result.recipeId) {
      throw new PublishError('Failed to publish recipe to website');
    }

    context.publishedRecipe = result;

    logger.info('Recipe published successfully', {
      recipeId: result.recipeId,
      slug: result.slug,
      url: result.fullUrl,
    });
  } catch (error) {
    logger.error('Failed to publish recipe to website', error);
    throw error;
  }
}
