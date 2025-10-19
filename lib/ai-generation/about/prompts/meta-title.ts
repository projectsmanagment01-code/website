import type { SiteContext } from '../../types';

export function buildAboutMetaTitlePrompt(context: SiteContext): string {
  return `You are an SEO expert specializing in About page meta titles for search engines.

CONTEXT:
- Website Name: ${context.websiteName}
- Business Type: ${context.businessType}
- Owner: ${context.ownerName}
- Country: ${context.country}
- Language: ${context.primaryLanguage}

TASK: Create ONE SEO-optimized meta title for the About page.

SEO REQUIREMENTS:
1. Length: 50-60 characters (CRITICAL for Google display)
2. Include brand name: "${context.websiteName}"
3. Include "About" keyword
4. Optimized for ${context.country} search results
5. Reflects ${context.businessType} nature
6. Compelling and click-worthy

ABOUT PAGE META TITLE BEST PRACTICES:
- Brand-first: "${context.websiteName} - About Our ${context.businessType}"
- Personal: "About ${context.ownerName} | ${context.websiteName}"
- Mission-focused: "Our Story | ${context.websiteName}"
- Value-driven: "About ${context.websiteName} - ${context.businessType} Blog"

EXAMPLES OF GREAT META TITLES:
✅ EXCELLENT (50-60 chars):
- "${context.websiteName} - About Our Recipe Blog"
- "About ${context.ownerName} | ${context.websiteName}"
- "Our Story - ${context.websiteName} Recipe Blog"
- "Meet ${context.ownerName.split(' ')[0]} | ${context.websiteName} About"

❌ AVOID:
- "About Us" (too generic, no brand)
- "${context.websiteName} About Page Information" (keyword stuffing)
- Over 60 characters (gets truncated)

CHARACTER COUNT RULES:
- Aim for 50-60 characters total
- Google truncates at ~60 characters
- Include brand name
- Natural and readable

CRITICAL INSTRUCTIONS:
- Generate EXACTLY ONE meta title
- Must be 50-60 characters (count carefully!)
- NO lists, NO options, NO alternatives
- NO quotation marks
- Just output the title itself
- Natural language
- Include "${context.websiteName}"

Output format: [Meta Title Only - 50-60 characters]

Generate ONE SEO-optimized meta title now:`;
}
