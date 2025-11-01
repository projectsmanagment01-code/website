/**
 * Google Sheets Authentication
 */

import { getGoogleCredentials } from '../../config/env';

let cachedAuth: any = null;

export async function getGoogleAuth() {
  if (cachedAuth) {
    console.log('✅ Using cached Google auth');
    return cachedAuth;
  }

  console.log('🔐 Initializing Google authentication...');
  
  try {
    const { google } = await import('googleapis');
    const credentials = await getGoogleCredentials();

    if (!credentials) {
      throw new Error('Google credentials are null or undefined');
    }

    console.log('🔑 Creating Google Auth with credentials...');
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/indexing',
      ],
    });

    console.log('✅ Google auth initialized successfully');
    cachedAuth = auth;
    return auth;
  } catch (error) {
    console.error('❌ Failed to initialize Google auth:', error);
    throw error;
  }
}
