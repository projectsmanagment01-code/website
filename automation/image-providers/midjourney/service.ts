/**
 * Midjourney Image Generation Service (GoAPI)
 * Handles image generation using Midjourney through GoAPI
 */

import {
  IImageProvider,
  ImageGenerationRequest,
  ImageGenerationResult,
  ImageProvider
} from '../types';

export interface MidjourneyConfig {
  apiKey: string;
  webhookUrl: string;
}

export interface GoAPIRequest {
  model: string;
  task_type: string;
  input: {
    prompt: string;
    image_url?: string; // For sref (style reference)
  };
  config: {
    process_mode?: 'relax' | 'fast' | 'turbo';
    aspect_ratio?: string;
    webhook_config?: {
      endpoint: string;
    };
  };
}

export interface GoAPIResponse {
  code: number;
  message: string;
  data: {
    task_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    input: any;
    output?: any;
    meta?: any;
    error?: string;
  };
}

export class MidjourneyImageProvider implements IImageProvider {
  private config: MidjourneyConfig;
  private apiUrl = 'https://api.goapi.ai/api/v1/task';

  constructor(config: MidjourneyConfig) {
    this.config = config;
  }

  getProviderName(): ImageProvider {
    return 'midjourney';
  }

  isConfigured(): boolean {
    return !!(
      this.config.apiKey &&
      this.config.webhookUrl
    );
  }

  async generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Midjourney configuration incomplete (API key, webhook URL, or secret missing)'
      };
    }

    try {
      const payload: GoAPIRequest = {
        model: 'midjourney',
        task_type: 'imagine',
        input: {
          prompt: request.prompt,
          ...(request.referenceImageUrl && { image_url: request.referenceImageUrl })
        },
        config: {
          process_mode: 'fast',
          aspect_ratio: '16:9',
          webhook_config: {
            endpoint: this.config.webhookUrl
          }
        }
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`GoAPI request failed: ${response.status} ${response.statusText}`);
      }

      const data: GoAPIResponse = await response.json();

      if (data.code !== 200) {
        throw new Error(data.message || 'GoAPI returned error');
      }

      // Midjourney is async - images will come via webhook
      return {
        success: true,
        taskId: data.data.task_id,
        filename: `${request.recipeTitle.replace(/\s+/g, '-').toLowerCase()}-midjourney.jpg`
      };
    } catch (error: any) {
      console.error('Midjourney image generation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate image with Midjourney'
      };
    }
  }

  /**
   * Process webhook data from GoAPI
   */
  static processWebhookData(webhookData: any): {
    taskId: string;
    imageUrls: string[];
    status: string;
  } | null {
    try {
      const { task_id, status, output } = webhookData.data || webhookData;

      if (status === 'completed' && output?.image_urls) {
        return {
          taskId: task_id,
          imageUrls: output.image_urls,
          status
        };
      }

      return null;
    } catch (error) {
      console.error('Error processing webhook data:', error);
      return null;
    }
  }
}
