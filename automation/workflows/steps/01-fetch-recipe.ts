/**
 * Step 1: Fetch Recipe from Google Sheets
 */

import { WorkflowContext } from '../../types/workflow.types';
import { googleSheets } from '../../services/google/sheets.service';
import { logger } from '../../utils/logger';
import { ValidationError, SheetError } from '../../utils/errors';

export async function fetchRecipeStep(context: WorkflowContext): Promise<void> {
  logger.info('Step 1: Fetching recipe from Google Sheets', {
    sheetId: context.config.sheetId,
    rowNumber: context.recipeRowNumber,
  });

  try {
    const recipe = await googleSheets.fetchPendingRecipe(
      context.config.sheetId,
      context.config.promptSheetRange,
      context.recipeRowNumber
    );

    if (!recipe) {
      throw new SheetError(`No recipe found at row ${context.recipeRowNumber}`);
    }

    context.recipe = recipe;

    logger.info('Recipe fetched successfully', {
      title: recipe.title,
      category: recipe.category,
      author: recipe.authorName,
    });
  } catch (error) {
    logger.error('Failed to fetch recipe from Google Sheets', error);
    throw error;
  }
}
