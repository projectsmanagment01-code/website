/**
 * Step 2: Generate Image Prompts using Gemini Flash
 */

import { WorkflowContext } from '../../types/workflow.types';
import { geminiFlash } from '../../services/ai/gemini-flash.service';
import { logger } from '../../utils/logger';
import { ValidationError, AIError } from '../../utils/errors';

export async function generatePromptsStep(context: WorkflowContext): Promise<void> {
  logger.info('Step 2: Generating image prompts with Gemini Flash');

  if (!context.recipe) {
    throw new ValidationError('Recipe data is missing from context');
  }

  try {
    const prompts = await geminiFlash.generateImagePrompts({
      title: context.recipe.title,
      description: context.recipe.description,
      category: context.recipe.category || 'Recipes',
    });

    if (!prompts) {
      throw new AIError('Failed to generate image prompts');
    }

    context.imagePrompts = prompts;

    logger.info('Image prompts generated successfully', {
      hasFeaturePrompt: !!prompts.image_1_feature,
      hasIngredientsPrompt: !!prompts.image_2_ingredients,
      hasCookingPrompt: !!prompts.image_3_cooking,
      hasFinalPrompt: !!prompts.image_4_final_presentation,
    });
  } catch (error) {
    logger.error('Failed to generate image prompts', error);
    throw error;
  }
}
