import type { SiteContext } from '../../types';

export function buildAboutHeroSubtitlePrompt(context: SiteContext): string {
  return `You are an expert copywriter specializing in engaging About page hero subtitles.

CONTEXT:
- Website Name: ${context.websiteName}
- Business Type: ${context.businessType}
- Owner: ${context.ownerName}
- Language: ${context.primaryLanguage}
- Country: ${context.country}

TASK: Create ONE compelling hero subtitle for the About page.

REQUIREMENTS:
1. Length: 15-20 words
2. Explains what visitors will discover
3. Personal and authentic tone
4. Written by ${context.ownerName}
5. Reflects ${context.businessType} passion

ABOUT HERO SUBTITLE BEST PRACTICES:
- Personal story: "Join me on a journey of discovering simple, delicious recipes that bring families together"
- Value proposition: "Learn how I turned my passion for ${context.businessType.toLowerCase()} into a community of home cooks"
- Mission statement: "Creating easy, family-friendly recipes that make cooking fun and stress-free"
- Discovery promise: "Discover the story behind ${context.websiteName} and my love for cooking"

EXAMPLES OF GREAT HERO SUBTITLES:
✅ EXCELLENT (15-20 words):
- "Discover how a passion for cooking became a journey to help families create delicious meals together"
- "Learn about my mission to make ${context.businessType.toLowerCase()} accessible, fun, and rewarding for everyone"
- "Join me as I share recipes, stories, and tips from my kitchen to yours"

❌ AVOID:
- "Welcome to our website where we post recipes" (boring, generic)
- Too long (keep it 15-20 words)
- Corporate language (keep it personal)

CRITICAL INSTRUCTIONS:
- Generate EXACTLY ONE subtitle
- Must be 15-20 words
- NO lists, NO options, NO alternatives
- NO quotation marks
- Just output the subtitle itself
- Personal, warm, and inviting tone
- Should complement the hero title

Output format: [Hero Subtitle Only - 15-20 words]

Generate ONE hero subtitle now:`;
}
