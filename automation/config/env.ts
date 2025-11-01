/**
 * Environment Configuration for Automation System
 * All required environment variables for the automation workflow
 */

export const automationEnv = {
  // Database
  database: {
    url: process.env.DATABASE_URL!,
  },

  // Redis (for BullMQ)
  redis: {
    // Auto-detect: Use 'redis' in Docker, 'localhost' locally
    host: process.env.REDIS_HOST || (process.env.NODE_ENV === 'production' ? 'redis' : 'localhost'),
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },

  // Google Services
  google: {
    sheetId: process.env.GOOGLE_SHEET_ID!,
    serviceAccount: process.env.GOOGLE_SERVICE_ACCOUNT!, // Base64 encoded JSON
    indexingServiceAccount: process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT, // Optional: separate for indexing
  },

  // Gemini AI
  gemini: {
    apiKey: process.env.GEMINI_API_KEY!,
    flashModel: 'gemini-2.0-flash-exp',
    proModel: 'gemini-2.0-flash-thinking-exp-01-21',
  },

  // Website API
  website: {
    apiUrl: process.env.WEBSITE_API_URL || process.env.NEXT_PUBLIC_BASE_URL!,
    apiToken: process.env.WEBSITE_API_TOKEN!,
    domain: process.env.NAKED_DOMAIN!,
  },

  // External Services
  external: {
    makeWebhookUrl: process.env.MAKE_WEBHOOK_URL,
  },

  // Automation Settings
  automation: {
    enabled: process.env.AUTOMATION_ENABLED !== 'false',
    cronSchedule: process.env.AUTOMATION_CRON || '0 */2 * * *', // Every 2 hours
    maxRetries: parseInt(process.env.AUTOMATION_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.AUTOMATION_RETRY_DELAY || '60000'), // 1 minute
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/automation.log',
  },
} as const;

/**
 * Validates all required environment variables
 * Throws error if any required variable is missing
 */
export function validateAutomationEnv() {
  const required = [
    'DATABASE_URL',
    'GOOGLE_SHEET_ID',
    'GOOGLE_SERVICE_ACCOUNT',
    'GEMINI_API_KEY',
    'WEBSITE_API_TOKEN',
    'NAKED_DOMAIN',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for automation: ${missing.join(', ')}`
    );
  }

  console.log('✅ Automation environment variables validated');
}

/**
 * Get automation settings from database
 * Caches the result for performance
 */
let cachedSettings: any = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

async function getSettingsFromDB() {
  const now = Date.now();
  
  // Check if cache should be bypassed or is expired
  const shouldRefresh = process.env.FORCE_REFRESH_SETTINGS === 'true' || !cachedSettings || (now - cacheTime) >= CACHE_TTL;
  
  if (!shouldRefresh) {
    return cachedSettings;
  }
  
  try {
    const { getAutomationSettings } = await import('@/lib/automation-settings');
    const settings = await getAutomationSettings();
    
    if (settings) {
      cachedSettings = settings;
      cacheTime = now;
      console.log('🔄 Settings refreshed from database');
      return settings;
    }
  } catch (error) {
    console.warn('Failed to load settings from database', error);
  }
  
  return null;
}

/**
 * Force refresh settings cache
 */
export function clearSettingsCache() {
  cachedSettings = null;
  cacheTime = 0;
  console.log('🗑️ Settings cache cleared');
}

/**
 * Get Google Service Account credentials
 * Loads from database settings or falls back to environment variables
 */
export async function getGoogleCredentials() {
  // Try to load from database first
  const settings = await getSettingsFromDB();
  
  if (settings?.googleCredentialsJson) {
    try {
      console.log('Loading Google credentials from database...');
      // Parse the JSON string
      const credentials = JSON.parse(settings.googleCredentialsJson);
      
      // Validate required fields
      if (!credentials.type || !credentials.project_id || !credentials.private_key || !credentials.client_email) {
        throw new Error('Invalid credentials format: missing required fields (type, project_id, private_key, client_email)');
      }
      
      console.log('✅ Google credentials loaded from database');
      console.log(`   Project: ${credentials.project_id}`);
      console.log(`   Email: ${credentials.client_email}`);
      return credentials;
    } catch (error) {
      console.error('❌ Failed to parse Google credentials JSON from database', error);
      console.error('Credentials preview:', settings.googleCredentialsJson?.substring(0, 100));
    }
  } else {
    console.log('No Google credentials found in database settings');
  }
  
  // Fall back to environment variables
  const encoded = process.env.GOOGLE_SERVICE_ACCOUNT;
  
  if (!encoded) {
    const errorMsg = 'Google Service Account credentials not found in database or environment variables. Please configure them in /admin/automation/settings';
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }
  
  console.log('Loading Google credentials from environment variables...');
  
  try {
    // Try to parse as JSON first (in case it's not base64)
    const credentials = JSON.parse(encoded);
    console.log('✅ Google credentials loaded from env (JSON)');
    return credentials;
  } catch {
    // If parsing fails, assume it's base64 encoded
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    const credentials = JSON.parse(decoded);
    console.log('✅ Google credentials loaded from env (base64)');
    return credentials;
  }
}

/**
 * Get Google Sheet ID
 * Loads from database settings or falls back to environment variables
 */
export async function getGoogleSheetId(): Promise<string> {
  // Try to load from database first
  const settings = await getSettingsFromDB();
  
  if (settings?.googleSheetId) {
    return settings.googleSheetId;
  }
  
  // Fall back to environment variable
  const sheetId = process.env.GOOGLE_SHEET_ID;
  
  if (!sheetId) {
    throw new Error('Google Sheet ID not found in database or environment variables');
  }
  
  return sheetId;
}
