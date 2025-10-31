/**
 * Step 2: Generate SEO Data from SPY Data
 */

import { WorkflowContext } from '../../types/workflow.types';
import { seoGenerator } from '../../services/recipe/seo-generator.service';
import { logger } from '../../utils/logger';
import { ValidationError, AIError } from '../../utils/errors';

export async function generateSeoDataStep(context: WorkflowContext): Promise<void> {
  logger.info('Step 2: Generating SEO data from SPY data');

  if (!context.recipe) {
    throw new ValidationError('Recipe SPY data is missing from context');
  }

  try {
    // Generate SEO keyword, title, and description
    const seoData = await seoGenerator.generateSeoData({
      spyTitle: context.recipe.spyTitle,
      spyDescription: context.recipe.spyDescription,
      category: context.recipe.category,
    });

    // Store SEO data in context (this will be used for all subsequent steps)
    context.seoData = seoData;

    logger.info('SEO data generated successfully', {
      keyword: seoData.seoKeyword,
      title: seoData.seoTitle,
      descriptionLength: seoData.seoDescription.length,
    });
  } catch (error) {
    logger.error('Failed to generate SEO data', error);
    throw error;
  }
}
