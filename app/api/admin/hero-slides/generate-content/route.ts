import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const AI_SETTINGS_PATH = path.join(process.cwd(), "data", "config", "ai-settings.json");

interface AISettings {
  enabled: boolean;
  provider: string;
  apiKeys: {
    openai?: string;
    gemini?: string;
  };
  model: string;
  temperature: number;
  maxTokens: number;
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

async function generateWithOpenAI(apiKey: string, model: string, prompt: string, temperature: number) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: temperature || 0.7,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateWithGemini(apiKey: string, model: string, prompt: string, temperature: number) {
  // Normalize model name for Gemini API
  const geminiModel = model || "gemini-pro";
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: temperature || 0.7,
          maxOutputTokens: 1024,
          candidateCount: 1,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Gemini API Error:", errorData);
    throw new Error(`Gemini API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  console.log("=== FULL Gemini Response ===");
  console.log(JSON.stringify(data, null, 2));
  console.log("=== END Response ===");
  
  // Check if response was cut off
  if (data.candidates?.[0]?.finishReason === "MAX_TOKENS") {
    console.warn("⚠️ Gemini response was truncated (MAX_TOKENS)");
  }
  
  // Try to extract text from various possible structures
  try {
    // Standard Gemini format
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    
    // Alternative format 1: text directly in parts
    if (data.candidates?.[0]?.parts?.[0]?.text) {
      return data.candidates[0].parts[0].text;
    }
    
    // Alternative format 2: text in candidate
    if (data.candidates?.[0]?.text) {
      return data.candidates[0].text;
    }
    
    // Alternative format 3: output field
    if (data.candidates?.[0]?.output) {
      return data.candidates[0].output;
    }
    
    // Alternative format 4: direct text field
    if (data.text) {
      return data.text;
    }
    
    // Alternative format 5: content field with text
    if (data.candidates?.[0]?.content?.text) {
      return data.candidates[0].content.text;
    }
  } catch (e) {
    console.error("Error extracting text:", e);
  }
  
  // If we get here, the structure is unexpected
  console.error("❌ Could not find text in Gemini response");
  console.error("Response had finishReason:", data.candidates?.[0]?.finishReason);
  throw new Error("Could not extract text from Gemini API response. The response may be empty or have an unexpected structure.");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, context } = body; // type: "title" or "description", context: optional additional context

    console.log("Generate Content Request:", { type, context });

    // Load AI settings
    const aiSettings = await loadAISettings();
    if (!aiSettings) {
      console.error("AI settings not found");
      return NextResponse.json(
        { error: "AI settings not configured" },
        { status: 400 }
      );
    }

    console.log("AI Settings:", { 
      enabled: aiSettings.enabled, 
      provider: aiSettings.provider,
      model: aiSettings.model 
    });

    if (!aiSettings.enabled) {
      return NextResponse.json(
        { error: "AI features are disabled" },
        { status: 400 }
      );
    }

    // Get API key based on provider (case-insensitive)
    const provider = aiSettings.provider.toLowerCase();
    const apiKey = provider === "openai" 
      ? aiSettings.apiKeys.openai 
      : provider === "gemini" 
      ? aiSettings.apiKeys.gemini 
      : null;
      
    if (!apiKey) {
      return NextResponse.json(
        { error: `${aiSettings.provider} API key not configured` },
        { status: 400 }
      );
    }

    // Create prompts based on type
    let prompt = "";
    
    if (type === "title") {
      prompt = `Generate a compelling, short hero banner title (max 60 characters) for a recipe website. 
The title should be:
- Engaging and inviting
- Food-focused
- Action-oriented
- Short and punchy

${context ? `Additional context: ${context}` : ''}

Return ONLY the title text, nothing else.`;
    } else if (type === "description") {
      prompt = `Generate a compelling hero banner description (max 120 characters) for a recipe website.
The description should be:
- Inviting and appetizing
- Complement the main title
- Highlight the value proposition
- Encourage users to explore

${context ? `Additional context: ${context}` : ''}

Return ONLY the description text, nothing else.`;
    } else if (type === "both") {
      prompt = `Generate a compelling hero banner for a recipe website. Return a JSON object with:
{
  "title": "Compelling title (max 60 characters)",
  "description": "Engaging description (max 120 characters)"
}

The content should be:
- Engaging and inviting
- Food-focused
- Action-oriented
- Professional

${context ? `Additional context: ${context}` : ''}

Return ONLY the JSON object, nothing else.`;
    }

    // Generate content
    let result;
    if (provider === "openai") {
      result = await generateWithOpenAI(apiKey, aiSettings.model, prompt, aiSettings.temperature);
    } else if (provider === "gemini") {
      result = await generateWithGemini(apiKey, aiSettings.model, prompt, aiSettings.temperature);
    } else {
      return NextResponse.json(
        { error: `Unsupported AI provider: ${aiSettings.provider}` },
        { status: 400 }
      );
    }

    // Clean up the result
    result = result.trim();
    
    // If type is "both", parse JSON
    if (type === "both") {
      try {
        // Remove markdown code blocks if present
        result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        const parsed = JSON.parse(result);
        return NextResponse.json({
          success: true,
          title: parsed.title,
          description: parsed.description,
        });
      } catch (e) {
        console.error("Failed to parse JSON response:", result);
        return NextResponse.json(
          { error: "Failed to parse AI response" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      content: result,
    });
  } catch (error: any) {
    console.error("Error generating hero content:", error);
    return NextResponse.json(
      { error: "Failed to generate content", details: error.message },
      { status: 500 }
    );
  }
}
