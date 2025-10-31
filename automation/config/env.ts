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
 * Get Google Service Account credentials
 * Decodes from base64 if needed
 */
export function getGoogleCredentials() {
  const encoded = process.env.GOOGLE_SERVICE_ACCOUNT!;
  
  try {
    // Try to parse as JSON first (in case it's not base64)
    return JSON.parse(encoded);
  } catch {
    // If parsing fails, assume it's base64 encoded
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  }
}
