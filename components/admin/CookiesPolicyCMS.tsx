"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wand2, RefreshCw, Save, Eye, AlertCircle, CheckCircle, ArrowLeft, Trash2, Plus } from "lucide-react";
import { refreshAfterChange } from "@/lib/revalidation-utils";

interface CookiesSection {
  id: string;
  title: string;
  content: string;
}

interface CookiesPolicyContent {
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  
  // SEO Metadata
  metaTitle: string;
  metaDescription: string;
  
  // Cookies Sections
  sections: CookiesSection[];
  
  // Timestamp
  lastUpdated: string | null;
}

interface WebsiteContext {
  websiteName: string;
  businessType: string;
  ownerName: string;
  country: string;
  primaryLanguage: string;
  siteDomain: string;
}

// Default sections for a comprehensive cookie policy
const DEFAULT_SECTIONS: CookiesSection[] = [
  {
    id: "intro",
    title: "Introduction",
    content: ""
  },
  {
    id: "what-are-cookies",
    title: "What Are Cookies",
    content: ""
  },
  {
    id: "types-of-cookies",
    title: "Types of Cookies We Use",
    content: ""
  },
  {
    id: "essential-cookies",
    title: "Essential Cookies",
    content: ""
  },
  {
    id: "analytics-cookies",
    title: "Analytics Cookies",
    content: ""
  },
  {
    id: "advertising-cookies",
    title: "Advertising Cookies",
    content: ""
  },
  {
    id: "control-cookies",
    title: "How to Control Cookies",
    content: ""
  },
  {
    id: "third-party-cookies",
    title: "Third-Party Cookies",
    content: ""
  },
  {
    id: "updates",
    title: "Updates to Cookie Policy",
    content: ""
  },
  {
    id: "contact",
    title: "Contact Us",
    content: ""
  }
];

export default function CookiesPolicyCMS({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const [content, setContent] = useState<CookiesPolicyContent>({
    heroTitle: "Cookie Policy",
    heroSubtitle: "Learn how we use cookies and similar technologies",
    metaTitle: "",
    metaDescription: "",
    sections: DEFAULT_SECTIONS,
    lastUpdated: null
  });

  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  // Load current settings and content
  useEffect(() => {
    loadContent();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handlePreview = () => {
    window.open("/cookies", "_blank");
  };

  const loadContent = async () => {
    try {
      const settingsResponse = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      
      if (settingsResponse.ok) {
        const data = await settingsResponse.json();
        
        // Load existing cookies content if it exists
        if (data.cookiesPageContent) {
          setContent(prev => ({ 
            ...prev, 
            ...data.cookiesPageContent,
            // Ensure sections exist
            sections: data.cookiesPageContent.sections || DEFAULT_SECTIONS
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load content:", err);
    }
  };

  const getWebsiteContext = (): WebsiteContext => {
    // Get AI Context Settings from admin settings
    const aiWebsiteName = settings?.aiContextSettings?.websiteName;
    const aiBusinessType = settings?.aiContextSettings?.businessType;
    const aiOwnerName = settings?.aiContextSettings?.ownerName;
    const aiCountry = settings?.aiContextSettings?.country;
    const aiLanguage = settings?.aiContextSettings?.primaryLanguage;
    const aiDomain = settings?.aiContextSettings?.siteDomain;
    
    return {
      websiteName: aiWebsiteName || settings?.logoText || "Your Website",
      businessType: aiBusinessType || "Recipe Blog",
      ownerName: aiOwnerName || "Website Owner",
      country: aiCountry || "United States",
      primaryLanguage: aiLanguage || "English",
      siteDomain: aiDomain || settings?.siteDomain || window?.location?.hostname || ""
    };
  };

  const generateFieldContent = async (fieldName: string, sectionId?: string) => {
    try {
      setGeneratingField(sectionId ? `${sectionId}_${fieldName}` : fieldName);
      setError(null);

      const websiteContext = getWebsiteContext();
      
      const contextInfo = `Website: "${websiteContext.websiteName}"
Business Type: ${websiteContext.businessType}
Owner: ${websiteContext.ownerName}
Language: ${websiteContext.primaryLanguage}
Country: ${websiteContext.country}
Domain: ${websiteContext.siteDomain}`;

      let prompt = "";
      let maxLength = 200;

      if (fieldName === "heroTitle") {
        prompt = `Context:
${contextInfo}

Task: Generate a simple 2-3 word title for the Cookie Policy hero section. Professional tone. No explanations, just the title:`;
        maxLength = 50;
      } else if (fieldName === "heroSubtitle") {
        prompt = `Context:
${contextInfo}

Task: Generate a 15-20 word subtitle explaining what users will learn about cookies and tracking. Professional, transparent tone. No explanations, just the subtitle:`;
        maxLength = 150;
      } else if (fieldName === "metaTitle") {
        prompt = `Context:
${contextInfo}

Task: Generate a 50-60 character SEO meta title for the Cookie Policy page. Include "${websiteContext.websiteName}" and "Cookie Policy". Optimized for ${websiteContext.country}. No explanations, just the title:`;
        maxLength = 60;
      } else if (fieldName === "metaDescription") {
        prompt = `Context:
${contextInfo}

Task: Generate a 150-160 character SEO meta description for Cookie Policy. Mention cookies, tracking, user control, and ${websiteContext.websiteName}. For ${websiteContext.country} audience. No explanations, just the description:`;
        maxLength = 160;
      } else if (fieldName === "title" && sectionId) {
        const section = content.sections.find(s => s.id === sectionId);
        prompt = `Context:
${contextInfo}

Task: Generate a clear 2-6 word section title for a Cookie Policy section about "${section?.title || sectionId}". Professional, informative tone. No explanations, just the title:`;
        maxLength = 80;
      } else if (fieldName === "content" && sectionId) {
        const section = content.sections.find(s => s.id === sectionId);
        
        // Detailed prompts for each cookie section
        const sectionPrompts: Record<string, string> = {
          'intro': `Write a comprehensive introduction for ${websiteContext.websiteName}'s Cookie Policy (300-500 words).

Include:
- Welcome and purpose of this cookie policy
- Brief explanation of what cookies are
- Why we use cookies on our ${websiteContext.businessType} site
- Link to ${websiteContext.country} cookie regulations (GDPR/CCPA if applicable)
- User's right to control cookies

Use HTML formatting: <p> tags for paragraphs, <strong> for emphasis. Write in ${websiteContext.primaryLanguage}. Clear, user-friendly tone.`,
          
          'what-are-cookies': `Write detailed content about what cookies are (300-400 words).

Explain:
- Simple definition of cookies
- How cookies work (stored on device, sent with requests)
- Difference between first-party and third-party cookies
- Session vs persistent cookies
- How ${websiteContext.websiteName} uses them

HTML format: <p>, <strong>. ${websiteContext.primaryLanguage}. Educational, accessible language.`,
          
          'types-of-cookies': `Write comprehensive content about types of cookies ${websiteContext.websiteName} uses (400-500 words).

Cover:
- Essential/necessary cookies
- Functional cookies
- Analytics/performance cookies
- Marketing/advertising cookies
- Preference cookies
- Specific to ${websiteContext.businessType} functionality

HTML: <p>, <ul><li>, <strong>. ${websiteContext.primaryLanguage}. Organized, clear categories.`,
          
          'essential-cookies': `Write about essential cookies for ${websiteContext.websiteName} (300-400 words).

Include:
- What makes a cookie "essential"
- Examples: authentication, security, basic site functionality
- Why they can't be disabled
- How they enable ${websiteContext.businessType} features
- ${websiteContext.country} legal basis for essential cookies

HTML: <p>, <ul><li>, <strong>. ${websiteContext.primaryLanguage}. Clear technical explanation.`,
          
          'analytics-cookies': `Write about analytics cookies on ${websiteContext.websiteName} (300-400 words).

Detail:
- Purpose: understanding user behavior, improving site
- Specific services: Google Analytics, etc.
- What data is collected (pages, time, interactions)
- How it helps improve ${websiteContext.businessType} content
- User control options
- ${websiteContext.country} compliance

HTML: <p>, <ul><li>, <strong>. ${websiteContext.primaryLanguage}. Transparent, specific.`,
          
          'advertising-cookies': `Write about advertising cookies (if applicable) on ${websiteContext.websiteName} (300-400 words).

Cover:
- Purpose: delivering relevant ads
- Services used: Google AdSense, etc.
- How targeting works
- Third-party ad networks
- User control and opt-out options
- ${websiteContext.country} advertising regulations

HTML: <p>, <ul><li>, <strong>. ${websiteContext.primaryLanguage}. Honest, clear about ad practices.`,
          
          'control-cookies': `Write detailed instructions on how users can control cookies (400-500 words).

Include:
- Browser settings (Chrome, Firefox, Safari, Edge)
- How to disable/delete cookies
- Impact on ${websiteContext.websiteName} functionality
- Mobile device controls (iOS, Android)
- Third-party opt-out tools
- Do Not Track settings
- Cookie consent management

HTML: <p>, <ul><li>, <strong>, <a href> for helpful links. ${websiteContext.primaryLanguage}. Step-by-step, empowering.`,
          
          'third-party-cookies': `Write about third-party cookies on ${websiteContext.websiteName} (300-400 words).

Detail:
- What third-party cookies are
- Specific services: Google Analytics, AdSense, social media
- What data they collect
- Their privacy policies (link to them)
- User control over third-party cookies
- ${websiteContext.country} regulations on third-party tracking

HTML: <p>, <ul><li>, <strong>, <a href>. ${websiteContext.primaryLanguage}. Transparent, specific.`,
          
          'updates': `Write about updates to ${websiteContext.websiteName}'s Cookie Policy (200-300 words).

Include:
- Right to update policy
- How users will be notified
- Effective date of changes
- Importance of reviewing updates
- Historical version availability (if applicable)
- ${websiteContext.country} legal requirements for updates

HTML: <p>, <strong>. ${websiteContext.primaryLanguage}. Clear, responsible.`,
          
          'contact': `Write contact section for Cookie Policy questions (200-300 words).

Include:
- Invitation to contact with questions
- How to reach ${websiteContext.ownerName} or privacy team
- Response timeframe
- Alternative contact methods
- Data protection officer info (if applicable)
- ${websiteContext.country} data protection authority contact

HTML: <p>, <strong>, <a href> for mailto links. ${websiteContext.primaryLanguage}. Welcoming, accessible.`
        };

        prompt = sectionPrompts[sectionId] || `Write comprehensive content about ${section?.title} for ${websiteContext.websiteName}'s Cookie Policy (300-500 words). Use HTML: <p>, <ul><li>, <strong>. Language: ${websiteContext.primaryLanguage}. Professional, legally appropriate, user-friendly tone.`;
        maxLength = 6000;
      } else {
        prompt = `Generate content for ${fieldName} in the Cookie Policy.`;
        maxLength = 500;
      }

      const response = await fetch("/api/admin/ai-generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          prompt,
          maxLength,
          context: websiteContext,
        }),
      });

      if (!response.ok) {
        throw new Error("AI generation failed");
      }

      const data = await response.json();

      if (!data.content || data.content.trim() === "") {
        throw new Error("Generated content is empty");
      }

      // Update content based on field type
      if (sectionId && fieldName === "content") {
        setContent(prev => ({
          ...prev,
          sections: prev.sections.map(s =>
            s.id === sectionId ? { ...s, content: data.content.trim() } : s
          )
        }));
      } else if (sectionId && fieldName === "title") {
        setContent(prev => ({
          ...prev,
          sections: prev.sections.map(s =>
            s.id === sectionId ? { ...s, title: data.content.trim() } : s
          )
        }));
      } else {
        setContent(prev => ({
          ...prev,
          [fieldName]: data.content.trim()
        }));
      }

      setSuccess(`Generated ${fieldName} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to generate content");
      setTimeout(() => setError(null), 5000);
    } finally {
      setGeneratingField(null);
    }
  };

  const generateAllContent = async () => {
    setLoading(true);
    setError(null);

    try {
      // Generate hero and meta content
      await generateFieldContent("heroTitle");
      await generateFieldContent("heroSubtitle");
      await generateFieldContent("metaTitle");
      await generateFieldContent("metaDescription");

      // Generate all section titles and content
      for (const section of content.sections) {
        await generateFieldContent("title", section.id);
        await generateFieldContent("content", section.id);
      }

      setSuccess("Generated all content successfully!");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to generate all content");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Update lastUpdated timestamp
      const updatedContent = {
        ...content,
        lastUpdated: new Date().toISOString()
      };

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          cookiesPageContent: updatedContent
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save content");
      }

      setContent(updatedContent);
      setSuccess("Content saved successfully!");
      setTimeout(() => setSuccess(null), 3000);

      // Revalidate the public cookies page
      await refreshAfterChange("/cookies");
    } catch (err: any) {
      setError(err.message || "Failed to save content");
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    const newSection: CookiesSection = {
      id: `custom-${Date.now()}`,
      title: "New Section",
      content: ""
    };
    setContent(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const removeSection = (sectionId: string) => {
    setContent(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Content
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cookie Policy CMS</h1>
                <p className="text-sm text-gray-600">Manage your Cookie Policy with AI assistance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generateAllContent}
                disabled={loading || generatingField !== null}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Generate All
              </button>
              <button
                onClick={handlePreview}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Hero Section Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" style={{backgroundColor: '#f0f0f0'}}>
            <h2 className="text-lg font-semibold mb-4">Hero Section</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Title
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={content.heroTitle}
                    onChange={(e) => setContent({...content, heroTitle: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Cookie Policy"
                  />
                  <button
                    onClick={() => generateFieldContent("heroTitle")}
                    disabled={generatingField === "heroTitle"}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md flex items-center gap-2"
                  >
                    <Wand2 className={`w-4 h-4 ${generatingField === "heroTitle" ? 'animate-spin' : ''}`} />
                    AI Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Subtitle
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={content.heroSubtitle}
                    onChange={(e) => setContent({...content, heroSubtitle: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={2}
                    placeholder="Learn how we use cookies..."
                  />
                  <button
                    onClick={() => generateFieldContent("heroSubtitle")}
                    disabled={generatingField === "heroSubtitle"}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md flex items-center gap-2"
                  >
                    <Wand2 className={`w-4 h-4 ${generatingField === "heroSubtitle" ? 'animate-spin' : ''}`} />
                    AI Generate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Metadata Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" style={{backgroundColor: '#f0f0f0'}}>
            <h2 className="text-lg font-semibold mb-4">SEO Metadata</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={content.metaTitle}
                    onChange={(e) => setContent({...content, metaTitle: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Cookie Policy - Your Website"
                    maxLength={60}
                  />
                  <button
                    onClick={() => generateFieldContent("metaTitle")}
                    disabled={generatingField === "metaTitle"}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md flex items-center gap-2"
                  >
                    <Wand2 className={`w-4 h-4 ${generatingField === "metaTitle" ? 'animate-spin' : ''}`} />
                    AI Generate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{content.metaTitle.length}/60 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={content.metaDescription}
                    onChange={(e) => setContent({...content, metaDescription: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder="Learn about cookies and tracking..."
                    maxLength={160}
                  />
                  <button
                    onClick={() => generateFieldContent("metaDescription")}
                    disabled={generatingField === "metaDescription"}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md flex items-center gap-2"
                  >
                    <Wand2 className={`w-4 h-4 ${generatingField === "metaDescription" ? 'animate-spin' : ''}`} />
                    AI Generate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{content.metaDescription.length}/160 characters</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cookie Policy Sections */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" style={{backgroundColor: '#f0f0f0'}}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Cookie Policy Sections</h2>
            <button
              onClick={addSection}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>

          <div className="space-y-6">
            {content.sections.map((section, index) => (
              <div key={section.id} className="border border-gray-300 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-md font-semibold text-gray-900">Section {index + 1}</h3>
                  {!section.id.startsWith('intro') && !section.id.startsWith('contact') && (
                    <button
                      onClick={() => removeSection(section.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Title
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => {
                          setContent(prev => ({
                            ...prev,
                            sections: prev.sections.map(s =>
                              s.id === section.id ? {...s, title: e.target.value} : s
                            )
                          }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => generateFieldContent("title", section.id)}
                        disabled={generatingField === `${section.id}_title`}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md flex items-center gap-2"
                      >
                        <Wand2 className={`w-4 h-4 ${generatingField === `${section.id}_title` ? 'animate-spin' : ''}`} />
                        AI Generate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Content
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        value={section.content}
                        onChange={(e) => {
                          setContent(prev => ({
                            ...prev,
                            sections: prev.sections.map(s =>
                              s.id === section.id ? {...s, content: e.target.value} : s
                            )
                          }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                        rows={8}
                        placeholder="Content with HTML formatting..."
                      />
                      <button
                        onClick={() => generateFieldContent("content", section.id)}
                        disabled={generatingField === `${section.id}_content`}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md flex items-center gap-2"
                      >
                        <Wand2 className={`w-4 h-4 ${generatingField === `${section.id}_content` ? 'animate-spin' : ''}`} />
                        AI Generate
                      </button>
                    </div>
                    {section.content && (
                      <p className="text-xs text-gray-500 mt-1">{section.content.length} characters</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated Info */}
        {content.lastUpdated && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Last updated: {new Date(content.lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
