/**
 * Recipe Article Service - Build recipe JSON
 */

import { logger } from '../../utils/logger';
import { RecipeArticleData } from '../../types/recipe.types';
import { validateRecipeArticle } from '../../utils/validators';

export class RecipeArticleService {
  /**
   * Build complete recipe article from AI output
   */
  buildArticle(
    aiOutput: any,
    metadata: {
      categoryId: string;
      authorId: string;
    }
  ): RecipeArticleData {
    logger.info('Building recipe article');

    // Merge AI output with required metadata
    const article: RecipeArticleData = {
      ...aiOutput,
      categoryId: metadata.categoryId,
      authorId: metadata.authorId,
      updatedDate: new Date().toISOString(),
      status: 'published',
    };

    // Validate
    validateRecipeArticle(article);

    logger.info('Recipe article built successfully');
    return article;
  }

  /**
   * Clean and normalize article data
   */
  normalizeArticle(article: RecipeArticleData): RecipeArticleData {
    return {
      ...article,
      // Ensure slug is URL-safe
      slug: article.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      // Ensure href is correct
      href: `/recipes/${article.slug}`,
      // Ensure category links are correct
      categoryLink: `/categories/${article.category}`,
      categoryHref: `/categories/${article.category}`,
    };
  }
}

export const recipeArticle = new RecipeArticleService();
