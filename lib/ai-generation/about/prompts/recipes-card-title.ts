import type { SiteContext } from '../../types';

export function buildRecipesCardTitlePrompt(context: SiteContext): string {
  return `You are an expert copywriter creating engaging section titles for About pages.

CONTEXT:
- Website Name: ${context.websiteName}
- Business Type: ${context.businessType}
- Language: ${context.primaryLanguage}

TASK: Create ONE section title asking what visitors will find on the website.

REQUIREMENTS:
1. Length: 5-8 words
2. Question format
3. Engaging and inviting
4. Reflects ${context.businessType} focus
5. Natural ${context.primaryLanguage} language

SECTION TITLE BEST PRACTICES:
- Direct question: "What Will You Find on ${context.websiteName}?"
- Value-focused: "What Makes ${context.websiteName} Special?"
- Benefit-driven: "What Can You Discover Here?"
- Content-focused: "What Types of Recipes Do We Share?"

EXAMPLES OF GREAT SECTION TITLES:
✅ EXCELLENT (5-8 words):
- "What Will You Find Here?"
- "What Makes Our Recipes Special?"
- "What Can You Discover on ${context.websiteName}?"
- "What Types of Content Do We Share?"
- "What Will You Learn From Us?"

❌ AVOID:
- "Information About Our Content" (not a question, boring)
- Very long questions (keep it 5-8 words)
- Generic statements (must be a question)

CRITICAL INSTRUCTIONS:
- Generate EXACTLY ONE section title
- Must be 5-8 words
- MUST be in question format (ending with ?)
- NO lists, NO options, NO alternatives
- NO quotation marks
- Just output the title itself

Output format: [Section Title Only - 5-8 words, question format]

Generate ONE section title now:`;
}
