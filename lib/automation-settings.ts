/**
 * Automation Settings Service
 * Manages encrypted credentials and configuration in database
 */

import { prisma } from './prisma';
import { encrypt, decrypt } from './encryption';

export interface AutomationSettingsData {
  // Google Sheets
  googleSheetId?: string;
  googleSheetUrl?: string;
  googleCredentialsJson?: string; // Will be encrypted
  
  // AI
  geminiApiKey?: string; // Will be encrypted
  geminiFlashModel?: string;
  geminiProModel?: string;
  
  // Website API
  websiteApiUrl?: string;
  websiteApiToken?: string; // Will be encrypted
  
  // Pinterest
  enablePinterest?: boolean;
  makeWebhookUrl?: string;
  
  // Indexing
  enableIndexing?: boolean;
  
  // Behavior
  maxRetries?: number;
  retryDelayMs?: number;
  
  // AI Prompts (Customizable)
  imagePromptSystemPrompt?: string;
  recipePromptSystemPrompt?: string;
  seoPromptSystemPrompt?: string;
}

export interface AutomationSettingsResponse extends AutomationSettingsData {
  id: string;
  isConfigured: boolean;
  lastTestedAt?: Date;
  testStatus?: string;
  testMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Masked versions of sensitive fields (for display only)
  googleCredentialsJsonMasked?: string;
  geminiApiKeyMasked?: string;
  websiteApiTokenMasked?: string;
}

/**
 * Get automation settings (decrypts sensitive fields)
 */
export async function getAutomationSettings(): Promise<AutomationSettingsResponse | null> {
  const settings = await prisma.automationSettings.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!settings) {
    return null;
  }

  // Decrypt sensitive fields
  const decryptedSettings: AutomationSettingsResponse = {
    id: settings.id,
    googleSheetId: settings.googleSheetId || undefined,
    googleSheetUrl: settings.googleSheetUrl || undefined,
    googleCredentialsJson: settings.googleCredentialsJson 
      ? decrypt(settings.googleCredentialsJson) 
      : undefined,
    geminiApiKey: settings.geminiApiKey 
      ? decrypt(settings.geminiApiKey) 
      : undefined,
    geminiFlashModel: settings.geminiFlashModel,
    geminiProModel: settings.geminiProModel,
    websiteApiUrl: settings.websiteApiUrl || undefined,
    websiteApiToken: settings.websiteApiToken 
      ? decrypt(settings.websiteApiToken) 
      : undefined,
    enablePinterest: settings.enablePinterest,
    makeWebhookUrl: settings.makeWebhookUrl || undefined,
    enableIndexing: settings.enableIndexing,
    maxRetries: settings.maxRetries,
    retryDelayMs: settings.retryDelayMs,
    isConfigured: settings.isConfigured,
    lastTestedAt: settings.lastTestedAt || undefined,
    testStatus: settings.testStatus || undefined,
    testMessage: settings.testMessage || undefined,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
    
    // Include AI prompts
    imagePromptSystemPrompt: settings.imagePromptSystemPrompt || undefined,
    recipePromptSystemPrompt: settings.recipePromptSystemPrompt || undefined,
    seoPromptSystemPrompt: settings.seoPromptSystemPrompt || undefined,
    
    // Add masked versions for display
    googleCredentialsJsonMasked: settings.googleCredentialsJson 
      ? '••••••••' + settings.googleCredentialsJson.slice(-8) 
      : undefined,
    geminiApiKeyMasked: settings.geminiApiKey 
      ? '••••••••' + settings.geminiApiKey.slice(-8) 
      : undefined,
    websiteApiTokenMasked: settings.websiteApiToken 
      ? '••••••••' + settings.websiteApiToken.slice(-8) 
      : undefined,
  };

  return decryptedSettings;
}

/**
 * Update automation settings (encrypts sensitive fields)
 */
export async function updateAutomationSettings(
  data: AutomationSettingsData
): Promise<AutomationSettingsResponse> {
  // Check if settings exist
  const existing = await prisma.automationSettings.findFirst();

  // Encrypt sensitive fields if provided
  const encryptedData: any = {
    googleSheetId: data.googleSheetId,
    googleSheetUrl: data.googleSheetUrl,
    geminiFlashModel: data.geminiFlashModel,
    geminiProModel: data.geminiProModel,
    websiteApiUrl: data.websiteApiUrl,
    enablePinterest: data.enablePinterest,
    makeWebhookUrl: data.makeWebhookUrl,
    enableIndexing: data.enableIndexing,
    maxRetries: data.maxRetries,
    retryDelayMs: data.retryDelayMs,
  };

  // Only encrypt and update if new value provided
  if (data.googleCredentialsJson !== undefined) {
    encryptedData.googleCredentialsJson = data.googleCredentialsJson 
      ? encrypt(data.googleCredentialsJson) 
      : null;
  }

  if (data.geminiApiKey !== undefined) {
    encryptedData.geminiApiKey = data.geminiApiKey 
      ? encrypt(data.geminiApiKey) 
      : null;
  }

  if (data.websiteApiToken !== undefined) {
    encryptedData.websiteApiToken = data.websiteApiToken 
      ? encrypt(data.websiteApiToken) 
      : null;
  }

  // Handle AI prompts (not encrypted, just stored as-is)
  if (data.imagePromptSystemPrompt !== undefined) {
    encryptedData.imagePromptSystemPrompt = data.imagePromptSystemPrompt;
  }

  if (data.recipePromptSystemPrompt !== undefined) {
    encryptedData.recipePromptSystemPrompt = data.recipePromptSystemPrompt;
  }

  if (data.seoPromptSystemPrompt !== undefined) {
    encryptedData.seoPromptSystemPrompt = data.seoPromptSystemPrompt;
  }

  // Check if all required fields are configured
  const isConfigured = !!(
    (data.googleSheetId || existing?.googleSheetId) &&
    (data.googleCredentialsJson || existing?.googleCredentialsJson) &&
    (data.geminiApiKey || existing?.geminiApiKey) &&
    (data.websiteApiUrl || existing?.websiteApiUrl) &&
    (data.websiteApiToken || existing?.websiteApiToken)
  );

  encryptedData.isConfigured = isConfigured;

  // Create or update
  const settings = existing
    ? await prisma.automationSettings.update({
        where: { id: existing.id },
        data: encryptedData,
      })
    : await prisma.automationSettings.create({
        data: encryptedData,
      });

  // Return decrypted settings
  return (await getAutomationSettings())!;
}

/**
 * Test automation settings (validate credentials)
 */
export async function testAutomationSettings(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  const settings = await getAutomationSettings();

  if (!settings || !settings.isConfigured) {
    return {
      success: false,
      message: 'Settings are not fully configured',
    };
  }

  const results: any = {
    googleSheets: false,
    geminiAI: false,
    websiteAPI: false,
  };

  let allPassed = true;
  let errorMessage = '';

  // Test Google Sheets credentials
  try {
    if (settings.googleCredentialsJson && settings.googleSheetId) {
      // Basic validation - check if it's valid JSON
      JSON.parse(settings.googleCredentialsJson);
      results.googleSheets = true;
    }
  } catch (error) {
    allPassed = false;
    errorMessage += 'Google credentials invalid. ';
    results.googleSheetsError = 'Invalid JSON format';
  }

  // Test Gemini API key
  if (settings.geminiApiKey) {
    // Basic validation - check format
    if (settings.geminiApiKey.length > 20) {
      results.geminiAI = true;
    } else {
      allPassed = false;
      errorMessage += 'Gemini API key invalid. ';
    }
  }

  // Test Website API
  if (settings.websiteApiUrl && settings.websiteApiToken) {
    results.websiteAPI = true;
  } else {
    allPassed = false;
    errorMessage += 'Website API configuration incomplete. ';
  }

  // Update test status in database
  await prisma.automationSettings.update({
    where: { id: settings.id },
    data: {
      lastTestedAt: new Date(),
      testStatus: allPassed ? 'success' : 'failed',
      testMessage: allPassed 
        ? 'All configurations validated successfully' 
        : errorMessage.trim(),
    },
  });

  return {
    success: allPassed,
    message: allPassed 
      ? 'All configurations validated successfully' 
      : errorMessage.trim(),
    details: results,
  };
}

/**
 * Get settings for automation services (decrypted, ready to use)
 */
export async function getAutomationConfig() {
  const settings = await getAutomationSettings();
  
  if (!settings || !settings.isConfigured) {
    throw new Error('Automation is not configured. Please configure settings in the admin panel.');
  }

  return {
    google: {
      sheetId: settings.googleSheetId!,
      sheetUrl: settings.googleSheetUrl,
      credentials: settings.googleCredentialsJson 
        ? JSON.parse(settings.googleCredentialsJson) 
        : null,
    },
    ai: {
      geminiApiKey: settings.geminiApiKey!,
      flashModel: settings.geminiFlashModel,
      proModel: settings.geminiProModel,
    },
    website: {
      apiUrl: settings.websiteApiUrl!,
      apiToken: settings.websiteApiToken!,
    },
    pinterest: {
      enabled: settings.enablePinterest,
      webhookUrl: settings.makeWebhookUrl,
    },
    indexing: {
      enabled: settings.enableIndexing,
    },
    behavior: {
      maxRetries: settings.maxRetries,
      retryDelayMs: settings.retryDelayMs,
    },
  };
}
