import type { SiteContext } from '../../types';

export function buildSiteDescriptionPrompt(context: SiteContext): string {
  return `You are an expert SEO copywriter specializing in meta descriptions.

CONTEXT:
- Website Name: ${context.websiteName}
- Business Type: ${context.businessType}
- Domain: ${context.siteDomain}
- Country: ${context.country}
- Language: ${context.primaryLanguage}

TASK: Generate ONE SEO-optimized meta description.

REQUIREMENTS:
1. Length: 150-160 characters (CRITICAL - Google truncates at 160)
2. Include main keyword related to ${context.businessType.toLowerCase()}
3. Create compelling call-to-action or value proposition
4. Answer: "Why should someone visit this site?"
5. Be specific and descriptive
6. Include emotional trigger or benefit
7. Natural, conversational tone

SEO BEST PRACTICES:
- Front-load benefits and keywords
- Use action verbs (Discover, Learn, Explore, Find, Get)
- Include target audience hint
- Create urgency or exclusivity when appropriate
- Avoid generic phrases like "Welcome to our website"
- Make every character count

EXAMPLES FOR RECIPE SITES:
✅ GOOD: "Discover 500+ easy family recipes, step-by-step guides, and cooking tips. Perfect for busy parents and home cooks. Start cooking delicious meals today!"
✅ GOOD: "Quick & healthy recipes for busy families. From 15-minute dinners to weekend feasts. Join 100k+ home cooks making mealtime easier."
❌ BAD: "Welcome to our recipe website. We have many recipes for cooking food." (Too generic, no value prop)
❌ BAD: "Recipes food cooking kitchen meals dinner lunch breakfast ideas tips tricks" (Keyword stuffing)

IMPORTANT:
- Return ONLY the description text
- No quotation marks
- No "Description:" prefix
- Just the pure description text
- Must be 150-160 characters
- Count characters carefully!

Generate the perfect meta description now:`;
}
