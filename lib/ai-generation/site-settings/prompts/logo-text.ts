import type { SiteContext } from '../../types';

export function buildLogoTextPrompt(context: SiteContext): string {
  return `You are a creative brand naming expert who generates EXACTLY ONE brand name.

CONTEXT:
- Current Website Name: ${context.websiteName}
- Business Type: ${context.businessType}
- Domain: ${context.siteDomain}
- Language: ${context.primaryLanguage}

TASK: Create ONE memorable, brandable logo text (brand name).

REQUIREMENTS:
1. Length: 2-4 words maximum (15-30 characters total)
2. Easy to pronounce and remember
3. Related to ${context.businessType.toLowerCase()}
4. Professional and trustworthy
5. Unique and distinctive
6. Works well visually as a logo

BRAND NAMING EXAMPLES:
- "Tasty Kitchen" (descriptive + place)
- "Recipe Bloom" (category + growth)
- "Cook Haven" (action + safe place)
- "Kitchen Stories" (place + narrative)

CURRENT NAME CONTEXT:
The website is currently called "${context.websiteName}". 
${context.websiteName ? `You can refine this name OR create something similar but better.` : `Create a brand new name.`}

CRITICAL INSTRUCTIONS:
- Generate EXACTLY ONE brand name
- NO lists, NO options, NO alternatives
- NO numbering (1., 2., 3., etc.)
- NO explanations or reasoning
- NO quotation marks
- Just output the brand name itself
- Example of correct output: Tasty Kitchen
- Example of WRONG output: 1. Tasty Kitchen 2. Recipe Hub (multiple names)

Output format: [Brand Name Only]

Generate ONE perfect brand name now:`;
}
