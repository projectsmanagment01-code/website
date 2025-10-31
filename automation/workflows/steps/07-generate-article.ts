/**
 * Step 7: Generate Recipe Article using Gemini Pro
 */

import { WorkflowContext } from '../../types/workflow.types';
import { geminiPro } from '../../services/ai/gemini-pro.service';
import { recipeArticle } from '../../services/recipe/article.service';
import { logger } from '../../utils/logger';
import { ValidationError, AIError } from '../../utils/errors';

export async function generateArticleStep(context: WorkflowContext): Promise<void> {
  logger.info('Step 7: Generating recipe article with Gemini Pro');

  if (!context.recipe) {
    throw new ValidationError('Recipe data is missing from context');
  }

  if (!context.uploadedImages) {
    throw new ValidationError('Uploaded images are missing from context');
  }

  try {
    // Generate article using Gemini Pro
    const aiArticle = await geminiPro.generateRecipeArticle(
      context.recipe,
      context.uploadedImages
    );

    if (!aiArticle) {
      throw new AIError('Failed to generate recipe article');
    }

    // Build and normalize the article
    const article = recipeArticle.buildArticle(aiArticle, context.recipe, context.uploadedImages);
    const normalizedArticle = recipeArticle.normalizeArticle(article);

    context.article = normalizedArticle;

    logger.info('Recipe article generated and normalized successfully', {
      title: normalizedArticle.title,
      slug: normalizedArticle.slug,
      wordsCount: normalizedArticle.wordsCount,
    });
  } catch (error) {
    logger.error('Failed to generate recipe article', error);
    throw error;
  }
}
