/**
 * AI Settings Helper
 * Loads AI configuration and API keys from admin settings
 */

import { promises as fs } from "fs";
import path from "path";

// SECURE: AI settings with API keys stored in non-public directory
const AI_SETTINGS_PATH = path.join(process.cwd(), "data", "config", "ai-settings.json");
const OLD_AI_SETTINGS_PATH = path.join(process.cwd(), "uploads", "ai-settings.json");

export interface AISettings {
  enabled: boolean;
  provider: "openai" | "gemini";
  apiKeys: {
    openai: string;
    gemini: string;
  };
  model: string;
  temperature: number;
  maxTokens: number;
  features: {
    contentGeneration: boolean;
    recipeAssistance: boolean;
    seoOptimization: boolean;
    imageAnalysis: boolean;
    imageDescriptions: boolean;
    objectDetection: boolean;
  };
}

/**
 * Load AI settings from admin configuration
 * Returns null if settings file doesn't exist
 * Auto-migrates from old location if needed
 */
export async function loadAISettings(): Promise<AISettings | null> {
  try {
    // Try to migrate from old location
    try {
      await fs.access(OLD_AI_SETTINGS_PATH);
      try {
        await fs.access(AI_SETTINGS_PATH);
        // New file exists, no migration needed
      } catch {
        // Migrate from old to new location
        console.log("🔒 Migrating AI settings to secure location...");
        await fs.mkdir(path.dirname(AI_SETTINGS_PATH), { recursive: true });
        await fs.copyFile(OLD_AI_SETTINGS_PATH, AI_SETTINGS_PATH);
        console.log("✅ AI settings migrated successfully");
        console.warn("⚠️ Please delete old file manually:", OLD_AI_SETTINGS_PATH);
      }
    } catch {
      // Old file doesn't exist
    }
    
    const data = await fs.readFile(AI_SETTINGS_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log("AI settings file not found, will use environment variables");
    return null;
  }
}

/**
 * Get OpenAI API key from admin settings or environment
 * Priority: Admin Settings > Environment Variable
 */
export async function getOpenAIKey(): Promise<string> {
  try {
    const settings = await loadAISettings();
    
    if (settings?.apiKeys?.openai) {
      console.log("✅ Using OpenAI API key from admin settings");
      return settings.apiKeys.openai;
    }
  } catch (error) {
    console.log("Could not load admin AI settings:", error);
  }

  // Fallback to environment variable
  const envKey = process.env.OPENAI_API_KEY || '';
  if (envKey) {
    console.log("✅ Using OpenAI API key from environment variable");
  } else {
    console.log("❌ No OpenAI API key found in admin settings or environment");
  }
  
  return envKey;
}

/**
 * Get Gemini API key from admin settings or environment
 * Priority: Admin Settings > Environment Variable
 */
export async function getGeminiKey(): Promise<string> {
  try {
    const settings = await loadAISettings();
    
    if (settings?.apiKeys?.gemini) {
      console.log("✅ Using Gemini API key from admin settings");
      return settings.apiKeys.gemini;
    }
  } catch (error) {
    console.log("Could not load admin AI settings:", error);
  }

  // Fallback to environment variable
  const envKey = process.env.GEMINI_API_KEY || '';
  if (envKey) {
    console.log("✅ Using Gemini API key from environment variable");
  } else {
    console.log("❌ No Gemini API key found in admin settings or environment");
  }
  
  return envKey;
}

/**
 * Check if AI SEO features are enabled
 */
export async function isSEOEnabled(): Promise<boolean> {
  try {
    const settings = await loadAISettings();
    return settings?.enabled && settings?.features?.seoOptimization || false;
  } catch {
    return false;
  }
}

/**
 * Get AI provider preference (openai or gemini)
 */
export async function getAIProvider(): Promise<"openai" | "gemini"> {
  try {
    const settings = await loadAISettings();
    return settings?.provider || "openai";
  } catch {
    return "openai";
  }
}
