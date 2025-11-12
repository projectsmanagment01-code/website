/**
 * Recipe Publisher Service - POST recipe to website
 */

import { automationEnv } from '../../config/env';
import { AUTOMATION_CONSTANTS } from '../../config/constants';
import { logger } from '../../utils/logger';
import { RecipeArticleData, RecipePublishResult } from '../../types/recipe.types';
import { retryWithBackoff, withTimeout } from '../../utils/retry';
import { PublishError } from '../../utils/errors';

export class RecipePublisherService {
  private apiUrl: string;
  private apiToken: string;
  private domain: string;

  constructor() {
    this.apiUrl = automationEnv.website.apiUrl;
    this.apiToken = automationEnv.website.apiToken;
    this.domain = automationEnv.website.domain;
  }

  /**
   * Publish recipe to website
   */
  async publishRecipe(article: RecipeArticleData): Promise<RecipePublishResult> {
    logger.info('Publishing recipe to website', { title: article.title });

    try {
      const result = await retryWithBackoff(
        () =>
          withTimeout(
            this.performPublish(article),
            AUTOMATION_CONSTANTS.TIMEOUTS.UPLOAD * 2 // Longer timeout for recipe
          ),
        { maxAttempts: 3 }
      );

      logger.info('Recipe published successfully', result);
      return result;
    } catch (error) {
      logger.error('Failed to publish recipe', error);
      throw new PublishError(
        'Failed to publish recipe to website',
        AUTOMATION_CONSTANTS.STEPS.PUBLISH_RECIPE
      );
    }
  }

  /**
   * Perform the actual publish
   */
  private async performPublish(
    article: RecipeArticleData
  ): Promise<RecipePublishResult> {
    const response = await fetch(`${this.apiUrl}/api/recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: JSON.stringify(article),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Publish failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // API should return { id, slug }
    if (!data.id || !data.slug) {
      throw new Error('Invalid response from recipe API');
    }

    return {
      success: true,
      recipeId: data.id,
      slug: data.slug,
      url: `https://${this.domain}/recipes/${data.slug}`,
    };
  }
}

export const recipePublisher = new RecipePublisherService();
