/**
 * Input validators using Zod
 * Note: Install zod: npm install zod
 */

// Placeholder for Zod validators
// Will be properly implemented when zod is installed

export function validateRecipeData(data: any): boolean {
  // Basic validation
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Invalid recipe title');
  }
  
  if (!data.category || typeof data.category !== 'string') {
    throw new Error('Invalid recipe category');
  }
  
  if (data.rowNumber && typeof data.rowNumber !== 'number') {
    throw new Error('Invalid row number');
  }
  
  return true;
}

export function validateImagePrompts(prompts: any): boolean {
  const required = [
    'image_1_feature',
    'image_2_ingredients',
    'image_3_cooking',
    'image_4_final_presentation',
  ];
  
  for (const key of required) {
    if (!prompts[key] || typeof prompts[key] !== 'string') {
      throw new Error(`Missing or invalid prompt: ${key}`);
    }
  }
  
  return true;
}

export function validateRecipeArticle(article: any): boolean {
  const required = ['title', 'slug', 'description', 'ingredients', 'instructions'];
  
  for (const key of required) {
    if (!article[key]) {
      throw new Error(`Missing required field in article: ${key}`);
    }
  }
  
  return true;
}

export function validateImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateConfig(config: any): boolean {
  const required = [
    'googleSheetId',
    'websiteApiToken',
    'nakedDomain',
    'geminiApiKey',
  ];
  
  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required config: ${key}`);
    }
  }
  
  return true;
}
