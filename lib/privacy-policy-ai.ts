// Privacy Policy AI Generation Service
import { promises as fs } from 'fs';
import path from 'path';
import { getAdminSettings } from '@/lib/admin-settings';

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
      // Get site information from existing admin content/site API
      let siteInfo: SiteInfo = {
        name: "Recipe Website",
        domain: "example.com",
        url: "https://example.com",
        email: "contact@example.com",
        description: "A recipe sharing website",
        socialLinks: [],
        contactInfo: {}
      };

      try {
        // Read from secure site.json file (from /admin/content/site)
        const sitePath = path.join(process.cwd(), 'data', 'config', 'site.json');
        const siteContent = await fs.readFile(sitePath, 'utf-8');
        const siteData = JSON.parse(siteContent);
        
        // Use existing site settings if they exist and aren't defaults
        if (siteData.siteTitle && siteData.siteTitle !== "Calama Team Recipes - Delicious Family-Friendly Recipes") {
          siteInfo.name = siteData.siteTitle;
        }
        if (siteData.siteDomain && siteData.siteDomain !== "example.com") {
          siteInfo.domain = siteData.siteDomain;
          siteInfo.url = siteData.siteUrl || `https://${siteData.siteDomain}`;
        }
        if (siteData.siteEmail && siteData.siteEmail !== "hello@example.com") {
          siteInfo.email = siteData.siteEmail;
        }
        if (siteData.siteDescription) {
          siteInfo.description = siteData.siteDescription;
        }

        console.log('Loaded site info from existing site settings:', siteInfo);
        
      } catch (siteError) {
        console.log('No existing site settings found, using environment variables or defaults');
        
        // Fallback to environment variables
        if (process.env.SITE_NAME) siteInfo.name = process.env.SITE_NAME;
        if (process.env.SITE_DOMAIN) {
          siteInfo.domain = process.env.SITE_DOMAIN;
          siteInfo.url = `https://${process.env.SITE_DOMAIN}`;
        }
        if (process.env.SITE_EMAIL) siteInfo.email = process.env.SITE_EMAIL;
        if (process.env.SITE_DESCRIPTION) siteInfo.description = process.env.SITE_DESCRIPTION;
      }

      return siteInfo;

    } catch (error) {
      console.error('Error getting site info:', error);
      // Return safe defaults
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

    const socialPlatforms = siteInfo.socialLinks
      .filter(link => link.enabled)
      .map(link => link.platform)
      .join(', ');

    // Load JSON template synchronously (we're in an async context)
    const fs = require('fs');
    const path = require('path');
    const templatePath = path.join(process.cwd(), 'jsonp.md');
    const jsonTemplate = fs.readFileSync(templatePath, 'utf-8');

    return `You are a JSON privacy policy generator. You MUST return a COMPLETE JSON object with ALL sections expanded.

CRITICAL REQUIREMENTS:
1. Generate ALL sections as shown in the template
2. Each section must have 3-5 detailed sentences minimum
3. Include ALL subsections (especially "Your Rights" and "Contact Us")
4. Return ONLY pure JSON - no markdown, no explanations
5. Start with { and end with } - nothing else

EXACT JSON TEMPLATE TO FOLLOW:
${jsonTemplate}

WEBSITE DATA TO INSERT:
- Company: "${siteInfo.name}"
- Website: "${siteInfo.url}"
- Domain: "${siteInfo.domain}"
- Email: "${siteInfo.email}"
- Description: "${siteInfo.description}"
- Date: "${currentDate}"

INTERNAL LINKS TO INCLUDE:
- Home: ${siteInfo.url}
- About: ${siteInfo.url}/about
- Contact: ${siteInfo.url}/contact
- Terms: ${siteInfo.url}/terms
- Cookies: ${siteInfo.url}/cookies

MANDATORY SECTION EXPANSION:
You MUST generate ALL these sections with detailed content:

1. "Scope" - 4-5 sentences about policy coverage, GDPR/CCPA compliance, recipe website features
2. "Information We Collect" - Detailed list of data types for recipe websites (accounts, comments, ratings, newsletter)
3. "How We Collect Data" - Comprehensive methods (forms, cookies, user interactions, recipe submissions)
4. "How We Use Data" - Detailed purposes (personalization, recommendations, marketing, analytics)
5. "Cookies and Tracking Technologies" - Full explanation of cookie types and purposes
6. "Sharing and Disclosure" - Complete third-party sharing details
7. "Data Retention" - Specific timeframes for different data types
8. "Data Security" - Detailed security measures and protocols
9. "International Data Transfers" - Full cross-border transfer explanation
10. "Your Rights" - MUST include both GDPR and CCPA subsections with all listed rights
11. "Children's Privacy" - Complete COPPA compliance details
12. "Changes to This Policy" - Full update process and notification methods
13. "Contact Us" - Complete contact information with company, email, address

EXACT REPLACEMENTS:
- "[Insert Date]" → "${currentDate}"
- "Choco Fever Dream / Feast Forge LLC" → "${siteInfo.name}"
- "https://chocofeverdream.com" → "${siteInfo.url}"
- "privacy@chocofeverdream.com" → "${siteInfo.email}"

CRITICAL: Generate the COMPLETE JSON with ALL 13 sections. Do not abbreviate or skip any section. Each section must be fully expanded with recipe website specific details.

START YOUR RESPONSE WITH { AND END WITH } - RETURN COMPLETE JSON ONLY!`;
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
            content: 'You are a JSON privacy policy generator. You MUST return a COMPLETE JSON object with ALL 13 sections from the template. Each section must be fully expanded with 3-5 detailed sentences. DO NOT truncate or abbreviate ANY section. Return ONLY JSON starting with { and ending with }.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 8192,
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

  private static async generateWithGemini(prompt: string, apiKey: string, model: string = 'gemini-2.5-flash'): Promise<string> {
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
          maxOutputTokens: 8192,
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
    console.log('Format Input Length:', rawContent.length);
    console.log('Format Input Preview:', rawContent.substring(0, 200) + '...');
    
    try {
      // Clean up the raw content first
      let cleanContent = rawContent.trim();
      
      // Remove markdown code block markers if present
      cleanContent = cleanContent.replace(/```json\n?/g, '');
      cleanContent = cleanContent.replace(/```\n?/g, '');
      cleanContent = cleanContent.replace(/^```/g, '');
      cleanContent = cleanContent.replace(/```$/g, '');
      
      console.log('After cleanup Length:', cleanContent.length);
      
      // Try to parse as JSON first
      let jsonData;
      try {
        jsonData = JSON.parse(cleanContent);
        console.log('JSON parsed successfully, sections count:', jsonData.sections?.length || 0);
      } catch (jsonError) {
        console.log('JSON parse failed:', jsonError);
        // If it's not JSON, treat as HTML and apply formatting
        return this.formatHtmlContent(cleanContent);
      }

      // Convert JSON to HTML
      const htmlResult = this.convertJsonToHtml(jsonData);
      console.log('Final HTML Length:', htmlResult.length);
      
      return htmlResult;
      
    } catch (error) {
      console.error('Error formatting privacy policy:', error);
      // Fallback to basic HTML formatting
      return this.formatHtmlContent(rawContent);
    }
  }

  private static convertJsonToHtml(jsonData: any): string {
    let html = '<div class="privacy-policy-content">\n';
    
    // Add title
    if (jsonData.title) {
      html += `  <h1 class="text-3xl font-bold text-black mb-6">${jsonData.title}</h1>\n`;
    }
    
    // Add effective date and last updated
    if (jsonData.effectiveDate || jsonData.lastUpdated) {
      html += '  <div class="text-sm text-gray-600 mb-6">\n';
      if (jsonData.effectiveDate) {
        html += `    <p><strong>Effective Date:</strong> ${jsonData.effectiveDate}</p>\n`;
      }
      if (jsonData.lastUpdated) {
        html += `    <p><strong>Last Updated:</strong> ${jsonData.lastUpdated}</p>\n`;
      }
      html += '  </div>\n';
    }

    // Add company and website info
    if (jsonData.company || jsonData.website) {
      html += '  <div class="text-sm text-gray-600 mb-6">\n';
      if (jsonData.company) {
        html += `    <p><strong>Company:</strong> ${jsonData.company}</p>\n`;
      }
      if (jsonData.website) {
        html += `    <p><strong>Website:</strong> <a href="${jsonData.website}" class="text-blue-600 hover:underline">${jsonData.website}</a></p>\n`;
      }
      html += '  </div>\n';
    }

    // Process sections
    if (jsonData.sections && Array.isArray(jsonData.sections)) {
      jsonData.sections.forEach((section: any) => {
        if (section.heading) {
          html += `  <h2 class="text-2xl font-bold text-black mb-4 mt-8">${section.heading}</h2>\n`;
        }

        if (typeof section.content === 'string') {
          // Process internal links in content
          let processedContent = this.processInternalLinks(section.content);
          html += `  <p class="text-black mb-4">${processedContent}</p>\n`;
        } else if (typeof section.content === 'object') {
          // Handle nested content (like rights sections)
          Object.keys(section.content).forEach(key => {
            html += `  <h3 class="text-xl font-bold text-black mb-4 mt-6">${key}</h3>\n`;
            
            const content = section.content[key];
            if (Array.isArray(content)) {
              html += '  <ul class="list-disc pl-6 text-black mb-4">\n';
              content.forEach(item => {
                html += `    <li class="mb-2">${item}</li>\n`;
              });
              html += '  </ul>\n';
            } else if (typeof content === 'object') {
              // Handle contact info object
              html += '  <div class="bg-gray-50 p-4 rounded-lg mb-4">\n';
              Object.keys(content).forEach(subKey => {
                if (subKey === 'email') {
                  html += `    <p><strong>${subKey.charAt(0).toUpperCase() + subKey.slice(1)}:</strong> <a href="mailto:${content[subKey]}" class="text-blue-600 hover:underline">${content[subKey]}</a></p>\n`;
                } else {
                  html += `    <p><strong>${subKey.charAt(0).toUpperCase() + subKey.slice(1)}:</strong> ${content[subKey]}</p>\n`;
                }
              });
              html += '  </div>\n';
            } else {
              html += `  <p class="text-black mb-4">${content}</p>\n`;
            }
          });
        }
      });
    }

    html += '</div>';
    return html;
  }

  private static formatHtmlContent(content: string): string {
    let formattedContent = content.trim();

    // Remove any code block markers
    formattedContent = formattedContent.replace(/```html\n?/g, '');
    formattedContent = formattedContent.replace(/```\n?/g, '');

    // Ensure proper HTML structure
    if (!formattedContent.includes('<div') && !formattedContent.includes('<section')) {
      formattedContent = `<div class="privacy-policy-content">\n${formattedContent}\n</div>`;
    }

    // Add proper styling classes
    formattedContent = formattedContent.replace(/<h1>/g, '<h1 class="text-3xl font-bold text-black mb-6">');
    formattedContent = formattedContent.replace(/<h2>/g, '<h2 class="text-2xl font-bold text-black mb-4 mt-8">');
    formattedContent = formattedContent.replace(/<h3>/g, '<h3 class="text-xl font-bold text-black mb-4 mt-6">');
    formattedContent = formattedContent.replace(/<p>/g, '<p class="text-black mb-4">');
    formattedContent = formattedContent.replace(/<ul>/g, '<ul class="list-disc pl-6 text-black mb-4">');
    formattedContent = formattedContent.replace(/<ol>/g, '<ol class="list-decimal pl-6 text-black mb-4">');
    formattedContent = formattedContent.replace(/<li>/g, '<li class="mb-2">');
    formattedContent = formattedContent.replace(/<strong>/g, '<strong class="font-semibold">');

    return formattedContent;
  }

  private static processInternalLinks(content: string): string {
    // Convert URLs in content to clickable links
    const urlRegex = /(https?:\/\/[^\s<>"]+)/g;
    return content.replace(urlRegex, '<a href="$1" class="text-blue-600 hover:underline">$1</a>');
  }
}