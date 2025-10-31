/**
 * Step 11: Request Google Indexing
 */

import { WorkflowContext } from '../../types/workflow.types';
import { googleIndexing } from '../../services/google/indexing.service';
import { googleSheets } from '../../services/google/sheets.service';
import { logger } from '../../utils/logger';
import { ValidationError } from '../../utils/errors';

export async function requestIndexingStep(context: WorkflowContext): Promise<void> {
  // Skip if indexing is disabled
  if (!context.config.enableIndexing) {
    logger.info('Step 11: Google Indexing disabled, skipping');
    return;
  }

  logger.info('Step 11: Requesting Google Indexing');

  if (!context.publishedRecipe) {
    throw new ValidationError('Published recipe data is missing from context');
  }

  try {
    // Request indexing for the published recipe URL
    await googleIndexing.requestIndexing(context.publishedRecipe.fullUrl);

    logger.info('Google Indexing requested successfully', {
      url: context.publishedRecipe.fullUrl,
    });
    
    // Note: Indexing status is already set to "sent" in the sheet by updatePublicationStatus
  } catch (error) {
    logger.error('Failed to request Google Indexing', error);
    
    // Don't throw - indexing is optional, workflow is complete
    logger.warn('Workflow completed despite indexing error');
  }
}
