/**
 * Ollama AI Integration (Cloud & Local)
 * Supports both local Ollama server and Ollama Cloud hosted models
 * Cloud API Documentation: https://docs.ollama.com/cloud
 * API Documentation: https://github.com/ollama/ollama/blob/main/docs/api.md
 */

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface OllamaChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
  };
}

export interface OllamaResponse {
  model: string;
  message?: {
    role: string;
    content: string;
  };
  response?: string;
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}

export interface OllamaListResponse {
  models: Array<{
    name: string;
    model: string;
    modified_at: string;
    size: number;
  }>;
}

/**
 * Cloud models available on Ollama Cloud (https://ollama.com)
 * Requires API key from https://ollama.com/settings/keys
 */
export const OLLAMA_CLOUD_MODELS = [
  { id: 'gpt-oss:120b-cloud', name: 'GPT-OSS 120B (Cloud)', description: 'OpenAI GPT-OSS safeguard model' },
  { id: 'gpt-oss:20b-cloud', name: 'GPT-OSS 20B (Cloud)', description: 'OpenAI GPT-OSS safeguard model (smaller)' },
  { id: 'deepseek-v3.1:671b-cloud', name: 'DeepSeek V3.1 671B (Cloud)', description: 'DeepSeek reasoning model' },
  { id: 'qwen3-coder:480b-cloud', name: 'Qwen3-Coder 480B (Cloud)', description: 'Alibaba coding model' },
  { id: 'minimax-m2:cloud', name: 'MiniMax M2 (Cloud)', description: 'Coding and agentic workflows' },
  { id: 'glm-4.6:cloud', name: 'GLM-4.6 (Cloud)', description: 'Coding model' },
];

/**
 * Generate content using Ollama's chat completion endpoint
 * Supports both local and cloud endpoints
 * @param endpoint - Ollama server endpoint (local: http://localhost:11434, cloud: https://ollama.com)
 * @param apiKey - API key for cloud access (optional for local)
 * @param model - Model name (e.g., "llama3.2" for local, "gpt-oss:120b-cloud" for cloud)
 * @param prompt - User prompt
 * @param temperature - Sampling temperature (0-1)
 * @param maxTokens - Maximum tokens to generate
 */
export async function generateWithOllama(
  endpoint: string,
  apiKey: string | undefined,
  model: string,
  prompt: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  const url = endpoint.endsWith('/') ? `${endpoint}api/chat` : `${endpoint}/api/chat`;
  
  const requestBody: OllamaChatRequest = {
    model: model || "llama3.2",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: false,
    options: {
      temperature: temperature,
      num_predict: maxTokens,
    },
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add Authorization header for cloud endpoint
  if (apiKey && endpoint.includes('ollama.com')) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  console.log(`[OLLAMA] Calling ${url} with model ${model}${apiKey ? ' (authenticated)' : ''}`);
  
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error(`[OLLAMA] API error (${response.status}):`, errorText);
    throw new Error(`Ollama API error: ${response.statusText} - ${errorText}`);
  }

  const data: OllamaResponse = await response.json();
  
  console.log(`[OLLAMA] Response received, done: ${data.done}`);
  
  // Extract text from response
  if (data.message?.content) {
    return data.message.content;
  } else if (data.response) {
    return data.response;
  }
  
  console.error('[OLLAMA] Could not extract content from response:', data);
  throw new Error('Could not extract content from Ollama API response');
}

/**
 * Test Ollama connection and list available models
 * @param endpoint - Ollama server endpoint
 * @param apiKey - API key for cloud access (optional for local)
 */
export async function testOllamaConnection(endpoint: string, apiKey?: string): Promise<{ success: boolean; models?: string[]; error?: string }> {
  try {
    const url = endpoint.endsWith('/') ? `${endpoint}api/tags` : `${endpoint}/api/tags`;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization header for cloud endpoint
    if (apiKey && endpoint.includes('ollama.com')) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    console.log(`[OLLAMA] Testing connection to ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data: OllamaListResponse = await response.json();
    const modelNames = data.models.map((m) => m.name);
    
    console.log(`[OLLAMA] Found ${modelNames.length} models:`, modelNames);
    
    return {
      success: true,
      models: modelNames,
    };
  } catch (error: any) {
    console.error('[OLLAMA] Connection test failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Simple chat test with Ollama
 * @param endpoint - Ollama server endpoint
 * @param apiKey - API key for cloud access (optional for local)
 * @param model - Model name to test
 */
export async function testOllamaChat(endpoint: string, apiKey: string | undefined, model: string): Promise<string> {
  return generateWithOllama(
    endpoint,
    apiKey,
    model,
    "Say 'Ollama is working!' in a friendly way.",
    0.7,
    50
  );
}
