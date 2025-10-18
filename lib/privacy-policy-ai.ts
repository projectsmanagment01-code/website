// Privacy Policy AI Generation Service
import { getSiteInfo as getDbSiteInfo } from '@/lib/site-config-service';

interface PrivacyPolicyData {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  company: string;
  website: string;
  email: string;
  sections: Array<{
    heading: string;
    content: string | object;
  }>;
}

interface SiteInfo {
  name: string;
  domain: string;
  url: string;
  email: string;
  description: string;
  socialLinks: any[];
  contactInfo: any;
}

export class PrivacyPolicyAIService {
  
  static async getSiteInfo(): Promise<SiteInfo> {
    try {
      // Get site information from DATABASE (new system - prevents deployment overwrites)
      console.log('🔍 Fetching site info from database...');
      const dbSiteInfo = await getDbSiteInfo();
      
      const siteInfo: SiteInfo = {
        name: dbSiteInfo.siteTitle || "Recipe Website",
        domain: dbSiteInfo.siteDomain || "example.com",
        url: dbSiteInfo.siteUrl || `https://${dbSiteInfo.siteDomain || "example.com"}`,
        email: dbSiteInfo.siteEmail || "contact@example.com",
        description: dbSiteInfo.siteDescription || "A recipe sharing website",
        socialLinks: [],
        contactInfo: {}
      };

      console.log('✅ Loaded site info from DATABASE:', {
        name: siteInfo.name,
        domain: siteInfo.domain,
        email: siteInfo.email
      });
      
      return siteInfo;

    } catch (error) {
      console.error('❌ Error getting site info from database, using defaults:', error);
      // Return safe defaults only if database fails
      return {
        name: "Recipe Website",
        domain: "example.com", 
        url: "https://example.com",
        email: "contact@example.com",
        description: "A recipe sharing website",
        socialLinks: [],
        contactInfo: {}
      };
    }
  }

  static async generatePrivacyPolicy(apiKey: string, provider: 'openai' | 'gemini', model?: string): Promise<string> {
    const siteInfo = await this.getSiteInfo();
    
    const prompt = this.buildPrompt(siteInfo);
    
    if (provider === 'openai') {
      return this.generateWithOpenAI(prompt, apiKey, model);
    } else {
      return this.generateWithGemini(prompt, apiKey, model);
    }
  }

  private static buildPrompt(siteInfo: SiteInfo): string {
    const currentDate = new Date().toISOString().split('T')[0];

    return `YOU ARE GENERATING A PRIVACY POLICY - NOT A DISCLAIMER OR ANY OTHER DOCUMENT.
THIS MUST BE A PRIVACY POLICY ABOUT DATA COLLECTION, COOKIES, AND USER RIGHTS.

Generate a COMPLETE, FULLY-FORMATTED HTML PRIVACY POLICY.

CRITICAL REQUIREMENTS:
1. Return COMPLETE HTML with ALL sections - DO NOT truncate or abbreviate ANYTHING
2. Each section must have 4-6 detailed paragraphs minimum (write complete paragraphs, not bullet points only)
3. Use proper HTML tags with Tailwind CSS classes
4. Include ALL 13 mandatory sections listed below
5. Return ONLY HTML - no markdown, no code blocks, no explanations
6. Start with opening tags and end with closing tags
7. THIS IS A PRIVACY POLICY - DO NOT generate disclaimer, terms, or any other content

HTML STRUCTURE REQUIRED:
<div class="privacy-policy-content">
  <h1 class="text-3xl font-bold text-black mb-6">Privacy Policy</h1>
  
  <div class="text-sm text-gray-600 mb-6">
    <p><strong>Effective Date:</strong> ${currentDate}</p>
    <p><strong>Last Updated:</strong> ${currentDate}</p>
    <p><strong>Company:</strong> ${siteInfo.name}</p>
    <p><strong>Website:</strong> <a href="${siteInfo.url}" class="text-blue-600 hover:underline">${siteInfo.url}</a></p>
    <p><strong>Contact:</strong> <a href="mailto:${siteInfo.email}" class="text-blue-600 hover:underline">${siteInfo.email}</a></p>
  </div>

  <!-- Continue with ALL sections below -->
</div>

MANDATORY SECTIONS (Generate ALL with complete content):

1. SCOPE (h2 heading + 4-5 paragraphs)
   - Overview of policy coverage
   - GDPR and CCPA compliance statement
   - Recipe website specific data practices
   - User agreement terms
   - Policy updates notification

2. INFORMATION WE COLLECT (h2 heading + detailed list)
   - Personal Information (name, email, profile)
   - Account Data (username, password, preferences)
   - Recipe Interactions (saves, comments, ratings, reviews)
   - Technical Data (IP, browser, device info)
   - Cookie Data
   - Newsletter Subscription Data
   - Payment Information (if applicable)

3. HOW WE COLLECT DATA (h2 heading + 4-5 paragraphs)
   - Registration and account creation
   - Website forms and submissions
   - Cookie and tracking technologies
   - User interactions and engagement
   - Third-party integrations
   - Automated collection methods

4. HOW WE USE DATA (h2 heading + detailed list)
   - Personalized recipe recommendations
   - User authentication and account management
   - Communication and newsletters
   - Analytics and performance improvement
   - Marketing and promotional content
   - Legal compliance and security

5. COOKIES AND TRACKING TECHNOLOGIES (h2 heading + 5-6 paragraphs)
   - Essential cookies explanation
   - Analytics cookies (Google Analytics, etc.)
   - Advertising cookies
   - Social media cookies
   - Cookie management and opt-out
   - Third-party cookie policies

6. SHARING AND DISCLOSURE (h2 heading + 4-5 paragraphs)
   - Service providers and processors
   - Analytics partners
   - Advertising networks
   - Legal requirements and law enforcement
   - Business transfers
   - User consent-based sharing

7. DATA RETENTION (h2 heading + 4-5 paragraphs)
   - Account data retention periods
   - Content and recipe data storage
   - Legal retention requirements
   - Data deletion procedures
   - Backup and archive policies

8. DATA SECURITY (h2 heading + 5-6 paragraphs)
   - Encryption and secure protocols
   - Access controls and authentication
   - Regular security audits
   - Incident response procedures
   - Third-party security measures
   - User responsibility

9. INTERNATIONAL DATA TRANSFERS (h2 heading + 4-5 paragraphs)
   - Cross-border transfer mechanisms
   - Privacy Shield or Standard Contractual Clauses
   - EU and international user protections
   - Data localization practices

10. YOUR RIGHTS (h2 heading + TWO h3 subsections)
    
    A. GDPR RIGHTS (h3 + detailed list with descriptions)
       - Right to access your data
       - Right to rectification
       - Right to erasure ("right to be forgotten")
       - Right to restrict processing
       - Right to data portability
       - Right to object
       - Rights related to automated decision-making
       - How to exercise these rights
    
    B. CCPA/CPRA RIGHTS (h3 + detailed list with descriptions)
       - Right to know what data is collected
       - Right to delete personal information
       - Right to opt-out of sale/sharing
       - Right to non-discrimination
       - Right to correct inaccurate data
       - Right to limit use of sensitive data
       - How to submit requests

11. CHILDREN'S PRIVACY (h2 heading + 4-5 paragraphs)
    - COPPA compliance (under 13)
    - Parental consent requirements
    - Data collection from minors
    - Account deletion procedures for minors
    - Parent/guardian rights

12. CHANGES TO THIS POLICY (h2 heading + 3-4 paragraphs)
    - Notification methods
    - Material changes definition
    - Effective date of updates
    - User acceptance and continued use

13. CONTACT US (h2 heading + contact details)
    - Company name: ${siteInfo.name}
    - Email: ${siteInfo.email}
    - Website: ${siteInfo.url}
    - Mailing address (if available)
    - Data Protection Officer contact (if applicable)
    - Response timeframe

STYLING REQUIREMENTS:
- All h1 tags: class="text-3xl font-bold text-black mb-6"
- All h2 tags: class="text-2xl font-bold text-black mb-4 mt-8"
- All h3 tags: class="text-xl font-bold text-black mb-4 mt-6"
- All p tags: class="text-black mb-4"
- All ul tags: class="list-disc pl-6 text-black mb-4"
- All ol tags: class="list-decimal pl-6 text-black mb-4"
- All li tags: class="mb-2"
- All links: class="text-blue-600 hover:underline"

CRITICAL INSTRUCTIONS:
- Generate COMPLETE content - DO NOT use placeholders like "[Add more details]"
- Every section must be FULLY written with comprehensive information
- Total content should be 8000-12000 words
- Use recipe website specific examples throughout
- Include internal links where appropriate: ${siteInfo.url}/about, ${siteInfo.url}/contact, ${siteInfo.url}/terms
- Return ONLY the HTML - no markdown code blocks, no explanations

START YOUR RESPONSE WITH: <div class="privacy-policy-content">
END YOUR RESPONSE WITH: </div>`;
  }

  private static async generateWithOpenAI(prompt: string, apiKey: string, model: string = 'gpt-4o-mini'): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional HTML PRIVACY POLICY generator - NOT a disclaimer generator. You ONLY generate PRIVACY POLICIES about data collection, cookies, and user rights. Generate COMPLETE, FULLY-FORMATTED HTML privacy policy content with ALL sections fully expanded. Write complete detailed paragraphs (4-6 per section), not just bullet points. DO NOT truncate, abbreviate, or use placeholders. Return ONLY HTML with proper Tailwind CSS classes. Total output should be 8000-12000 words of comprehensive privacy policy content. Start with <div class="privacy-policy-content"> and end with </div>. DO NOT generate disclaimers, terms of service, or any other document type.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 16000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error Details:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Check if the response has the expected structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI API');
    }
    
    let content = data.choices[0].message.content;
    
    console.log('OpenAI Response Length:', content.length);
    console.log('OpenAI Response Preview:', content.substring(0, 200) + '...');
    
    // Clean up the response to ensure it's pure JSON
    content = this.cleanupAIResponse(content);
    
    console.log('Cleaned Response Length:', content.length);
    
    return content;
  }

  private static async generateWithGemini(prompt: string, apiKey: string, model: string = 'gemini-2.0-flash-exp'): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 16000,
        },
        systemInstruction: {
          parts: [{
            text: 'You are a professional HTML PRIVACY POLICY generator - NOT a disclaimer generator. You ONLY generate PRIVACY POLICIES about data collection, cookies, GDPR, CCPA, and user privacy rights. Generate COMPLETE, FULLY-FORMATTED HTML privacy policy content with ALL sections fully expanded. Write complete detailed paragraphs (4-6 per section), not just bullet points. DO NOT truncate, abbreviate, or use placeholders. Return ONLY HTML with proper Tailwind CSS classes. Total output should be 8000-12000 words of comprehensive privacy policy content. Start with <div class="privacy-policy-content"> and end with </div>. NEVER generate disclaimers, terms of service, or any other document type - ONLY privacy policies.'
          }]
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Details:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Check if the response has the expected structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      console.error('Unexpected Gemini response structure:', data);
      throw new Error('Invalid response structure from Gemini API');
    }
    
    let content = data.candidates[0].content.parts[0].text;
    
    console.log('Gemini Response Length:', content.length);
    console.log('Gemini Response Preview:', content.substring(0, 200) + '...');
    
    // Clean up the response to ensure it's pure JSON
    content = this.cleanupAIResponse(content);
    
    console.log('Cleaned Response Length:', content.length);
    
    return content;
  }

  private static cleanupAIResponse(content: string): string {
    // Remove any markdown code blocks
    content = content.replace(/```json\s*/gi, '');
    content = content.replace(/```\s*/gi, '');
    
    // Remove any explanatory text before the JSON
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      content = content.substring(jsonStart, jsonEnd + 1);
    }
    
    // Remove any trailing text after the JSON
    content = content.trim();
    
    return content;
  }

  static formatPrivacyPolicy(rawContent: string): string {
    console.log('=== FORMAT PRIVACY POLICY START ===');
    console.log('Format Input Length:', rawContent.length);
    console.log('Format Input Preview:', rawContent.substring(0, 300) + '...');
    console.log('Format Input End Preview:', '...' + rawContent.substring(Math.max(0, rawContent.length - 300)));
    
    try {
      // Clean up the raw content
      let cleanContent = rawContent.trim();
      
      // Remove any markdown code block markers
      cleanContent = cleanContent.replace(/```html\n?/g, '');
      cleanContent = cleanContent.replace(/```\n?/g, '');
      cleanContent = cleanContent.replace(/^```/g, '');
      cleanContent = cleanContent.replace(/```$/g, '');
      
      console.log('After cleanup Length:', cleanContent.length);
      console.log('After cleanup Preview:', cleanContent.substring(0, 300) + '...');
      
      // Since we're expecting HTML now, just clean it up and return
      console.log('Content is HTML, returning as-is');
      console.log('Final HTML Length:', cleanContent.length);
      console.log('Final HTML Preview (first 300 chars):', cleanContent.substring(0, 300));
      console.log('Final HTML Preview (last 300 chars):', cleanContent.substring(Math.max(0, cleanContent.length - 300)));
      console.log('=== FORMAT PRIVACY POLICY END ===');
      
      return cleanContent;
      
    } catch (error) {
      console.error('Error formatting privacy policy:', error);
      return rawContent;
    }
  }


}