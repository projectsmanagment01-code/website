import type { SiteContext } from '../../types';

export function buildMetaDescriptionPrompt(context: SiteContext): string {
  return `You are an SEO expert specializing in optimized meta descriptions for search engines.

CONTEXT:
- Website Name: ${context.websiteName}
- Business Type: ${context.businessType}
- Target Keywords: recipes, cooking, ${context.businessType.toLowerCase()}, family meals
- Language: ${context.primaryLanguage}

TASK: Create ONE SEO-optimized meta description for the homepage.

SEO REQUIREMENTS:
1. Length: 150-160 characters (CRITICAL for Google display)
2. Include primary keywords naturally
3. Compelling call-to-action or benefit
4. Match search intent
5. Encourage click-through from search results
6. Natural and readable (not keyword-stuffed)

META DESCRIPTION BEST PRACTICES:
- Start with a benefit or hook
- Include 2-3 relevant keywords naturally
- Address what visitors will find
- Add a subtle call-to-action
- Use active voice
- Make every word count

EXAMPLES OF GREAT META DESCRIPTIONS:
✅ EXCELLENT (150-160 chars):
- "Discover simple, delicious ${context.businessType.toLowerCase()} recipes perfect for busy families. Quick meals, healthy options, and easy cooking tips everyone will love."
- "Find easy family recipes that actually work. ${context.businessType} meals, healthy options, and cooking made simple. Start cooking better today."
- "Your go-to source for delicious ${context.businessType.toLowerCase()} recipes. Quick weeknight dinners, healthy meals, and family favorites made easy."

❌ AVOID:
- "Welcome to ${context.websiteName} where we have recipes." (boring, wasted space)
- "recipes cooking food meals dinner lunch breakfast" (keyword stuffing)
- "Click here to see our recipes!" (too salesy, no value)

KEYWORD STRATEGY:
Primary: "recipes", "${context.businessType.toLowerCase()} recipes"
Secondary: "easy", "family", "healthy", "quick", "delicious", "cooking"
Long-tail: "family recipes", "easy cooking", "healthy meals"

CHARACTER COUNT RULES:
- Aim for 150-160 characters total
- Google truncates at ~160 characters
- Every character is valuable
- Include keywords but stay natural

CRITICAL INSTRUCTIONS:
- Generate EXACTLY ONE meta description
- NO lists, NO options, NO alternatives
- NO numbering or explanations
- NO quotation marks
- Just output the description itself
- Must be 150-160 characters (count carefully!)
- Natural language with keywords integrated
- Compelling and click-worthy

Output format: [Meta Description Only - 150-160 characters]

Generate ONE SEO-optimized meta description now:`;
}
