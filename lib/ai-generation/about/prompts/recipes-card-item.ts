import type { SiteContext } from '../../types';

export interface CardItemContext extends SiteContext {
  cardTitle: string;
}

export function buildRecipesCardItemPrompt(context: CardItemContext): string {
  return `You are an expert copywriter creating compelling bullet points for About page content cards.

CONTEXT:
- Website Name: ${context.websiteName}
- Business Type: ${context.businessType}
- Card Title: "${context.cardTitle}"
- Language: ${context.primaryLanguage}

TASK: Create ONE bullet point that answers "${context.cardTitle}".

REQUIREMENTS:
1. Length: 8-12 words
2. Directly related to "${context.cardTitle}"
3. Specific benefit or feature
4. Engaging and valuable
5. ${context.businessType} focused

BULLET POINT BEST PRACTICES:
- Feature-focused: "Time-tested ${context.businessType.toLowerCase()} recipes that work every time"
- Benefit-driven: "Practical cooking tips from years of kitchen experience"
- Story-based: "Personal stories behind our favorite family dishes"
- Value-added: "Step-by-step guidance for cooks of all skill levels"

EXAMPLES OF GREAT BULLET POINTS:
✅ EXCELLENT (8-12 words):
- "Easy-to-follow ${context.businessType.toLowerCase()} recipes perfect for busy weeknights"
- "Tested and approved by real families in real kitchens"
- "Personal cooking tips and tricks from ${context.websiteName}"
- "Seasonal recipes using fresh, accessible ingredients"
- "Kitchen wisdom passed down through generations"

❌ AVOID:
- "We have lots of recipes" (too vague)
- Very long explanations (keep it 8-12 words)
- Generic statements (be specific)

CRITICAL INSTRUCTIONS:
- Generate EXACTLY ONE bullet point
- Must be 8-12 words
- Must directly answer/support "${context.cardTitle}"
- NO lists, NO options, NO alternatives
- NO quotation marks
- NO bullet points or dashes
- Just output the text itself
- Make it specific and valuable

Output format: [Bullet Point Only - 8-12 words]

Generate ONE bullet point now:`;
}
