"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wand2, RefreshCw, Save, Eye, AlertCircle, CheckCircle, ArrowLeft, Trash2, Plus } from "lucide-react";
import { refreshAfterChange } from "@/lib/revalidation-utils";
import { adminFetch } from '@/lib/admin-fetch';

interface PrivacySection {
  id: string;
  title: string;
  content: string;
}

interface PrivacyPolicyContent {
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  
  // SEO Metadata
  metaTitle: string;
  metaDescription: string;
  
  // Privacy Sections
  sections: PrivacySection[];
  
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

// Default sections for a comprehensive privacy policy
const DEFAULT_SECTIONS: PrivacySection[] = [
  {
    id: "intro",
    title: "Introduction",
    content: ""
  },
  {
    id: "info-collect",
    title: "Information We Collect",
    content: ""
  },
  {
    id: "how-use",
    title: "How We Use Your Information",
    content: ""
  },
  {
    id: "cookies",
    title: "Cookies and Tracking",
    content: ""
  },
  {
    id: "third-party",
    title: "Third-Party Services",
    content: ""
  },
  {
    id: "data-security",
    title: "Data Security",
    content: ""
  },
  {
    id: "your-rights",
    title: "Your Privacy Rights",
    content: ""
  },
  {
    id: "contact",
    title: "Contact Information",
    content: ""
  }
];

export default function PrivacyPolicyCMS({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const [content, setContent] = useState<PrivacyPolicyContent>({
    heroTitle: "Privacy Policy",
    heroSubtitle: "Learn how we protect and manage your personal information",
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
      const response = await adminFetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("📋 Loaded Settings:", data);
        console.log("🤖 AI Context Settings:", data.aiContextSettings);
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
    window.open("/privacy", "_blank");
  };

  const loadContent = async () => {
    try {
      const settingsResponse = await adminFetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      
      if (settingsResponse.ok) {
        const data = await settingsResponse.json();
        
        // Load existing privacy content if it exists
        if (data.privacyPageContent) {
          setContent(prev => ({ 
            ...prev, 
            ...data.privacyPageContent,
            // Ensure sections exist
            sections: data.privacyPageContent.sections || DEFAULT_SECTIONS
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
    
    console.log("🔍 Getting Website Context...");
    console.log("  - aiWebsiteName:", aiWebsiteName);
    console.log("  - aiBusinessType:", aiBusinessType);
    console.log("  - aiOwnerName:", aiOwnerName);
    console.log("  - aiCountry:", aiCountry);
    console.log("  - settings?.logoText:", settings?.logoText);
    
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

      // Generate prompts based on field type
      if (fieldName === "heroTitle") {
        prompt = `Context:
${contextInfo}

Task: Generate a clear, professional 2-4 word title for a Privacy Policy page. Should be direct and trustworthy. No explanations, just the title:`;
        maxLength = 60;
      } else if (fieldName === "heroSubtitle") {
        prompt = `Context:
${contextInfo}

Task: Generate a reassuring 15-25 word subtitle for the Privacy Policy hero section. Explain what users will learn about data protection and privacy. No explanations, just the subtitle:`;
        maxLength = 150;
      } else if (fieldName === "metaTitle") {
        prompt = `Context:
${contextInfo}

Task: Generate a 50-60 character SEO meta title for the Privacy Policy page. Include "${websiteContext.websiteName}" and "Privacy Policy". Optimized for ${websiteContext.country}. No explanations, just the title:`;
        maxLength = 60;
      } else if (fieldName === "metaDescription") {
        prompt = `Context:
${contextInfo}

Task: Generate a 150-160 character SEO meta description for Privacy Policy. Mention data protection, user privacy, and ${websiteContext.websiteName}. For ${websiteContext.country} audience. No explanations, just the description:`;
        maxLength = 160;
      } else if (fieldName === "title" && sectionId) {
        const section = content.sections.find(s => s.id === sectionId);
        prompt = `Context:
${contextInfo}

Task: Generate a clear 2-6 word section title for a Privacy Policy section about "${section?.title || sectionId}". Professional legal tone. No explanations, just the title:`;
        maxLength = 80;
      } else if (fieldName === "content" && sectionId) {
        const section = content.sections.find(s => s.id === sectionId);
        const sectionTitle = section?.title || "";
        
        // Detailed prompts for each privacy section
        const sectionPrompts: Record<string, string> = {
          'intro': `Write a comprehensive introduction for ${websiteContext.websiteName}'s Privacy Policy (300-500 words).

CRITICAL INSTRUCTIONS:
- Use "${websiteContext.websiteName}" as the website name - DO NOT use placeholders like [Your Website Name] or [Website Name]
- Use "${websiteContext.siteDomain}" as the website URL - DO NOT use placeholders like [Your Website URL]
- Replace ALL placeholders with actual values provided in context
- Be specific and use the actual website name throughout the content

Include:
- Welcome and purpose of this privacy policy for ${websiteContext.websiteName}
- Commitment to protecting user privacy and data
- What information is covered in this policy
- Effective date and compliance with ${websiteContext.country} privacy laws
- Brief overview of ${websiteContext.businessType} data practices

Use HTML formatting: <p> tags for paragraphs, <strong> for emphasis. Write in ${websiteContext.primaryLanguage}. Professional, transparent, legally appropriate tone.`,
          
          'info-collect': `Write detailed content about what information ${websiteContext.websiteName} collects (400-600 words).

CRITICAL: Use "${websiteContext.websiteName}" as the website name - NO placeholders like [Your Website] or [Website Name]. Be specific.

Cover:
- Personal information (name, email, contact details)
- Technical information (IP address, browser type, device info)
- Usage data (pages visited, time on site, interactions)
- Newsletter subscription data
- Comment/form submission data
- Cookies and tracking data
- Information for ${websiteContext.businessType} features

Use HTML: <p> paragraphs, <ul><li> lists, <strong> emphasis. ${websiteContext.primaryLanguage} language. Clear, comprehensive, legally sound.`,
          
          'how-use': `Write comprehensive content about how ${websiteContext.websiteName} uses collected data (400-600 words).

CRITICAL: Use "${websiteContext.websiteName}" explicitly - NO placeholders. Be specific with the actual website name.

Explain uses:
- Providing and improving ${websiteContext.businessType} services
- Sending newsletters and updates (with consent)
- Responding to inquiries and support
- Personalizing user experience
- Analytics and performance improvement
- Legal compliance and safety
- Marketing (if applicable)
- Specific to ${websiteContext.country} regulations

HTML format: <p>, <ul><li>, <strong>. ${websiteContext.primaryLanguage}. Transparent, detailed, professional.`,
          
          'cookies': `Write detailed cookie policy content for ${websiteContext.websiteName} (400-600 words).

CRITICAL: Use "${websiteContext.websiteName}" as the actual website name - NO placeholders or brackets.

Cover:
- What cookies are and why ${websiteContext.websiteName} uses them
- Types of cookies: essential, analytics, advertising, preferences
- First-party vs third-party cookies
- Specific services: Google Analytics, AdSense, social media
- How users can control/disable cookies
- Impact of disabling cookies on ${websiteContext.businessType} functionality
- Cookie consent and ${websiteContext.country} cookie laws

HTML: <p>, <ul><li>, <strong>. ${websiteContext.primaryLanguage}. Thorough, user-friendly explanation.`,
          
          'third-party': `Write comprehensive third-party services section for ${websiteContext.websiteName} (400-600 words).

CRITICAL: Use "${websiteContext.websiteName}" explicitly throughout - NO placeholders like [Website Name].

List and explain services used by ${websiteContext.websiteName}:
- Google Analytics (traffic analysis)
- Google AdSense (advertising)
- Social media platforms (sharing, embedding)
- Email services (newsletters)
- Comment systems
- CDN services
- Payment processors (if applicable)

For each: purpose, data shared, their privacy policies, user control. Relevant to ${websiteContext.businessType} in ${websiteContext.country}.

HTML: <p>, <ul><li>, <strong>, <a href> for privacy policy links. ${websiteContext.primaryLanguage}. Detailed, transparent.`,
          
          'data-security': `Write detailed data security section for ${websiteContext.websiteName} (300-500 words).

CRITICAL: Use "${websiteContext.websiteName}" as the actual name - NO placeholders.

Cover:
- Technical security measures used by ${websiteContext.websiteName} (encryption, secure servers, SSL)
- Access controls and authentication
- Regular security updates and monitoring
- Data breach notification procedures
- Limitations (no system is 100% secure)
- ${websiteContext.country} security standards and compliance
- How long ${websiteContext.websiteName} retains data
- Data storage locations

HTML: <p>, <ul><li>, <strong>. ${websiteContext.primaryLanguage}. Reassuring yet realistic, professionally worded.`,
          
          'your-rights': `Write comprehensive user rights section for ${websiteContext.websiteName} (400-600 words).

CRITICAL: Use "${websiteContext.websiteName}" explicitly - NO placeholders or brackets.

Detail privacy rights at ${websiteContext.websiteName}:
- Right to access personal data
- Right to correction/rectification
- Right to deletion (right to be forgotten)
- Right to opt-out of marketing
- Right to data portability
- Right to withdraw consent
- ${websiteContext.country} specific rights (GDPR, CCPA, etc.)
- How to exercise these rights
- Response timeframes
- Complaint procedures

HTML: <p>, <ul><li>, <strong>. ${websiteContext.primaryLanguage}. Empowering, clear, legally compliant.`,
          
          'contact': `Write contact information section for privacy concerns at ${websiteContext.websiteName} (200-300 words).

CRITICAL: Use "${websiteContext.websiteName}" as the actual website name - NO placeholders.

Include for ${websiteContext.websiteName}:
- How to contact about privacy matters
- Email address for privacy inquiries
- Postal address (if available)
- Response timeframe expectations
- Data Protection Officer contact (if applicable)
- Privacy-related complaint procedures
- Alternative contact methods
- Relevant to ${websiteContext.country}

HTML: <p>, <ul><li>, <strong>. ${websiteContext.primaryLanguage}. Accessible, helpful tone.`
        };

        prompt = `Context: ${websiteContext.websiteName} (${websiteContext.businessType}) in ${websiteContext.country}
Website Domain: ${websiteContext.siteDomain}
Section: "${sectionTitle}"

CRITICAL INSTRUCTION: You MUST use "${websiteContext.websiteName}" as the website name throughout the content. DO NOT use ANY placeholders like [Your Website], [Website Name], [Your Website URL], or any text in brackets. Use the actual website name "${websiteContext.websiteName}" and domain "${websiteContext.siteDomain}" provided above.

${sectionPrompts[sectionId] || `Write comprehensive, legally appropriate content for the "${sectionTitle}" section of a Privacy Policy for ${websiteContext.websiteName} (300-500 words). Include transparency about data practices, user rights, and compliance with ${websiteContext.country} laws. Use HTML <p> and <ul><li> tags. ${websiteContext.primaryLanguage} language. Use "${websiteContext.websiteName}" explicitly - NO placeholders.`}

Generate the content now:`;
        maxLength = 6000;
      }

      const requestData = {
        prompt,
        field: sectionId ? `${sectionId}_${fieldName}` : fieldName,
        maxLength,
        contentType: fieldName.includes("Title") || fieldName === "title" ? "title" : fieldName.includes("Description") ? "description" : "legal",
        websiteContext,
      };

      const response = await adminFetch("/api/admin/ai-generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate content");
      }

      const data = await response.json();
      let generatedContent = data.content || "";

      if (!generatedContent || generatedContent.trim() === "") {
        throw new Error("AI returned empty content. Please try again.");
      }

      generatedContent = generatedContent.trim();

      // Update the specific field with generated content
      if (sectionId && fieldName === "content") {
        setContent(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId
              ? { ...section, content: generatedContent }
              : section
          )
        }));
      } else if (sectionId && fieldName === "title") {
        setContent(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId
              ? { ...section, title: generatedContent }
              : section
          )
        }));
      } else {
        setContent(prev => ({
          ...prev,
          [fieldName]: generatedContent
        }));
      }

      setSuccess(`Generated with ${data.provider === 'gemini' ? 'Google Gemini' : 'OpenAI'}! ✨`);
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error("Content generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate content");
    } finally {
      setGeneratingField(null);
    }
  };

  const handleInputChange = (fieldName: string, value: string, sectionId?: string) => {
    if (sectionId) {
      setContent(prev => ({
        ...prev,
        sections: prev.sections.map(section =>
          section.id === sectionId
            ? { ...section, [fieldName]: value }
            : section
        )
      }));
    } else {
      setContent(prev => ({
        ...prev,
        [fieldName]: value
      }));
    }
  };

  const addSection = () => {
    const newSection: PrivacySection = {
      id: `section_${Date.now()}`,
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
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const saveContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          privacyPageContent: {
            ...content,
            lastUpdated: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save content");
      }

      setSuccess("Privacy Policy saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
      
      // Revalidate privacy page
      await refreshAfterChange(['privacy']);

    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save content");
    } finally {
      setLoading(false);
    }
  };

  const generateAllSections = async () => {
    try {
      setGeneratingField("bulk_all");
      setError(null);
      
      // Generate hero first
      await generateFieldContent("heroTitle");
      await new Promise(resolve => setTimeout(resolve, 1000));
      await generateFieldContent("heroSubtitle");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate meta
      await generateFieldContent("metaTitle");
      await new Promise(resolve => setTimeout(resolve, 1000));
      await generateFieldContent("metaDescription");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate all section content
      for (const section of content.sections) {
        await generateFieldContent("content", section.id);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay for content
      }
      
      setSuccess("Generated all content! ✨");
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error("Bulk generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate bulk content");
    } finally {
      setGeneratingField(null);
    }
  };

  const renderFieldWithAI = (
    label: string,
    fieldName: string,
    value: string,
    type: "input" | "textarea" = "input",
    placeholder?: string,
    sectionId?: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => generateFieldContent(fieldName, sectionId)}
          disabled={generatingField === (sectionId ? `${sectionId}_${fieldName}` : fieldName)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Generate with AI"
        >
          {generatingField === (sectionId ? `${sectionId}_${fieldName}` : fieldName) ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Wand2 className="w-3 h-3" />
          )}
          {generatingField === (sectionId ? `${sectionId}_${fieldName}` : fieldName) ? "Generating..." : "AI Generate"}
        </button>
      </div>
      
      {type === "input" ? (
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(fieldName, e.target.value, sectionId)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => handleInputChange(fieldName, e.target.value, sectionId)}
          placeholder={placeholder}
          rows={type === "textarea" && fieldName === "content" ? 12 : 3}
          className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-all duration-200 font-mono text-sm"
        />
      )}
      
      {type === "textarea" && fieldName === "content" && (
        <p className="text-xs text-gray-500">
          Characters: {value.length} | Use HTML tags: &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Privacy Policy CMS
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your Privacy Policy with AI assistance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generateAllSections}
                disabled={generatingField === "bulk_all"}
                className="flex items-center gap-2 px-4 py-2 border border-purple-600 text-purple-600 rounded text-sm font-medium hover:bg-purple-50 hover:scale-105 disabled:opacity-50 transition-all duration-200"
              >
                {generatingField === "bulk_all" ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                {generatingField === "bulk_all" ? "Generating All..." : "Generate All"}
              </button>
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:scale-105 transition-all duration-200"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={saveContent}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700 hover:scale-105 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {(error || success) && (
        <div className="bg-white border-b">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3">
              {error && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{success}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="w-full px-2 py-4">
        <div className="space-y-3">
          {/* Hero and SEO Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Hero Section */}
            <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Hero Section
              </h2>
              
              <div className="space-y-3">
                {renderFieldWithAI(
                  "Hero Title",
                  "heroTitle",
                  content.heroTitle,
                  "input",
                  "Main title for the privacy policy page"
                )}
                
                {renderFieldWithAI(
                  "Hero Subtitle",
                  "heroSubtitle", 
                  content.heroSubtitle,
                  "textarea",
                  "Subtitle explaining what users will learn"
                )}
              </div>
            </div>

            {/* SEO Metadata */}
            <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                SEO Metadata
              </h2>
              
              <div className="space-y-3">
                {renderFieldWithAI(
                  "Meta Title",
                  "metaTitle",
                  content.metaTitle,
                  "input",
                  "SEO title (50-60 characters)"
                )}
                
                {renderFieldWithAI(
                  "Meta Description",
                  "metaDescription",
                  content.metaDescription,
                  "textarea",
                  "SEO description (150-160 characters)"
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Meta Title:</span> {content.metaTitle.length}/60
                    {content.metaTitle.length > 60 && <span className="text-red-500 ml-1">Too long!</span>}
                  </div>
                  <div>
                    <span className="font-medium">Meta Description:</span> {content.metaDescription.length}/160
                    {content.metaDescription.length > 160 && <span className="text-red-500 ml-1">Too long!</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Sections */}
          <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Privacy Policy Sections
              </h2>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#303740] hover:bg-[#404854] hover:scale-105 rounded transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {content.sections.map((section, index) => (
                <div
                  key={section.id}
                  className="p-4 rounded border-2 border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-semibold text-gray-800">
                      Section {index + 1}
                    </h3>
                    {content.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 hover:scale-105 rounded transition-all duration-200"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {renderFieldWithAI(
                      "Section Title",
                      "title",
                      section.title,
                      "input",
                      "Section heading",
                      section.id
                    )}
                    
                    {renderFieldWithAI(
                      "Section Content",
                      "content",
                      section.content,
                      "textarea",
                      "Detailed content with HTML formatting",
                      section.id
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Last Updated Info */}
          {content.lastUpdated && (
            <div className="text-center text-sm text-gray-600">
              Last updated: {new Date(content.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
