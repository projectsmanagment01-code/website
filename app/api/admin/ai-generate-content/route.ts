import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

// SECURE: AI settings stored in non-public directory  
const AI_SETTINGS_PATH = path.join(process.cwd(), "data", "config", "ai-settings.json");

async function loadSiteConfig() {
  try {
    // Try to load site config for additional context
    const configPath = path.join(process.cwd(), "config", "site.ts");
    const configContent = await fs.readFile(configPath, "utf-8");
    
    // Extract site name and description from config (basic parsing)
    const nameMatch = configContent.match(/name:\s*"([^"]+)"/);
    const descMatch = configContent.match(/description:\s*"([^"]+)"/);
    const domainMatch = configContent.match(/domain:\s*"([^"]+)"/);
    
    return {
      siteName: nameMatch?.[1] || "",
      siteDescription: descMatch?.[1] || "",
      siteDomain: domainMatch?.[1] || "",
    };
  } catch (error) {
    console.log("Could not load site config:", error);
    return null;
  }
}

async function loadCategoriesInfo() {
  try {
    // Try to load categories for content context
    const categoriesPath = path.join(process.cwd(), "data", "categories.ts");
    const categoriesContent = await fs.readFile(categoriesPath, "utf-8");
    
    // Extract category names for context
    const categoryMatches = categoriesContent.match(/title:\s*"([^"]+)"/g);
    const categories = categoryMatches?.map(match => match.replace(/title:\s*"([^"]+)"/, '$1')) || [];
    
    return categories.slice(0, 5); // Just top 5 categories for context
  } catch (error) {
    console.log("Could not load categories:", error);
    return [];
  }
}

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

interface GenerateContentRequest {
  prompt: string;
  field: string;
  maxLength?: number;
  contentType: "title" | "description" | "brand" | "contact" | "legal";
  websiteContext?: {
    currentBrandName: string;
    currentDescription: string;
    currentDomain: string;
    currentUrl: string;
    currentYear: number;
    existingContent: string;
  };
}

async function loadAISettings(): Promise<AISettings | null> {
  try {
    const data = await fs.readFile(AI_SETTINGS_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

async function generateWithOpenAI(apiKey: string, model: string, prompt: string, maxLength?: number, contentType?: string) {
  // Determine system prompt based on content type
  let systemPrompt = "You are an expert SEO copywriter and content strategist. Generate high-quality, SEO-optimized content that is engaging, professional, and conversion-focused. Always follow the specified requirements exactly.";
  
  if (contentType === "legal") {
    systemPrompt = "You are an expert legal content writer specializing in website disclaimers and legal notices for food and recipe websites. Generate comprehensive, legally sound disclaimers that protect businesses while being clear and professional. Focus on recipe-specific risks like food safety, cooking results, nutritional information accuracy, and health considerations. Always follow the specified requirements exactly and use proper legal language appropriate for consumer-facing websites.";
  }

  const requestBody: any = {
    model: model,
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
  };

  // Use appropriate token parameter based on model
  if (model.includes('gpt-4o') || model.includes('gpt-5') || model.includes('o1')) {
    requestBody.max_completion_tokens = maxLength ? Math.min(maxLength * 2, 500) : 300;
  } else {
    requestBody.max_tokens = maxLength ? Math.min(maxLength * 2, 500) : 300;
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
  return data.choices[0]?.message?.content || "";
}

async function generateWithGemini(apiKey: string, model: string, prompt: string, maxLength?: number, contentType?: string) {
  console.log("Gemini API call with model:", model);
  console.log("Prompt:", prompt);
  
  // Enhanced system context for legal content
  let systemContext = "You are an expert content writer. Generate high-quality, professional content following the requirements exactly.";
  if (contentType === "legal") {
    systemContext = "You are an expert legal content writer for food and recipe websites. Generate comprehensive, legally sound disclaimers covering recipe accuracy, food safety, nutritional information, health considerations, and liability limitations. Use professional legal language appropriate for consumer websites.";
  }
  
  const enhancedPrompt = `${systemContext}\n\n${prompt}`;
  
  // Use highest possible token limit for disclaimer content
  let maxOutputTokens = 4096;
  if (contentType === "legal") {
    maxOutputTokens = 32768;
  } else if (typeof maxLength === "number" && maxLength > 0) {
    maxOutputTokens = Math.max(maxLength, 4096);
  }

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
                text: enhancedPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens,
          candidateCount: 1,
          stopSequences: [],
        },
      }),
    }
  );

  console.log("Gemini response status:", response.status);
  
  if (!response.ok) {
    const error = await response.json();
    console.error("Gemini error response:", error);
    throw new Error(error.error?.message || "Gemini API request failed");
  }

  const data = await response.json();
  console.log("Gemini response data:", JSON.stringify(data, null, 2));
  
  // Check if we have candidates and content
  if (!data.candidates || data.candidates.length === 0) {
    console.error("No candidates in Gemini response");
    throw new Error("Gemini API returned no candidates");
  }
  
  const candidate = data.candidates[0];
  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
    console.error("No content parts in Gemini response. Finish reason:", candidate.finishReason);
    
    // If it's MAX_TOKENS, we need to increase the limit
    if (candidate.finishReason === "MAX_TOKENS") {
      throw new Error("Content generation hit token limit. Try with a shorter prompt or increase token limit.");
    }
    
    throw new Error(`Gemini API returned no content. Finish reason: ${candidate.finishReason}`);
  }
  
  const generatedText = candidate.content.parts[0]?.text || "";
  console.log("Extracted text:", generatedText);
  
  return generatedText;
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

    const body: GenerateContentRequest = await request.json();
    const { prompt, field, maxLength, contentType, websiteContext } = body;

    console.log("Received website context:", websiteContext);

    // Load additional site context
    const siteConfig = await loadSiteConfig();
    const categories = await loadCategoriesInfo();
    
    console.log("Site config context:", siteConfig);
    console.log("Categories context:", categories);

    // Enhance prompt with comprehensive context
    let enhancedPrompt = prompt;
    if (websiteContext) {
      const contextInfo = [
        `Brand: ${websiteContext.currentBrandName}`,
        `Domain: ${websiteContext.currentDomain}`,
        siteConfig?.siteDescription ? `About: ${siteConfig.siteDescription}` : "",
        categories.length > 0 ? `Recipe Categories: ${categories.join(", ")}` : "",
      ].filter(Boolean).join(". ");
      
      enhancedPrompt = `${prompt} Context: ${contextInfo}`;
      console.log("Enhanced prompt with context:", enhancedPrompt);
    }

    // Load AI settings
    const aiSettings = await loadAISettings();
    if (!aiSettings || !aiSettings.enabled) {
      return NextResponse.json(
        { success: false, error: "AI content generation is not enabled" },
        { status: 400 }
      );
    }

    if (!aiSettings.features.contentGeneration) {
      return NextResponse.json(
        { success: false, error: "AI content generation feature is disabled" },
        { status: 400 }
      );
    }

    const apiKey = aiSettings.apiKeys[aiSettings.provider];
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: `${aiSettings.provider} API key not configured` },
        { status: 400 }
      );
    }

    let generatedContent: string;

    try {
      if (aiSettings.provider === "openai") {
        generatedContent = await generateWithOpenAI(apiKey, aiSettings.model, enhancedPrompt, maxLength, contentType);
      } else if (aiSettings.provider === "gemini") {
        generatedContent = await generateWithGemini(apiKey, aiSettings.model, enhancedPrompt, maxLength, contentType);
      } else {
        return NextResponse.json(
          { success: false, error: "Unsupported AI provider" },
          { status: 400 }
        );
      }

      // Clean up the generated content
      generatedContent = generatedContent.trim();
      
      // Remove common unwanted phrases and explanations
      const unwantedPhrases = [
        "Here are some",
        "Here are a few",
        "Choose the one",
        "Option 1",
        "Option 2", 
        "Option 3",
        "**Option",
        "Here's a",
        "Here is a",
        "I'll generate",
        "I'll create",
        "Let me create",
        "Let me generate"
      ];
      
      for (const phrase of unwantedPhrases) {
        if (generatedContent.toLowerCase().includes(phrase.toLowerCase())) {
          // If content starts with unwanted phrase, try to extract just the actual content
          const lines = generatedContent.split('\n');
          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine && 
                !unwantedPhrases.some(p => cleanLine.toLowerCase().includes(p.toLowerCase())) &&
                !cleanLine.startsWith('*') &&
                !cleanLine.includes(':') &&
                cleanLine.length > 3) {
              generatedContent = cleanLine;
              break;
            }
          }
        }
      }
      
      // Remove quotes if they wrap the entire content
      if ((generatedContent.startsWith('"') && generatedContent.endsWith('"')) ||
          (generatedContent.startsWith("'") && generatedContent.endsWith("'"))) {
        generatedContent = generatedContent.slice(1, -1);
      }
      
      // Remove markdown formatting
      generatedContent = generatedContent.replace(/\*\*/g, '').replace(/\*/g, '');
      
      // Remove colons at the end
      if (generatedContent.endsWith(':')) {
        generatedContent = generatedContent.slice(0, -1);
      }
      
      // Final trim
      generatedContent = generatedContent.trim();

      // Enforce max length if specified
      if (maxLength && generatedContent.length > maxLength) {
        generatedContent = generatedContent.substring(0, maxLength).trim();
        // Try to end at a word boundary
        const lastSpace = generatedContent.lastIndexOf(' ');
        if (lastSpace > maxLength * 0.8) {
          generatedContent = generatedContent.substring(0, lastSpace);
        }
      }

      return NextResponse.json({
        success: true,
        content: generatedContent,
        field,
        contentType,
        provider: aiSettings.provider,
        model: aiSettings.model,
        characterCount: generatedContent.length,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error(`${aiSettings.provider} content generation failed:`, error);
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : "Content generation failed",
          provider: aiSettings.provider 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}