import type { SiteContext } from '../../types';

export function buildAboutHeroTitlePrompt(context: SiteContext): string {
  return `You are an expert copywriter specializing in compelling About page hero titles.

CONTEXT:
- Website Name: ${context.websiteName}
- Business Type: ${context.businessType}
- Owner: ${context.ownerName}
- Language: ${context.primaryLanguage}
- Country: ${context.country}

TASK: Create ONE powerful hero title for the About page.

REQUIREMENTS:
1. Length: 3-4 words maximum
2. Warm and inviting
3. Personal and authentic
4. Appropriate for ${context.primaryLanguage} speakers
5. Reflects the ${context.businessType} nature

ABOUT PAGE HERO TITLE BEST PRACTICES:
- Personal introduction: "Meet ${context.ownerName.split(' ')[0]}"
- Story-focused: "Our Story"
- Mission-oriented: "Why We Cook"
- Passion-driven: "Food With Heart"
- Community-focused: "Join Our Journey"

EXAMPLES OF GREAT ABOUT HERO TITLES:
✅ EXCELLENT:
- "Our Story"
- "Meet the Chef"
- "Welcome Home"
- "Why We Cook"
- "Food With Love"
- "Our Kitchen Journey"

❌ AVOID:
- "About Us Page" (boring, generic)
- "Information About Our Company" (too corporate)
- Long phrases (keep it 3-4 words)

CRITICAL INSTRUCTIONS:
- Generate EXACTLY ONE hero title
- Must be 3-4 words ONLY
- NO lists, NO options, NO alternatives
- NO quotation marks
- Just output the title itself
- Make it personal and warm

Output format: [Hero Title Only - 3-4 words]

Generate ONE hero title now:`;
}
