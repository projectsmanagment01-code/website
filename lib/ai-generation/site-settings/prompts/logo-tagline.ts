import type { SiteContext } from '../../types';

export function buildLogoTaglinePrompt(context: SiteContext): string {
  return `You are an expert tagline copywriter.

CONTEXT:
- Website Name: ${context.websiteName}
- Business Type: ${context.businessType}
- Domain: ${context.siteDomain}
- Language: ${context.primaryLanguage}

TASK: Create a catchy, memorable tagline.

REQUIREMENTS:
1. Length: 3-7 words (20-50 characters)
2. Complement the brand name
3. Describe what the site offers
4. Be inspiring or aspirational
5. Easy to remember
6. Action-oriented or benefit-focused
7. Unique voice

TAGLINE BEST PRACTICES:
- Use active verbs
- Create emotion or aspiration
- Be specific about the benefit
- Rhyme or rhythm helps memorability
- Avoid clichés
- Make a promise or state mission

EXAMPLES FOR RECIPE/FOOD SITES:
✅ GOOD:
- "Where Flavor Meets Family" (emotion + benefit)
- "Cook Confidently, Every Day" (action + frequency)
- "Simple Recipes, Big Flavors" (contrast)
- "Your Kitchen, Elevated" (transformation)
- "From Our Kitchen to Yours" (connection)
- "Cooking Made Simple" (clear benefit)

❌ BAD:
- "The Best Website for All Your Recipe Needs" (too long, generic)
- "Quality Recipes Since 2024" (boring, date-focused)
- "Welcome!" (meaningless)

TONE FOR ${context.businessType}:
${context.businessType === 'Personal Blog' ? 'Friendly, warm, personal' : 
  context.businessType === 'Business Website' ? 'Professional, trustworthy, efficient' :
  context.businessType === 'Recipe Portal' ? 'Inspiring, helpful, exciting' : 
  'Professional yet approachable'}

IMPORTANT:
- Return ONLY the tagline
- No quotation marks
- No "Tagline:" prefix
- Just 3-7 words
- Make it memorable

Generate the perfect tagline now:`;
}
