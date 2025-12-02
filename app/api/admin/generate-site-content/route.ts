import { NextRequest, NextResponse } from "next/server";
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { verifyAdminToken } from "@/lib/auth";
import { loadAISettings, getOpenAIKey, getGeminiKey, getOllamaKey } from "@/lib/ai-settings-helper";
import { 
  generateSiteTitle, 
  generateSiteDescription, 
  generateLogoText, 
  generateLogoTagline 
} from "@/lib/ai-generation/site-settings";
import type { SiteContext } from "@/lib/ai-generation/types";

interface GenerateRequest {
  field: 'siteTitle' | 'siteDescription' | 'logoText' | 'logoTagline';
  context: SiteContext;
  provider?: 'openai' | 'gemini';
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const adminCheck = await verifyAdminToken(request);
    if (!adminCheck.success) {
      return errorResponseNoCache('Unauthorized', 401);
    }

    const body: GenerateRequest = await request.json();
    const { field, context } = body;

    // Validate context
    if (!context.websiteName || !context.businessType) {
      return errorResponseNoCache('Missing required context fields (websiteName, businessType)', 400);
    }

    // Load AI settings directly from file
    const aiSettings = await loadAISettings();
    
    // Check if AI is enabled
    if (!aiSettings?.enabled) {
      return errorResponseNoCache('AI generation is disabled. Please enable it in AI Settings.', 403);
    }

    // Use provider from AI settings
    const provider = aiSettings.provider || 'gemini';

    // Get API key based on provider using helper functions
    const apiKey = provider === 'openai' 
      ? await getOpenAIKey()
      : provider === 'ollama'
      ? await getOllamaKey()
      : await getGeminiKey();

    if (!apiKey) {
      const providerNames = {
        openai: 'OpenAI',
        gemini: 'Google Gemini',
        ollama: 'Ollama Cloud'
      };
      return jsonResponseNoCache(
        { error: `${providerNames[provider as keyof typeof providerNames]} API key not configured. Please add it in AI Settings.` },
        { status: 400 }
      );
    }

    // Generate content based on field
    let result;
    switch (field) {
      case 'siteTitle':
        result = await generateSiteTitle(context, apiKey, provider);
        break;
      case 'siteDescription':
        result = await generateSiteDescription(context, apiKey, provider);
        break;
      case 'logoText':
        result = await generateLogoText(context, apiKey, provider);
        break;
      case 'logoTagline':
        result = await generateLogoTagline(context, apiKey, provider);
        break;
      default:
        return jsonResponseNoCache(
          { error: `Unknown field: ${field}` }, 400);
    }

    if (!result.success) {
      return jsonResponseNoCache(
        { error: result.error || "Generation failed" }, 500);
    }

    return jsonResponseNoCache({
      success: true,
      content: result.content,
      field,
      provider
    });

  } catch (error) {
    console.error("AI generation error:", error);
    return errorResponseNoCache("Failed to generate content", 500);
  }
}
