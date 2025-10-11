import { promises as fs } from 'fs';
import path from 'path';

interface SiteInfo {
  name: string;
  domain: string;
  url: string;
  email: string;
  description: string;
  companyName: string;
  businessAddress: string;
  state: string;
  country: string;
}

export class TermsAIService {
  private static async getSiteInfo(): Promise<SiteInfo> {
    try {
      // Get site information from existing admin content/site API
      let siteInfo: SiteInfo = {
        name: "Recipe Website",
        domain: "example.com",
        url: "https://example.com",
        email: "contact@example.com",
        description: "A recipe sharing website",
        companyName: "Feast Forge LLC",
        businessAddress: "123 Main Street, Bozeman, MT 59718",
        state: "Montana",
        country: "United States"
      };

      try {
        // Try to read from existing site.json file (from /admin/content/site)
        const sitePath = path.join(process.cwd(), 'uploads', 'content', 'site.json');
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

        console.log('Loaded site info from existing site settings for terms:', siteInfo);
        
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
        if (process.env.COMPANY_NAME) siteInfo.companyName = process.env.COMPANY_NAME;
        if (process.env.BUSINESS_ADDRESS) siteInfo.businessAddress = process.env.BUSINESS_ADDRESS;
      }

      return siteInfo;

    } catch (error) {
      console.error('Error getting site info:', error);
      return {
        name: "Recipe Website",
        domain: "example.com", 
        url: "https://example.com",
        email: "contact@example.com",
        description: "A recipe sharing website",
        companyName: "Feast Forge LLC",
        businessAddress: "123 Main Street, Bozeman, MT 59718",
        state: "Montana",
        country: "United States"
      };
    }
  }

  static async generateTerms(apiKey: string, provider: 'openai' | 'gemini', model?: string): Promise<string> {
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
    
    return `Generate a comprehensive Terms and Conditions document for a recipe website. You MUST return ONLY a valid JSON object following this EXACT structure:

{
  "title": "Terms and Conditions",
  "lastUpdated": "${currentDate}",
  "sections": [
    {
      "heading": "Use of the Website",
      "content": [
        "The Website is intended for personal, non-commercial use.",
        "You may not reproduce, copy, sell, or exploit any portion of the Website without prior written consent.",
        "You agree not to misuse the Website in any unlawful or harmful manner."
      ]
    },
    {
      "heading": "Content Disclaimer",
      "content": [
        "The Website provides recipes, cooking tips, and food-related content for informational and entertainment purposes only.",
        "We are not medical professionals or licensed dietitians. Nutritional information, diet suggestions, or ingredient alternatives are provided as general reference and should not be considered medical, dietary, or professional advice.",
        "Always consult with a qualified healthcare provider before making changes to your diet if you have allergies, health concerns, or dietary restrictions."
      ]
    },
    {
      "heading": "User-Generated Content",
      "content": [
        "If you submit comments, feedback, recipes, or other materials ('User Content'), you grant us a non-exclusive, royalty-free, worldwide license to use, reproduce, and display that content.",
        "You are solely responsible for ensuring your User Content does not infringe on third-party rights or violate any laws.",
        "We reserve the right to remove or moderate User Content at our discretion."
      ]
    },
    {
      "heading": "Intellectual Property",
      "content": [
        "All Website content, including recipes, images, graphics, logos, and text, are owned by or licensed to us and are protected by copyright, trademark, and intellectual property laws.",
        "You may share our content for personal use or on social media with proper credit and a direct link to our Website. Commercial use without permission is prohibited."
      ]
    },
    {
      "heading": "Third-Party Links and Advertising",
      "content": [
        "The Website may contain external links, affiliate links, or advertisements. We do not control third-party websites and are not responsible for their content, practices, or policies.",
        "Some links may generate a commission for us if you make a purchase. These help support the Website at no extra cost to you."
      ]
    },
    {
      "heading": "Limitation of Liability",
      "content": [
        "We make no guarantees regarding the accuracy, reliability, or completeness of Website content.",
        "We are not responsible for any damages, injuries, or losses resulting from the use of our recipes, nutritional information, or reliance on the Website.",
        "Your use of the Website is at your own risk."
      ]
    },
    {
      "heading": "Privacy",
      "content": [
        "Your use of the Website is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal data."
      ]
    },
    {
      "heading": "Termination",
      "content": [
        "We reserve the right to suspend or terminate your access to the Website at any time, without notice, for conduct that violates these Terms or is otherwise harmful to us or other users."
      ]
    },
    {
      "heading": "Governing Law",
      "content": [
        "These Terms are governed by and interpreted under the laws of the State of ${siteInfo.state}, ${siteInfo.country}, without regard to conflict of law provisions.",
        "International users agree to comply with all applicable local laws when using the Website."
      ]
    },
    {
      "heading": "Changes to Terms",
      "content": [
        "We may update these Terms from time to time. The 'Last Updated' date will reflect the latest version. Continued use of the Website after changes means you accept the revised Terms."
      ]
    },
    {
      "heading": "Contact Us",
      "content": [
        "${siteInfo.companyName}",
        "${siteInfo.email}",
        "${siteInfo.businessAddress}"
      ]
    }
  ]
}

CRITICAL REQUIREMENTS:
- Return ONLY the JSON object above
- Fill in ALL sections completely with detailed, professional legal language
- Use the provided site information: ${siteInfo.name}, ${siteInfo.domain}, ${siteInfo.email}
- Each content array should have 2-4 comprehensive sentences
- Make it legally sound but readable for a recipe website
- Ensure all 11 sections are included
- Use current date: ${currentDate}
- NO markdown formatting, NO explanations, ONLY JSON`;
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
            content: 'You are a legal document generator. You MUST return a COMPLETE JSON object with ALL 11 sections for Terms and Conditions. Each section must be fully expanded with detailed legal language. Return ONLY JSON starting with { and ending with }.'
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
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI API');
    }
    
    let content = data.choices[0].message.content;
    
    console.log('OpenAI Response Length:', content.length);
    console.log('OpenAI Response Preview:', content.substring(0, 200) + '...');
    
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
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      console.error('Unexpected Gemini response structure:', data);
      throw new Error('Invalid response structure from Gemini API');
    }
    
    let content = data.candidates[0].content.parts[0].text;
    
    console.log('Gemini Response Length:', content.length);
    console.log('Gemini Response Preview:', content.substring(0, 200) + '...');
    
    content = this.cleanupAIResponse(content);
    
    console.log('Cleaned Response Length:', content.length);
    
    return content;
  }

  private static cleanupAIResponse(content: string): string {
    content = content.replace(/```json\s*/gi, '');
    content = content.replace(/```\s*/gi, '');
    
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      content = content.substring(jsonStart, jsonEnd + 1);
    }
    
    content = content.trim();
    
    return content;
  }

  static formatTerms(rawContent: string): string {
    console.log('Format Input Length:', rawContent.length);
    console.log('Format Input Preview:', rawContent.substring(0, 200) + '...');
    
    try {
      let cleanContent = rawContent.trim();
      
      cleanContent = cleanContent.replace(/```json\n?/g, '');
      cleanContent = cleanContent.replace(/```\n?/g, '');
      
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }
      
      const termsData = JSON.parse(cleanContent);
      
      if (!termsData.sections || !Array.isArray(termsData.sections)) {
        throw new Error('Invalid terms structure: missing sections array');
      }
      
      let htmlOutput = `<div class="terms-document">
        <div class="text-center mb-8">
          <h1 class="text-[2.28rem] font-bold text-black mb-4">${termsData.title || 'Terms and Conditions'}</h1>
          <p class="text-gray-600"><strong>Last updated:</strong> ${termsData.lastUpdated || new Date().toISOString().split('T')[0]}</p>
        </div>`;

      termsData.sections.forEach((section: any, index: number) => {
        htmlOutput += `
        <section class="mb-8">
          <h2 class="text-xl font-bold text-black mb-4">${section.heading}</h2>`;
        
        if (Array.isArray(section.content)) {
          section.content.forEach((paragraph: string) => {
            htmlOutput += `<p class="text-black mb-4">${paragraph}</p>`;
          });
        } else {
          htmlOutput += `<p class="text-black mb-4">${section.content}</p>`;
        }
        
        htmlOutput += `</section>`;
      });

      htmlOutput += `</div>`;
      
      console.log('Formatted HTML Length:', htmlOutput.length);
      
      return htmlOutput;
      
    } catch (error) {
      console.error('Error formatting terms:', error);
      
      return `<div class="terms-document">
        <div class="text-center mb-8">
          <h1 class="text-[2.28rem] font-bold text-black mb-4">Terms and Conditions</h1>
          <p class="text-gray-600"><strong>Last updated:</strong> ${new Date().toISOString().split('T')[0]}</p>
        </div>
        <div class="prose prose-lg max-w-none text-black">
          <p class="text-red-600 mb-4"><strong>Error:</strong> Unable to format terms content properly.</p>
          <pre class="whitespace-pre-wrap bg-gray-100 p-4 rounded">${rawContent}</pre>
        </div>
      </div>`;
    }
  }
}