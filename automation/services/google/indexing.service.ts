/**
 * Google Indexing Service
 */

import { automationEnv } from '../../config/env';
import { logger } from '../../utils/logger';
import { retryWithBackoff } from '../../utils/retry';
import { getGoogleAuth } from './auth';

export class GoogleIndexingService {
  /**
   * Request indexing for URL
   */
  async requestIndexing(url: string): Promise<void> {
    logger.info('Requesting Google indexing', { url });

    try {
      const auth = await getGoogleAuth();
      const { google } = await import('googleapis');
      
      const indexing = google.indexing({ version: 'v3', auth });

      await retryWithBackoff(() =>
        indexing.urlNotifications.publish({
          requestBody: {
            url,
            type: 'URL_UPDATED',
          },
        })
      );

      logger.info('Indexing requested successfully');
    } catch (error) {
      logger.error('Failed to request indexing', error);
      // Don't throw - indexing failure shouldn't stop the workflow
      logger.warn('Continuing despite indexing failure');
    }
  }
}

export const googleIndexing = new GoogleIndexingService();
