import { NextRequest, NextResponse } from "next/server";
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { verifyAdminToken } from "@/lib/auth";
import { testOllamaChat } from "@/lib/ollama";

interface TestRequest {
  provider: "openai" | "gemini" | "ollama";
  apiKey: string;
  model: string;
}

// Get API keys from environment variables
function getAPIKey(provider: "openai" | "gemini" | "ollama"): string {
  if (provider === "openai") {
    return process.env.OPENAI_API_KEY || '';
  } else if (provider === "gemini") {
    return process.env.GEMINI_API_KEY || '';
  } else if (provider === "ollama") {
    return process.env.OLLAMA_API_KEY || '';
  }
  return '';
}

async function testOpenAI(apiKey: string, model: string) {
  // Create request body with conditional token parameter
  const requestBody: any = {
    model: model,
    messages: [
      {
        role: "user",
        content: "Say 'Hello, AI connection test successful!' in a friendly way."
      }
    ],
    temperature: 0.7,
  };

  // Use max_completion_tokens for newer models, max_tokens for older ones
  if (model.includes('gpt-4o') || model.includes('gpt-5') || model.includes('o1')) {
    requestBody.max_completion_tokens = 50;
  } else {
    requestBody.max_tokens = 50;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API request failed");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "Test successful";
}

async function testGemini(apiKey: string, model: string) {
  // Use the correct Gemini API endpoint for v1 (not v1beta)
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
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
                text: "Say 'Hello, AI connection test successful!' in a friendly way."
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `Gemini API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Test successful";
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return errorResponseNoCache('Unauthorized', 401);
    }

    const body: TestRequest = await request.json();
    const { provider, apiKey, model } = body;

    if (!apiKey) {
      return jsonResponseNoCache({ success: false, error: `${provider} API key is required` },
        { status: 400 });
    }

    let testResponse: string;

    try {
      if (provider === "openai") {
        testResponse = await testOpenAI(apiKey, model);
      } else if (provider === "gemini") {
        testResponse = await testGemini(apiKey, model);
      } else if (provider === "ollama") {
        const ollamaEndpoint = "https://ollama.com"; // Ollama Cloud endpoint
        testResponse = await testOllamaChat(ollamaEndpoint, apiKey, model);
      } else {
        return jsonResponseNoCache({ success: false, error: "Unsupported AI provider" },
          { status: 400 });
      }

      return jsonResponseNoCache({
        success: true,
        testResponse: testResponse.trim(),
        provider,
        model,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`${provider} API test failed:`, error);
      return jsonResponseNoCache({ 
          success: false, 
          error: error instanceof Error ? error.message : "API test failed",
          provider,
          model 
        },
        { status: 400 });
    }
  } catch (error) {
    console.error("Error testing AI connection:", error);
    return jsonResponseNoCache({ success: false, error: "Internal server error" },
      { status: 500 });
  }
}