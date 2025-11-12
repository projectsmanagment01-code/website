/**
 * Image Provider Factory
 * Creates appropriate image provider based on configuration
 */

import { GeminiImageProvider } from './gemini/service';
import { MidjourneyImageProvider } from './midjourney/service';
import type { IImageProvider, ImageProvider } from './types';

export interface ProviderConfig {
  provider: ImageProvider;
  geminiApiKey?: string;
  midjourneyApiKey?: string;
  midjourneyWebhookUrl?: string;
}

export class ImageProviderFactory {
  static create(config: ProviderConfig): IImageProvider | null {
    switch (config.provider) {
      case 'gemini':
        if (!config.geminiApiKey) {
          console.error('Gemini API key not provided');
          return null;
        }
        return new GeminiImageProvider(config.geminiApiKey);

      case 'midjourney':
        if (!config.midjourneyApiKey || !config.midjourneyWebhookUrl) {
          console.error('Midjourney configuration incomplete');
          return null;
        }
        return new MidjourneyImageProvider({
          apiKey: config.midjourneyApiKey,
          webhookUrl: config.midjourneyWebhookUrl
        });

      default:
        console.error(`Unknown image provider: ${config.provider}`);
        return null;
    }
  }
}
