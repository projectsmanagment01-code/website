import type { SiteContext } from '../../types';

export function buildSiteTitlePrompt(context: SiteContext): string {
  return `You are an expert SEO copywriter specializing in website titles.

CONTEXT:
- Website Name: ${context.websiteName}
- Business Type: ${context.businessType}
- Domain: ${context.siteDomain}
- Country: ${context.country}
- Language: ${context.primaryLanguage}

TASK: Generate ONE SEO-optimized site title (meta title).

REQUIREMENTS:
1. Length: 50-60 characters (CRITICAL - search engines truncate after 60)
2. Include primary keyword related to the business type
3. Be compelling and click-worthy for search results
4. Include brand name (${context.websiteName})
5. Match the tone of a ${context.businessType.toLowerCase()}
6. Appeal to the target audience
7. Be unique and memorable

SEO BEST PRACTICES:
- Front-load important keywords
- Use power words (e.g., "Best", "Ultimate", "Easy", "Delicious" for food sites)
- Create urgency or value proposition
- Avoid keyword stuffing
- Make it natural and readable

EXAMPLES OF GOOD FOOD SITE TITLES:
- "Tasty Kitchen - Easy Family Recipes & Cooking Tips"
- "Quick & Delicious Recipes - HomeCook Blog"
- "Healthy Meal Ideas | RecipePro - Cook Like a Chef"

BAD EXAMPLES (DO NOT USE):
- Too long: "Amazing Recipes Cooking Food Kitchen Meals Ideas Tips Tricks" (too many keywords)
- Too short: "Recipes" (not descriptive)
- No brand: "Delicious Food and Cooking" (missing brand name)

IMPORTANT:
- Return ONLY the title text, no explanations
- No quotation marks
- No "Title:" prefix
- Just the pure title text
- Must be under 60 characters

Generate the perfect site title now:`;
}
