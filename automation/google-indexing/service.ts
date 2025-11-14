/**
 * Google Indexing API Service
 * Submits URLs to Google for faster indexing
 * https://developers.google.com/search/apis/indexing-api/v3/quickstart
 */

import { google } from 'googleapis';

export interface GoogleIndexingResult {
  success: boolean;
  url: string;
  status?: string;
  message?: string;
  error?: string;
}

/**
 * Submit URL to Google Indexing API
 */
export async function requestGoogleIndexing(
  url: string,
  serviceAccountCredentials: string
): Promise<GoogleIndexingResult> {
  try {
    // Parse service account credentials
    const credentials = JSON.parse(serviceAccountCredentials);

    // Create JWT auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const authClient = await auth.getClient();

    // Create indexing API client
    const indexing = google.indexing({
      version: 'v3',
      auth: authClient as any,
    });

    // Submit URL for indexing
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED', // Use URL_UPDATED for new/updated content
      },
    });

    return {
      success: true,
      url,
      status: 'submitted',
      message: `URL submitted for indexing: ${response.data.urlNotificationMetadata?.latestUpdate?.type || 'success'}`,
    };
  } catch (error: any) {
    console.error('[Google Indexing] Error:', error);
    
    return {
      success: false,
      url,
      error: error.message || 'Failed to submit URL for indexing',
    };
  }
}

/**
 * Submit multiple URLs to Google Indexing API
 */
export async function requestGoogleIndexingBatch(
  urls: string[],
  serviceAccountCredentials: string
): Promise<GoogleIndexingResult[]> {
  const results: GoogleIndexingResult[] = [];

  for (const url of urls) {
    const result = await requestGoogleIndexing(url, serviceAccountCredentials);
    results.push(result);

    // Add small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Check indexing status of a URL
 */
export async function checkIndexingStatus(
  url: string,
  serviceAccountCredentials: string
): Promise<GoogleIndexingResult> {
  try {
    const credentials = JSON.parse(serviceAccountCredentials);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const authClient = await auth.getClient();

    const indexing = google.indexing({
      version: 'v3',
      auth: authClient as any,
    });

    // Get URL notification metadata
    const response = await indexing.urlNotifications.getMetadata({
      url: url,
    });

    return {
      success: true,
      url,
      status: response.data.latestUpdate?.type || 'unknown',
      message: `Last updated: ${response.data.latestUpdate?.notifyTime || 'N/A'}`,
    };
  } catch (error: any) {
    console.error('[Google Indexing] Check status error:', error);
    
    return {
      success: false,
      url,
      error: error.message || 'Failed to check indexing status',
    };
  }
}

/**
 * Validate Google service account credentials
 */
export async function validateGoogleIndexingCredentials(
  serviceAccountCredentials: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const credentials = JSON.parse(serviceAccountCredentials);

    // Check required fields
    if (!credentials.type || credentials.type !== 'service_account') {
      return { valid: false, error: 'Invalid service account type' };
    }

    if (!credentials.project_id) {
      return { valid: false, error: 'Missing project_id' };
    }

    if (!credentials.private_key) {
      return { valid: false, error: 'Missing private_key' };
    }

    if (!credentials.client_email) {
      return { valid: false, error: 'Missing client_email' };
    }

    // Try to create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    await auth.getClient();

    return { valid: true };
  } catch (error: any) {
    return { 
      valid: false, 
      error: error.message || 'Invalid credentials format' 
    };
  }
}
