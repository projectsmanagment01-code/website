/**
 * Pinterest Webhook Service
 * Sends recipe data to Make.com for Pinterest posting
 */

import axios from 'axios';

export interface PinterestWebhookPayload {
  recipeId: string;
  title: string;
  description: string;
  imageUrl: string;
  postLink: string;
  boardId: string;
  category?: string;
  tags?: string[];
  altText?: string;
}

export interface WebhookResult {
  success: boolean;
  payload?: PinterestWebhookPayload;
  response?: any;
  error?: string;
}

/**
 * Send recipe data to Make.com webhook for Pinterest posting
 */
export async function sendPinterestWebhook(
  webhookUrl: string,
  payload: PinterestWebhookPayload
): Promise<WebhookResult> {
  try {
    console.log('[Pinterest Webhook] Sending payload to Make.com:', {
      webhookUrl,
      recipeId: payload.recipeId,
      title: payload.title,
      boardId: payload.boardId,
    });

    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('[Pinterest Webhook] Success:', response.data);

    return {
      success: true,
      payload,
      response: response.data,
    };
  } catch (error: any) {
    console.error('[Pinterest Webhook] Error:', error);

    return {
      success: false,
      payload,
      error: error.message || 'Failed to send webhook',
    };
  }
}

/**
 * Send batch of recipes to webhook
 */
export async function sendPinterestWebhookBatch(
  webhookUrl: string,
  payloads: PinterestWebhookPayload[]
): Promise<WebhookResult[]> {
  const results: WebhookResult[] = [];

  for (const payload of payloads) {
    const result = await sendPinterestWebhook(webhookUrl, payload);
    results.push(result);

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Test webhook URL
 */
export async function testPinterestWebhook(
  webhookUrl: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const testPayload: PinterestWebhookPayload = {
      recipeId: 'test-123',
      title: 'Test Recipe - Webhook Validation',
      description: 'This is a test payload to validate the webhook connection.',
      imageUrl: 'https://example.com/test-image.jpg',
      postLink: 'https://example.com/recipes/test-123',
      boardId: 'test-board-id',
      category: 'Test',
      tags: ['test'],
      altText: 'Test recipe image',
    };

    const response = await axios.post(webhookUrl, testPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log('[Pinterest Webhook] Test successful:', response.data);

    return { valid: true };
  } catch (error: any) {
    console.error('[Pinterest Webhook] Test failed:', error);
    
    return { 
      valid: false, 
      error: error.message || 'Webhook test failed' 
    };
  }
}

/**
 * Build webhook payload from recipe data
 */
export function buildPinterestPayload(
  recipeId: string,
  title: string,
  description: string,
  imageUrl: string,
  siteUrl: string,
  boardId: string,
  options?: {
    category?: string;
    tags?: string[];
    altText?: string;
  }
): PinterestWebhookPayload {
  // Build full recipe URL
  const postLink = `${siteUrl}/recipes/${recipeId}`;

  // Trim description to 500 chars (Pinterest limit)
  const trimmedDescription = description.length > 500 
    ? description.substring(0, 497) + '...'
    : description;

  return {
    recipeId,
    title,
    description: trimmedDescription,
    imageUrl,
    postLink,
    boardId,
    category: options?.category,
    tags: options?.tags,
    altText: options?.altText || title,
  };
}
