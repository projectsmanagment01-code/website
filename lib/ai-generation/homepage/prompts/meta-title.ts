import type { SiteContext } from '../../types';

export function buildMetaTitlePrompt(context: SiteContext): string {
  // Add randomization elements to ensure variety
  const currentTime = new Date().getTime();
  const randomSeed = Math.floor(Math.random() * 1000);
  
  return `You are an expert SEO copywriter creating unique, compelling meta titles for search engines.

🎯 YOUR MISSION: Create ONE fresh, unique meta title that stands out in search results.

CONTEXT:
- Website: ${context.websiteName}
- Niche: ${context.businessType}
- Domain: ${context.siteDomain}
- Language: ${context.primaryLanguage}
- Timestamp: ${currentTime}
- Variation Seed: ${randomSeed}

⚡ CRITICAL REQUIREMENTS:
1. EXACTLY 50-60 characters (STRICT - Google cuts off at 60)
2. Must be UNIQUE and CREATIVE (avoid generic patterns)
3. Front-load the most important keyword
4. Include brand name OR compelling benefit
5. Natural, conversational, NOT robotic

🎨 CREATIVE APPROACHES (Pick ONE style randomly):

**Style A - Benefit First:**
"[Benefit] | ${context.websiteName}"
Example: "Quick Weeknight Dinners | Tasty Kitchen"

**Style B - Action-Oriented:**
"[Action Verb] [Result] - ${context.websiteName}"
Example: "Master Home Cooking - Tasty Kitchen"

**Style C - Audience-Focused:**
"[Target] ${context.businessType} Recipes | [Benefit]"
Example: "Family Recipe Ideas | Easy & Delicious"

**Style D - Problem-Solution:**
"[Solution] for [Problem] | ${context.websiteName}"
Example: "Meals for Busy Parents | Tasty Kitchen"

**Style E - Unique Value:**
"${context.websiteName} - [Unique Value Proposition]"
Example: "Tasty Kitchen - 30-Min Recipes That Work"

🎯 VARIETY TRIGGERS (Use different approaches each time):
- Vary power words: "Easy" vs "Simple" vs "Quick" vs "Effortless"
- Vary benefits: "Family" vs "Weeknight" vs "Healthy" vs "Budget"
- Vary formats: Question, Statement, Promise, Invitation
- Vary brand placement: Start, Middle, or End
- Mix keywords creatively

✨ POWERFUL KEYWORDS TO MIX:
Primary: recipes, cooking, meals, food, kitchen
Benefits: easy, quick, healthy, delicious, simple, tasty
Audience: family, weeknight, busy, home, beginner
Results: perfect, amazing, better, favorite, tested

❌ FORBIDDEN PATTERNS (Never use these):
- "Welcome to [Site]" - Generic and wasted space
- "The Best [Thing] Website" - Overused and unbelievable
- "[Keyword] | [Keyword] | [Keyword]" - Keyword stuffing
- "Home - [Site Name]" - Boring and unhelpful
- Same exact format as examples above - BE CREATIVE!

🎲 RANDOMIZATION INSTRUCTION:
Since timestamp is ${currentTime} and seed is ${randomSeed}, use this to:
- Select a DIFFERENT style than you might default to
- Choose DIFFERENT power words than typical
- Try a FRESH angle or perspective
- Avoid repeating previous patterns

💡 EXAMPLES OF VARIETY (Each one different):
1. "Easy Family Recipes | ${context.websiteName}" (Benefit + Brand)
2. "Cooking Made Simple - Quick Meal Ideas" (Promise + Benefit)
3. "Weeknight Dinners That Actually Work" (Problem-Aware)
4. "${context.websiteName} - Tested Recipe Collection" (Brand + Trust)
5. "Home Cooking Recipes for Busy Families" (Audience-Specific)
6. "Delicious Meals, No Fancy Skills Needed" (Approachable)

🔢 CHARACTER COUNT CHECK:
- Count every character including spaces
- Aim for 50-60 (sweet spot: 55-58)
- If over 60, cut words NOT characters
- Shorter is better than truncated

🚀 CRITICAL OUTPUT INSTRUCTIONS:
- Generate EXACTLY ONE meta title
- Make it UNIQUE (different from generic patterns)
- NO lists, NO numbering, NO explanations
- NO quotation marks around output
- Just the pure title text
- Must be 50-60 characters
- Be creative and stand out!

Output format: [Your Unique Meta Title Here]

Generate ONE unique, compelling SEO meta title NOW:`;
}
