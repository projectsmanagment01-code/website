import type { SiteContext } from '../../types';

export function buildHeroTitlePrompt(context: SiteContext): string {
  return `You are an expert copywriter specializing in compelling homepage hero titles.

CONTEXT:
- Website Name: ${context.websiteName}
- Business Type: ${context.businessType}
- Target Audience: Families, home cooks, food enthusiasts
- Language: ${context.primaryLanguage}
- Domain: ${context.siteDomain}

TASK: Create ONE powerful hero title for the homepage.

REQUIREMENTS:
1. Length: 40-80 characters maximum
2. Emotional and inspiring
3. Food-focused and appetizing
4. Family-friendly and welcoming
5. Action-oriented or benefit-focused
6. Easy to read at a glance

HERO TITLE BEST PRACTICES:
- Lead with benefits: "Delicious Recipes Your Family Will Love"
- Create desire: "Transform Dinner Time Into Magic"
- Show ease: "Simple Recipes, Amazing Results"
- Inspire action: "Start Cooking Better Meals Today"

EXAMPLES OF GREAT HERO TITLES:
✅ EXCELLENT:
- "Plant-Based Recipes Made Simple"
- "Family Dinners That Bring Everyone Together"
- "Cook Like a Pro at Home"
- "Delicious Meals in 30 Minutes or Less"
- "Wholesome Recipes for Busy Families"

❌ AVOID:
- "Welcome to Our Recipe Website" (boring, generic)
- "We Have Lots of Recipes Here" (weak, uninspiring)
- "The Best Recipe Collection Online" (unbelievable claim)

CRITICAL INSTRUCTIONS:
- Generate EXACTLY ONE hero title
- NO lists, NO options, NO alternatives
- NO numbering or bullet points
- NO explanations or reasoning
- NO quotation marks
- Just output the title itself
- Keep it under 80 characters
- Make it emotional and compelling

Output format: [Hero Title Only]

Generate ONE powerful hero title now:`;
}
