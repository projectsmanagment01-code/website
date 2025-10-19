import type { SiteContext } from '../../types';

export function buildAboutMetaDescriptionPrompt(context: SiteContext): string {
  return `You are an SEO expert specializing in About page meta descriptions for search engines.

CONTEXT:
- Website Name: ${context.websiteName}
- Business Type: ${context.businessType}
- Owner: ${context.ownerName}
- Country: ${context.country}
- Language: ${context.primaryLanguage}
- Target Keywords: about, ${context.businessType.toLowerCase()}, ${context.ownerName}

TASK: Create ONE SEO-optimized meta description for the About page.

SEO REQUIREMENTS:
1. Length: 150-160 characters (CRITICAL for Google display)
2. Introduce ${context.ownerName}
3. Explain what "${context.websiteName}" offers
4. Optimized for ${context.country} searchers
5. Compelling and encourages clicks
6. Natural language (not keyword-stuffed)

ABOUT META DESCRIPTION BEST PRACTICES:
- Personal introduction: "Meet ${context.ownerName}, creator of ${context.websiteName}. Discover..."
- Story-focused: "Learn about ${context.ownerName}'s journey creating ${context.businessType.toLowerCase()} recipes that..."
- Mission-driven: "Discover the story behind ${context.websiteName} and how we help families..."
- Value proposition: "Meet the team behind ${context.websiteName}. We create ${context.businessType.toLowerCase()} recipes for..."

EXAMPLES OF GREAT META DESCRIPTIONS:
✅ EXCELLENT (150-160 chars):
- "Meet ${context.ownerName}, founder of ${context.websiteName}. Discover our passion for creating easy, family-friendly ${context.businessType.toLowerCase()} recipes that bring joy to your kitchen."
- "Learn about ${context.ownerName} and the story behind ${context.websiteName}. We're dedicated to sharing delicious ${context.businessType.toLowerCase()} recipes for home cooks."
- "Discover the mission behind ${context.websiteName}. Meet ${context.ownerName} and learn how we help families create amazing meals with simple ${context.businessType.toLowerCase()} recipes."

❌ AVOID:
- "About page for ${context.websiteName}" (boring, no value)
- "Meet us, we have recipes, cooking, food, meals" (keyword stuffing)
- Over 160 characters (gets truncated)

KEYWORD STRATEGY:
Primary: "about ${context.websiteName}", "${context.ownerName}"
Secondary: "${context.businessType.toLowerCase()}", "recipes", "cooking", "story"
Natural integration: Work keywords into compelling narrative

CHARACTER COUNT RULES:
- Aim for 150-160 characters total
- Google truncates at ~160 characters
- Every character is valuable
- Include owner name and brand

CRITICAL INSTRUCTIONS:
- Generate EXACTLY ONE meta description
- Must be 150-160 characters (count carefully!)
- NO lists, NO options, NO alternatives
- NO quotation marks
- Just output the description itself
- Natural, compelling language
- Include ${context.ownerName} and ${context.websiteName}

Output format: [Meta Description Only - 150-160 characters]

Generate ONE SEO-optimized meta description now:`;
}
