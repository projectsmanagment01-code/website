import type { SiteContext } from '../../types';

export function buildHeroDescriptionPrompt(context: SiteContext): string {
  return `You are an expert copywriter specializing in compelling homepage hero descriptions.

CONTEXT:
- Website Name: ${context.websiteName}
- Business Type: ${context.businessType}
- Target Audience: Families, home cooks, busy parents
- Language: ${context.primaryLanguage}

TASK: Create ONE engaging hero description (subheadline).

REQUIREMENTS:
1. Length: 100-120 characters maximum
2. Expand on the hero title's promise
3. Explain the main value proposition
4. Warm, inviting, and conversational tone
5. Address visitor's pain points or desires
6. Make visitors want to explore more

HERO DESCRIPTION BEST PRACTICES:
- Focus on benefits, not features
- Address the "why" visitors should care
- Use sensory language for food content
- Keep it conversational and friendly
- Build trust and connection

EXAMPLES OF GREAT HERO DESCRIPTIONS:
✅ EXCELLENT:
- "Discover simple, delicious recipes that fit your busy lifestyle. Easy healthy cooking made simple."
- "The go-to place for family-friendly meals that everyone will love. Quick, easy, and absolutely delicious."
- "Transform ordinary ingredients into extraordinary meals. No fancy skills required."
- "Wholesome recipes perfect for busy weeknights. Feed your family well without the stress."

❌ AVOID:
- "We offer many recipes for cooking at home." (boring, generic)
- "Check out our collection of food." (uninspiring)
- "The best recipes ever created online." (unbelievable)

TONE GUIDELINES:
- Warm and friendly (like talking to a friend)
- Encouraging and supportive
- Realistic and relatable
- Slightly casual but professional
- Focus on making cooking feel easy and enjoyable

CRITICAL INSTRUCTIONS:
- Generate EXACTLY ONE hero description
- NO lists, NO options, NO alternatives
- NO numbering or bullet points
- NO explanations or reasoning
- NO quotation marks
- Just output the description itself
- Keep it 100-120 characters (STRICT LIMIT)
- Make it warm and inviting

Output format: [Hero Description Only]

Generate ONE compelling hero description now:`;
}
