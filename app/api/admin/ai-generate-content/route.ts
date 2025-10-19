import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

const AI_SETTINGS_PATH = path.join(process.cwd(), "data", "config", "ai-settings.json");

interface AISettings {
  enabled: boolean;
  provider: "openai" | "gemini";
  model: string;
  temperature: number;
  maxTokens: number;
  features: {
    contentGeneration: boolean;
  };
  apiKeys?: {
    openai: string;
    gemini: string;
  };
}

async function loadAISettings(): Promise<AISettings> {
  try {
    const data = await fs.readFile(AI_SETTINGS_PATH, "utf-8");
    const settings = JSON.parse(data);
    
    // Merge with environment variables for API keys (more secure)
    return {
      ...settings,
      apiKeys: {
        openai: process.env.OPENAI_API_KEY || settings.apiKeys?.openai || "",
        gemini: process.env.GEMINI_API_KEY || settings.apiKeys?.gemini || "",
      }
    };
  } catch {
    return {
      enabled: false,
      provider: "openai",
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 1000,
      features: {
        contentGeneration: true,
      },
      apiKeys: {
        openai: process.env.OPENAI_API_KEY || "",
        gemini: process.env.GEMINI_API_KEY || "",
      }
    };
  }
}

async function generateWithOpenAI(prompt: string, settings: AISettings): Promise<string> {
  const apiKey = settings.apiKeys?.openai || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional content writer specializing in food blogs and recipe websites. Generate concise, engaging content that matches the brand voice.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: settings.temperature || 0.7,
      max_tokens: settings.maxTokens || 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API request failed");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || "";
}

async function generateWithGemini(prompt: string, settings: AISettings): Promise<string> {
  const apiKey = settings.apiKeys?.gemini || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const model = settings.model || "gemini-2.0-flash-exp";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a professional content writer specializing in food blogs and recipe websites. Generate concise, engaging content that matches the brand voice.\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: settings.temperature || 0.7,
          maxOutputTokens: settings.maxTokens || 1000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Gemini API request failed");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, field, maxLength, contentType, websiteContext } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Load AI settings
    const settings = await loadAISettings();

    if (!settings.enabled) {
      return NextResponse.json(
        { error: "AI content generation is disabled. Enable it in AI Plugin settings." },
        { status: 403 }
      );
    }

    if (!settings.features.contentGeneration) {
      return NextResponse.json(
        { error: "Content generation feature is disabled in AI settings." },
        { status: 403 }
      );
    }

    // Generate content using the configured provider
    let generatedContent: string;

    try {
      if (settings.provider === "gemini") {
        generatedContent = await generateWithGemini(prompt, settings);
      } else {
        generatedContent = await generateWithOpenAI(prompt, settings);
      }

      // Post-process: trim to max length if specified
      if (maxLength && generatedContent.length > maxLength) {
        generatedContent = generatedContent.substring(0, maxLength).trim();
        // Try to end at a word boundary
        const lastSpace = generatedContent.lastIndexOf(" ");
        if (lastSpace > maxLength * 0.8) {
          generatedContent = generatedContent.substring(0, lastSpace);
        }
      }

      return NextResponse.json({
        success: true,
        content: generatedContent,
        provider: settings.provider,
        model: settings.model,
        field,
      });
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      return NextResponse.json(
        {
          error: aiError instanceof Error ? aiError.message : "AI generation failed",
          details: "Check your AI API keys and settings",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
