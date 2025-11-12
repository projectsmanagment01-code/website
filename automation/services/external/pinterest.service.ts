/**
 * Pinterest Service - Send to Make.com webhook
 */

import { automationEnv } from '../../config/env';
import { logger } from '../../utils/logger';
import { PinterestImageData } from '../../types/image.types';
import { retryWithBackoff } from '../../utils/retry';

export class PinterestService {
  private webhookUrl?: string;

  constructor() {
    this.webhookUrl = automationEnv.external.makeWebhookUrl;
  }

  /**
   * Send Pinterest data to Make.com webhook
   */
  async sendToPinterest(data: PinterestImageData): Promise<void> {
    if (!this.webhookUrl) {
      logger.warn('Pinterest webhook URL not configured, skipping');
      return;
    }

    logger.info('Sending to Pinterest webhook');

    try {
      await retryWithBackoff(async () => {
        const response = await fetch(this.webhookUrl!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: data.imageUrl,
            description: data.description,
            title: data.title,
            category: data.category,
            link: data.link,
          }),
        });

        if (!response.ok) {
          throw new Error(`Webhook failed: ${response.status}`);
        }
      });

      logger.info('Pinterest webhook sent successfully');
    } catch (error) {
      logger.error('Failed to send Pinterest webhook', error);
      // Don't throw - Pinterest failure shouldn't stop the workflow
      logger.warn('Continuing despite Pinterest webhook failure');
    }
  }
}

export const pinterest = new PinterestService();
