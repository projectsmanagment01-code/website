import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { loadAISettings, getOpenAIKey, getGeminiKey } from "@/lib/ai-settings-helper";
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();
    const { field, context, provider = 'gemini' } = body;

    // Validate context
    if (!context.websiteName || !context.businessType) {
      return NextResponse.json(
        { error: "Missing required context fields (websiteName, businessType)" },
        { status: 400 }
      );
    }

    // Load AI settings directly from file
    const aiSettings = await loadAISettings();
    
    // Check if AI is enabled
    if (!aiSettings?.enabled) {
      return NextResponse.json(
        { error: "AI generation is disabled. Please enable it in AI Settings." },
        { status: 403 }
      );
    }

    // Get API key based on provider using helper functions
    const apiKey = provider === 'openai' 
      ? await getOpenAIKey()
      : await getGeminiKey();

    if (!apiKey) {
      return NextResponse.json(
        { error: `${provider === 'openai' ? 'OpenAI' : 'Gemini'} API key not configured. Please add it in AI Settings.` },
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
        return NextResponse.json(
          { error: `Unknown field: ${field}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Generation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: result.content,
      field,
      provider
    });

  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate content",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
