/**
 * Step 1: Fetch Recipe from Google Sheets
 */

import { WorkflowContext } from '../../types/workflow.types';
import { googleSheets } from '../../services/google/sheets.service';
import { logger } from '../../utils/logger';
import { ValidationError, SheetError } from '../../utils/errors';

export async function fetchRecipeStep(context: WorkflowContext): Promise<void> {
  logger.info('Step 1: Fetching recipe from Google Sheets');

  try {
    // fetchPendingRecipe() takes no parameters - it loads sheet ID from database/env
    const recipe = await googleSheets.fetchPendingRecipe();

    if (!recipe) {
      logger.info('No eligible recipes found in sheet (need is Published="Go" and Skip="false")');
      throw new SheetError('No eligible recipe found in Google Sheets');
    }

    // Store the recipe and row number in context
    context.recipe = recipe;
    context.recipeRowNumber = recipe.rowNumber;

    logger.info('Recipe fetched successfully', {
      rowNumber: recipe.rowNumber,
      spyTitle: recipe.spyTitle,
      category: recipe.category,
    });
  } catch (error) {
    logger.error('Failed to fetch recipe from Google Sheets', error);
    throw error;
  }
}
