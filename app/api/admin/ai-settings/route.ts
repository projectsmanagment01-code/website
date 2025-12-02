import { NextRequest, NextResponse } from "next/server";
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { verifyAdminToken } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

// SECURE: AI settings with API keys stored in non-public directory
const AI_SETTINGS_PATH = path.join(process.cwd(), "data", "config", "ai-settings.json");

interface AISettings {
  enabled: boolean;
  provider: "openai" | "gemini" | "ollama";
  apiKeys: {
    openai: string;
    gemini: string;
    ollama: string;
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
  lastTested: string | null;
  connectionStatus: "connected" | "disconnected" | "testing";
  lastUpdated: string;
  updatedBy: string;
}

// Get API keys from environment variables - never stored in files
function getAPIKeys() {
  return {
    openai: process.env.OPENAI_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || '',
    ollama: process.env.OLLAMA_API_KEY || '',
  };
}

// Check if API keys are available
function hasAPIKeys() {
  const keys = getAPIKeys();
  return {
    openai: !!keys.openai,
    gemini: !!keys.gemini,
    ollama: !!keys.ollama,
  };
}

const defaultSettings: AISettings = {
  enabled: false,
  provider: "openai",
  apiKeys: {
    openai: "",
    gemini: "",
    ollama: "",
  },
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 1000,
  features: {
    contentGeneration: true,
    recipeAssistance: true,
    seoOptimization: false,
    imageAnalysis: true,
    imageDescriptions: true,
    objectDetection: false,
  },
  lastTested: null,
  connectionStatus: "disconnected",
  lastUpdated: new Date().toISOString(),
  updatedBy: "admin",
};

async function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function loadAISettings(): Promise<AISettings> {
  try {
    await ensureDirectoryExists(AI_SETTINGS_PATH);
    const data = await fs.readFile(AI_SETTINGS_PATH, "utf-8");
    return { ...defaultSettings, ...JSON.parse(data) };
  } catch (error) {
    // File doesn't exist or is invalid, return defaults
    return defaultSettings;
  }
}

async function saveAISettings(settings: AISettings): Promise<void> {
  await ensureDirectoryExists(AI_SETTINGS_PATH);
  await fs.writeFile(AI_SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return errorResponseNoCache('Unauthorized', 401);
    }

    const settings = await loadAISettings();
    
    // Return settings with masked API keys for security
    const safeSettings = {
      ...settings,
      apiKeys: {
        openai: settings.apiKeys.openai ? "***" + settings.apiKeys.openai.slice(-4) : "",
        gemini: settings.apiKeys.gemini ? "***" + settings.apiKeys.gemini.slice(-4) : "",
        ollama: settings.apiKeys.ollama ? "***" + settings.apiKeys.ollama.slice(-4) : "",
      },
    };

    return jsonResponseNoCache(safeSettings);
  } catch (error) {
    console.error("Error loading AI settings:", error);
    return errorResponseNoCache('Failed to load AI settings', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return errorResponseNoCache('Unauthorized', 401);
    }

    const body = await request.json();
    
    // Load existing settings to preserve masked API keys
    const existingSettings = await loadAISettings();
    
    const updatedSettings: AISettings = {
      ...body,
      // Handle API keys - if they start with ***, keep the existing ones
      apiKeys: {
        openai: body.apiKeys.openai.startsWith("***") ? existingSettings.apiKeys.openai : body.apiKeys.openai,
        gemini: body.apiKeys.gemini.startsWith("***") ? existingSettings.apiKeys.gemini : body.apiKeys.gemini,
        ollama: body.apiKeys.ollama.startsWith("***") ? existingSettings.apiKeys.ollama : body.apiKeys.ollama,
      },
      lastUpdated: new Date().toISOString(),
      updatedBy: authResult.payload?.email || "admin",
    };

    await saveAISettings(updatedSettings);

    return jsonResponseNoCache({ 
      success: true, 
      message: "AI settings saved successfully"
    });
  } catch (error) {
    console.error("Error saving AI settings:", error);
    return errorResponseNoCache('Failed to save AI settings', 500);
  }
}