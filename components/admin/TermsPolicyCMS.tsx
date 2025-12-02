"use client";

import React, { useState, useEffect } from "react";
import { Wand2, Save, Eye, AlertCircle, CheckCircle, ArrowLeft, Trash2, Plus } from "lucide-react";
import { refreshAfterChange } from "@/lib/revalidation-utils";
import { adminFetch } from '@/lib/admin-fetch';

interface TermsSection {
  id: string;
  title: string;
  content: string;
}

interface TermsPolicyContent {
  heroTitle: string;
  heroSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  sections: TermsSection[];
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

const DEFAULT_SECTIONS: TermsSection[] = [
  { id: "intro", title: "Introduction", content: "" },
  { id: "acceptance", title: "Acceptance of Terms", content: "" },
  { id: "user-accounts", title: "User Accounts", content: "" },
  { id: "content-usage", title: "Content Usage Rights", content: "" },
  { id: "prohibited", title: "Prohibited Activities", content: "" },
  { id: "intellectual-property", title: "Intellectual Property", content: "" },
  { id: "termination", title: "Termination", content: "" },
  { id: "modifications", title: "Modifications to Terms", content: "" },
  { id: "governing-law", title: "Governing Law", content: "" },
  { id: "contact", title: "Contact Us", content: "" }
];

export default function TermsPolicyCMS({ onBack }: { onBack?: () => void }) {
  const [content, setContent] = useState<TermsPolicyContent>({
    heroTitle: "Terms of Service",
    heroSubtitle: "Terms and conditions for using our website",
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
    window.open("/terms", "_blank");
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
        
        if (data.termsPageContent) {
          setContent(prev => ({ 
            ...prev, 
            ...data.termsPageContent,
            sections: data.termsPageContent.sections || DEFAULT_SECTIONS
          }));
        }
      }
    } catch (error) {
      console.error("Error loading terms content:", error);
      setError("Failed to load content");
    }
  };

  const getWebsiteContext = (): WebsiteContext => {
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
        prompt = `Context:\n${contextInfo}\n\nGenerate 1-4 word title for terms of service page. Professional legal. Just the title:`;
        maxLength = 60;
      } else if (fieldName === "heroSubtitle") {
        prompt = `Context:\n${contextInfo}\n\nGenerate 15-20 word subtitle for ${websiteContext.websiteName} terms page. Explain what's covered. Just the subtitle:`;
        maxLength = 150;
      } else if (fieldName === "metaTitle") {
        prompt = `Context:\n${contextInfo}\n\nGenerate 50-60 character SEO meta title for Terms page. Include "${websiteContext.websiteName}". Optimized for ${websiteContext.country}. Just the title:`;
        maxLength = 60;
      } else if (fieldName === "metaDescription") {
        prompt = `Context:\n${contextInfo}\n\nGenerate 150-160 character SEO meta description for Terms. Mention usage rules, rights, ${websiteContext.websiteName}. ${websiteContext.country} audience. Just the description:`;
        maxLength = 160;
      } else if (fieldName === "content" && sectionId) {
        const sectionPrompts: Record<string, string> = {
          'intro': `Generate a Terms of Service introduction for ${websiteContext.websiteName}. Explain the purpose of these terms, the agreement users accept by using the site, and user obligations. Use HTML paragraphs (<p>) and bold text (<strong>). Write in ${websiteContext.primaryLanguage}. Professional legal tone. 300-500 words. Return ONLY the HTML content, no explanations.`,
          'acceptance': `Generate an acceptance of terms section for ${websiteContext.websiteName}. Address the binding nature of the agreement, user capacity to accept terms, and restrictions for minors according to ${websiteContext.country} legal framework. Use HTML paragraphs (<p>), lists (<ul><li>), and bold (<strong>). 400-600 words. Return ONLY the HTML content.`,
          'user-accounts': `Generate a user accounts section for ${websiteContext.websiteName}. Address account registration requirements, account security responsibilities, user duties, and account suspension conditions. Use HTML paragraphs (<p>), lists (<ul><li>), and bold (<strong>). Write in ${websiteContext.primaryLanguage}. 400-600 words. Return ONLY the HTML content.`,
          'content-usage': `Generate a content usage rights section for ${websiteContext.websiteName}, a ${websiteContext.businessType}. Address permitted personal use, recipe printing rights, content sharing rules, and attribution requirements. Use HTML paragraphs (<p>), lists (<ul><li>), and bold (<strong>). 400-600 words. Return ONLY the HTML content.`,
          'prohibited': `Generate a prohibited activities section for ${websiteContext.websiteName}. List forbidden actions including illegal use, content scraping, spamming, posting harmful content, and unauthorized commercial use per ${websiteContext.country} laws. Use HTML paragraphs (<p>), lists (<ul><li>), and bold (<strong>). Clear and firm tone. 400-600 words. Return ONLY the HTML content.`,
          'intellectual-property': `Generate an intellectual property section for ${websiteContext.websiteName}. Address content ownership, copyrights, trademarks, recipe rights, image rights, and user-submitted content. Use HTML paragraphs (<p>), lists (<ul><li>), and bold (<strong>). Legal tone. 400-600 words. Return ONLY the HTML content.`,
          'termination': `Generate a termination section for ${websiteContext.websiteName}. Address account suspension rights, account deletion process, which terms survive termination, and consequences of termination. Use HTML paragraphs (<p>), lists (<ul><li>), and bold (<strong>). Write in ${websiteContext.primaryLanguage}. 300-500 words. Return ONLY the HTML content.`,
          'modifications': `Generate a modifications to terms section for ${websiteContext.websiteName}. Address the right to change terms, how users will be notified, and how continued use constitutes acceptance of changes. Use HTML paragraphs (<p>) and bold (<strong>). Professional tone. 300-500 words. Return ONLY the HTML content.`,
          'governing-law': `Generate a governing law section for ${websiteContext.websiteName}. Specify jurisdiction (${websiteContext.country}), dispute resolution processes, and arbitration procedures. Use HTML paragraphs (<p>), lists (<ul><li>), and bold (<strong>). Legal tone. 300-500 words. Return ONLY the HTML content.`,
          'contact': `Generate a contact section for ${websiteContext.websiteName}'s Terms of Service. Explain how users can contact about terms-related questions and expected response time. Use HTML paragraphs (<p>) and bold (<strong>). Write in ${websiteContext.primaryLanguage}. Professional tone. 200-300 words. Return ONLY the HTML content.`
        };

        prompt = sectionPrompts[sectionId] || `Generate detailed terms section content about "${sectionId}" for ${websiteContext.websiteName}. Use HTML paragraphs (<p>), lists (<ul><li>), and bold (<strong>). Professional legal tone. 300-500 words. Return ONLY the HTML content, no explanations.`;
        maxLength = 6000;
      }

      const response = await adminFetch("/api/admin/ai-generate-content", {
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
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      
      if (sectionId && fieldName === "content") {
        setContent(prev => ({
          ...prev,
          sections: prev.sections.map(s =>
            s.id === sectionId ? { ...s, content: data.content } : s
          ),
        }));
      } else {
        setContent(prev => ({ ...prev, [fieldName]: data.content }));
      }

      setSuccess(`Generated successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setGeneratingField(null);
    }
  };

  const handleGenerateAll = async () => {
    setLoading(true);
    setError(null);

    try {
      await generateFieldContent("heroTitle");
      await generateFieldContent("heroSubtitle");
      await generateFieldContent("metaTitle");
      await generateFieldContent("metaDescription");

      for (const section of content.sections) {
        await generateFieldContent("content", section.id);
      }

      setSuccess("All content generated!");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError("Failed to generate all");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const updatedContent = {
        ...content,
        lastUpdated: new Date().toISOString(),
      };

      const response = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          termsPageContent: updatedContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save");
      }

      setContent(updatedContent);
      setSuccess("Saved successfully!");
      setTimeout(() => setSuccess(null), 3000);

      await refreshAfterChange("/terms");
    } catch (err) {
      setError("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    const newSection: TermsSection = {
      id: `custom-${Date.now()}`,
      title: "New Section",
      content: "",
    };
    setContent(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const removeSection = (sectionId: string) => {
    setContent(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Terms of Service CMS</h1>
                <p className="text-sm text-gray-600">Manage terms with AI assistance</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGenerateAll}
                disabled={loading || generatingField !== null}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Generate All
              </button>
              <button
                onClick={handlePreview}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6" style={{backgroundColor: '#f0f0f0'}}>
            <h2 className="text-lg font-semibold mb-4">Hero Section</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Hero Title</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={content.heroTitle}
                    onChange={(e) => setContent(prev => ({ ...prev, heroTitle: e.target.value }))}
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  <button
                    onClick={() => generateFieldContent("heroTitle")}
                    disabled={generatingField === "heroTitle"}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md"
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                <div className="flex gap-2">
                  <textarea
                    value={content.heroSubtitle}
                    onChange={(e) => setContent(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                    className="flex-1 px-3 py-2 border rounded-md"
                    rows={2}
                  />
                  <button
                    onClick={() => generateFieldContent("heroSubtitle")}
                    disabled={generatingField === "heroSubtitle"}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md"
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6" style={{backgroundColor: '#f0f0f0'}}>
            <h2 className="text-lg font-semibold mb-4">SEO Metadata</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Meta Title</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={content.metaTitle}
                    onChange={(e) => setContent(prev => ({ ...prev, metaTitle: e.target.value }))}
                    className="flex-1 px-3 py-2 border rounded-md"
                    maxLength={60}
                  />
                  <button
                    onClick={() => generateFieldContent("metaTitle")}
                    disabled={generatingField === "metaTitle"}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md"
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{content.metaTitle.length}/60</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Meta Description</label>
                <div className="flex gap-2">
                  <textarea
                    value={content.metaDescription}
                    onChange={(e) => setContent(prev => ({ ...prev, metaDescription: e.target.value }))}
                    className="flex-1 px-3 py-2 border rounded-md"
                    rows={2}
                    maxLength={160}
                  />
                  <button
                    onClick={() => generateFieldContent("metaDescription")}
                    disabled={generatingField === "metaDescription"}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md"
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{content.metaDescription.length}/160</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6" style={{backgroundColor: '#f0f0f0'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Terms Sections</h2>
            <button
              onClick={addSection}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>

          <div className="space-y-6">
            {content.sections.map((section) => (
              <div key={section.id} className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold">{section.title}</h3>
                  {!section.id.includes("intro") && !section.id.includes("contact") && (
                    <button
                      onClick={() => removeSection(section.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Section Title</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newSections = content.sections.map(s =>
                          s.id === section.id ? { ...s, title: e.target.value } : s
                        );
                        setContent(prev => ({ ...prev, sections: newSections }));
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Content</label>
                      <button
                        onClick={() => generateFieldContent("content", section.id)}
                        disabled={generatingField === `${section.id}_content`}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                      >
                        <Wand2 className="w-3 h-3" />
                        AI Generate
                      </button>
                    </div>
                    <textarea
                      value={section.content}
                      onChange={(e) => {
                        const newSections = content.sections.map(s =>
                          s.id === section.id ? { ...s, content: e.target.value } : s
                        );
                        setContent(prev => ({ ...prev, sections: newSections }));
                      }}
                      className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">{section.content.length} characters</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {content.lastUpdated && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Last updated: {new Date(content.lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
