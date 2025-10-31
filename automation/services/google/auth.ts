/**
 * Google Sheets Authentication
 */

import { getGoogleCredentials } from '../../config/env';

let cachedAuth: any = null;

export async function getGoogleAuth() {
  if (cachedAuth) {
    return cachedAuth;
  }

  const { google } = await import('googleapis');
  const credentials = await getGoogleCredentials();

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/indexing',
    ],
  });

  cachedAuth = auth;
  return auth;
}
