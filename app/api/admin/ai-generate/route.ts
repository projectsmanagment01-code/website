import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

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
    console.log("Could not load AI settings:", error);
    return null;
  }
}

async function generateWithOpenAI(apiKey: string, model: string, prompt: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are an expert content writer specializing in recipe blogs and food content. Generate engaging, professional content that resonates with food enthusiasts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function generateWithGemini(apiKey: string, model: string, prompt: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an expert content writer specializing in recipe blogs and food content. Generate engaging, professional content that resonates with food enthusiasts.\n\n${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Load AI settings
    const aiSettings = await loadAISettings();
    if (!aiSettings || !aiSettings.enabled) {
      return NextResponse.json(
        { error: "AI content generation is not enabled" },
        { status: 400 }
      );
    }

    if (!aiSettings.features.contentGeneration) {
      return NextResponse.json(
        { error: "AI content generation feature is disabled" },
        { status: 400 }
      );
    }

    const apiKey = aiSettings.apiKeys[aiSettings.provider];
    if (!apiKey) {
      return NextResponse.json(
        { error: `${aiSettings.provider} API key not configured` },
        { status: 400 }
      );
    }

    let generatedContent = "";

    try {
      if (aiSettings.provider === "openai") {
        generatedContent = await generateWithOpenAI(apiKey, aiSettings.model, prompt);
      } else if (aiSettings.provider === "gemini") {
        generatedContent = await generateWithGemini(apiKey, aiSettings.model, prompt);
      } else {
        throw new Error("Unsupported AI provider");
      }

      return NextResponse.json({
        content: generatedContent.trim(),
        provider: aiSettings.provider,
        model: aiSettings.model,
      });

    } catch (error) {
      console.error(`${aiSettings.provider} content generation failed:`, error);
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : "Content generation failed",
          provider: aiSettings.provider 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}