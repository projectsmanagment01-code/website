import { NextRequest, NextResponse } from 'next/server';
import { TermsAIService } from '@/lib/terms-ai';
import { verifyAdminToken } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

// SECURE: AI settings stored in non-public directory
const AI_SETTINGS_PATH = path.join(process.cwd(), "data", "config", "ai-settings.json");

interface AISettings {
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

async function loadAISettings(): Promise<AISettings | null> {
  try {
    const data = await fs.readFile(AI_SETTINGS_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading AI settings:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Load AI settings
    const aiSettings = await loadAISettings();
    if (!aiSettings) {
      return NextResponse.json(
        { error: 'AI settings not configured. Please configure AI settings first.' },
        { status: 400 }
      );
    }

    if (!aiSettings.enabled) {
      return NextResponse.json(
        { error: 'AI features are disabled. Please enable AI in settings.' },
        { status: 400 }
      );
    }

    // Get API key for the current provider
    const apiKey = aiSettings.apiKeys[aiSettings.provider];
    if (!apiKey) {
      return NextResponse.json(
        { error: `${aiSettings.provider} API key not configured` },
        { status: 400 }
      );
    }

    // Generate terms using AI
    const rawTerms = await TermsAIService.generateTerms(apiKey, aiSettings.provider, aiSettings.model);
    const formattedTerms = TermsAIService.formatTerms(rawTerms);

    return NextResponse.json({
      success: true,
      terms: formattedTerms,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Terms Generation Error:', error);
    
    let errorMessage = 'Failed to generate terms and conditions';
    if (error instanceof Error) {
      if (error.message.includes('API error')) {
        errorMessage = 'AI service error: ' + error.message;
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to AI service';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}