import { NextRequest, NextResponse } from 'next/server';
import { PrivacyPolicyAIService } from '@/lib/privacy-policy-ai';
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

    // Generate privacy policy using AI
    console.log('=== STARTING PRIVACY POLICY GENERATION ===');
    const rawPolicy = await PrivacyPolicyAIService.generatePrivacyPolicy(apiKey, aiSettings.provider, aiSettings.model);
    console.log('Raw policy length:', rawPolicy.length);
    
    const formattedPolicy = PrivacyPolicyAIService.formatPrivacyPolicy(rawPolicy);
    console.log('Formatted policy length:', formattedPolicy.length);
    console.log('=== PRIVACY POLICY GENERATION COMPLETE ===');

    return NextResponse.json({
      success: true,
      privacyPolicy: formattedPolicy,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Privacy Policy Generation Error:', error);
    
    let errorMessage = 'Failed to generate privacy policy';
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
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// GET method to check if AI generation is available
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Load AI settings directly instead of making a fetch call
    const aiSettings = await loadAISettings();
    
    if (!aiSettings) {
      return NextResponse.json({
        available: false,
        providers: { openai: false, gemini: false },
        reason: 'AI settings not configured'
      });
    }
    
    // Check if AI is enabled and has at least one API key
    const hasOpenAI = !!(aiSettings.apiKeys.openai && aiSettings.apiKeys.openai.trim());
    const hasGemini = !!(aiSettings.apiKeys.gemini && aiSettings.apiKeys.gemini.trim());
    const isAvailable = aiSettings.enabled && (hasOpenAI || hasGemini);

    return NextResponse.json({
      available: isAvailable,
      providers: {
        openai: hasOpenAI,
        gemini: hasGemini,
      },
      reason: isAvailable ? 'AI generation available' : 'AI not configured or disabled'
    });

  } catch (error) {
    console.error('AI availability check error:', error);
    return NextResponse.json({
      available: false,
      providers: { openai: false, gemini: false },
      reason: 'Error checking AI availability'
    }, { status: 500 });
  }
}