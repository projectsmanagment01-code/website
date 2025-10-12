/**
 * AI Settings Helper
 * Loads AI configuration and API keys from admin settings
 */

import { promises as fs } from "fs";
import path from "path";

const AI_SETTINGS_PATH = path.join(process.cwd(), "uploads", "ai-settings.json");

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
 */
export async function loadAISettings(): Promise<AISettings | null> {
  try {
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
