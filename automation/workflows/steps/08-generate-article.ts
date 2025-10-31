/**
 * Step 8: Generate Recipe Article using Gemini Pro
 * Uses SEO-optimized data from step 2
 */

import { WorkflowContext } from '../../types/workflow.types';
import { geminiPro } from '../../services/ai/gemini-pro.service';
import { recipeArticle } from '../../services/recipe/article.service';
import { logger } from '../../utils/logger';
import { ValidationError, AIError } from '../../utils/errors';

export async function generateArticleStep(context: WorkflowContext): Promise<void> {
  logger.info('Step 8: Generating recipe article with Gemini Pro');

  if (!context.recipe) {
    throw new ValidationError('Recipe data is missing from context');
  }

  if (!context.seoData) {
    throw new ValidationError('SEO data is missing from context');
  }

  if (!context.uploadedImages) {
    throw new ValidationError('Uploaded images are missing from context');
  }

  try {
    // Prepare parameters for article generation with SEO-optimized data
    const articleParams = {
      title: context.seoData.seoTitle,
      description: context.seoData.seoDescription,
      keyword: context.seoData.seoKeyword,
      category: context.recipe.category || 'Recipes',
      categoryId: context.recipe.categoryId || 'default-category',
      authorId: context.recipe.authorId || 'default-author',
      images: {
        feature: context.uploadedImages.featureImage,
        ingredients: context.uploadedImages.ingredientsImage,
        cooking: context.uploadedImages.cookingImage,
        final: context.uploadedImages.finalDishImage,
      },
    };

    // Generate article using Gemini Pro with SEO-optimized data
    const aiArticle = await geminiPro.generateRecipeArticle(articleParams);

    if (!aiArticle) {
      throw new AIError('Failed to generate recipe article');
    }

    // Build and normalize the article
    const article = recipeArticle.buildArticle(aiArticle, {
      categoryId: articleParams.categoryId,
      authorId: articleParams.authorId,
    });
    const normalizedArticle = recipeArticle.normalizeArticle(article);

    context.article = normalizedArticle;

    logger.info('Recipe article generated and normalized successfully', {
      title: normalizedArticle.title,
      slug: normalizedArticle.slug,
      seoKeyword: context.seoData.seoKeyword,
    });
  } catch (error) {
    logger.error('Failed to generate recipe article', error);
    throw error;
  }
}
