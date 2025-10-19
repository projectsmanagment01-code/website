"use client";

import React, { useState, useEffect } from "react";
import { Wand2, Save, Eye, AlertCircle, CheckCircle, ArrowLeft, Trash2, Plus } from "lucide-react";
import { refreshAfterChange } from "@/lib/revalidation-utils";

interface DisclaimerSection {
  id: string;
  title: string;
  content: string;
}

interface DisclaimerPolicyContent {
  heroTitle: string;
  heroSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  sections: DisclaimerSection[];
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

const DEFAULT_SECTIONS: DisclaimerSection[] = [
  { id: "intro", title: "Introduction", content: "" },
  { id: "accuracy", title: "Information Accuracy", content: "" },
  { id: "medical", title: "Medical & Health Disclaimer", content: "" },
  { id: "nutritional", title: "Nutritional Information", content: "" },
  { id: "liability", title: "Limitation of Liability", content: "" },
  { id: "external-links", title: "External Links", content: "" },
  { id: "professional-advice", title: "Professional Advice", content: "" },
  { id: "contact", title: "Contact Information", content: "" }
];

export default function DisclaimerPolicyCMS({ onBack }: { onBack?: () => void }) {
  const [content, setContent] = useState<DisclaimerPolicyContent>({
    heroTitle: "Disclaimer",
    heroSubtitle: "Important information about the use of our website and recipes",
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
    window.open("/disclaimer", "_blank");
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
        
        if (data.disclaimerPageContent) {
          setContent(prev => ({ 
            ...prev, 
            ...data.disclaimerPageContent,
            sections: data.disclaimerPageContent.sections || DEFAULT_SECTIONS
          }));
        }
      }
    } catch (error) {
      console.error("Error loading disclaimer content:", error);
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
        prompt = `Context:\n${contextInfo}\n\nGenerate a clear 1-3 word title for disclaimer page. Professional, legal tone. Just the title:`;
        maxLength = 60;
      } else if (fieldName === "heroSubtitle") {
        prompt = `Context:\n${contextInfo}\n\nGenerate a 15-20 word subtitle explaining what disclaimers cover for ${websiteContext.websiteName}. Professional. Just the subtitle:`;
        maxLength = 150;
      } else if (fieldName === "metaTitle") {
        prompt = `Context:\n${contextInfo}\n\nGenerate 50-60 character SEO meta title for Disclaimer page. Include "${websiteContext.websiteName}" and "Disclaimer". Optimized for ${websiteContext.country}. Just the title:`;
        maxLength = 60;
      } else if (fieldName === "metaDescription") {
        prompt = `Context:\n${contextInfo}\n\nGenerate 150-160 character SEO meta description for Disclaimer. Mention liability, accuracy, ${websiteContext.websiteName}. For ${websiteContext.country} audience. Just the description:`;
        maxLength = 160;
      } else if (fieldName === "title" && sectionId) {
        const section = content.sections.find(s => s.id === sectionId);
        prompt = `Context:\n${contextInfo}\n\nGenerate 2-6 word section title for disclaimer about "${section?.title || sectionId}". Legal, clear. Just the title:`;
        maxLength = 80;
      } else if (fieldName === "content" && sectionId) {
        const section = content.sections.find(s => s.id === sectionId);
        const sectionPrompts: Record<string, string> = {
          'intro': `Write comprehensive introduction for ${websiteContext.websiteName}'s Disclaimer (300-500 words). Include: purpose, scope, acceptance of terms, legal protection. HTML: <p>, <strong>. ${websiteContext.primaryLanguage}. Professional legal tone.`,
          'accuracy': `Write about information accuracy for ${websiteContext.websiteName} (400-600 words). Cover: recipe accuracy efforts, no guarantees, user responsibility, ingredient substitutions, measurements. For ${websiteContext.businessType}. HTML: <p>, <ul><li>, <strong>. ${websiteContext.primaryLanguage}.`,
          'medical': `Write medical/health disclaimer for ${websiteContext.websiteName} (400-600 words). Cover: not medical advice, consult professionals, allergies, dietary restrictions, health conditions. ${websiteContext.country} standards. HTML: <p>, <ul><li>, <strong>. Legal, clear.`,
          'nutritional': `Write nutritional information disclaimer for ${websiteContext.websiteName} (300-500 words). Cover: estimates only, calculation methods, variations, verify independently, dietary needs. HTML: <p>, <ul><li>, <strong>. ${websiteContext.primaryLanguage}.`,
          'liability': `Write limitation of liability for ${websiteContext.websiteName} (400-600 words). Cover: no warranties, use at own risk, no liability for damages, injuries, allergies, results. ${websiteContext.country} legal framework. HTML: <p>, <ul><li>, <strong>. Legal tone.`,
          'external-links': `Write external links disclaimer for ${websiteContext.websiteName} (300-500 words). Cover: third-party links, no control, no endorsement, no responsibility, check their terms. HTML: <p>, <ul><li>, <strong>. ${websiteContext.primaryLanguage}.`,
          'professional-advice': `Write professional advice disclaimer for ${websiteContext.websiteName} (300-500 words). Cover: not professional advice, consult experts, specific situations, individual needs. ${websiteContext.businessType} context. HTML: <p>, <ul><li>, <strong>.`,
          'contact': `Write contact information section for ${websiteContext.websiteName} disclaimer (200-300 words). Include: how to reach for questions, response time expectations, email/form options. HTML: <p>, <strong>. ${websiteContext.primaryLanguage}. Professional, welcoming.`
        };

        prompt = sectionPrompts[sectionId] || `Write detailed content about ${section?.title} for ${websiteContext.websiteName} disclaimer (300-500 words). HTML format. ${websiteContext.primaryLanguage}. Professional legal tone.`;
        maxLength = 6000;
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
      } else if (sectionId && fieldName === "title") {
        setContent(prev => ({
          ...prev,
          sections: prev.sections.map(s =>
            s.id === sectionId ? { ...s, title: data.content } : s
          ),
        }));
      } else {
        setContent(prev => ({ ...prev, [fieldName]: data.content }));
      }

      setSuccess(`Generated ${fieldName} successfully!`);
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

      setSuccess("All content generated successfully!");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError("Failed to generate all content");
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

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          disclaimerPageContent: updatedContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setContent(updatedContent);
      setSuccess("Saved successfully!");
      setTimeout(() => setSuccess(null), 3000);

      await refreshAfterChange("/disclaimer");
    } catch (err) {
      setError("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    const newSection: DisclaimerSection = {
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Disclaimer CMS</h1>
                <p className="text-sm text-gray-600">Manage your disclaimer with AI assistance</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGenerateAll}
                disabled={loading || generatingField !== null}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Wand2 className="w-4 h-4" />
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

        {/* Hero & SEO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" style={{backgroundColor: '#f0f0f0'}}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={content.heroTitle}
                    onChange={(e) => setContent(prev => ({ ...prev, heroTitle: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Disclaimer"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                <div className="flex gap-2">
                  <textarea
                    value={content.heroSubtitle}
                    onChange={(e) => setContent(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="Important information..."
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

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" style={{backgroundColor: '#f0f0f0'}}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Metadata</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={content.metaTitle}
                    onChange={(e) => setContent(prev => ({ ...prev, metaTitle: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Disclaimer - Your Website"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <div className="flex gap-2">
                  <textarea
                    value={content.metaDescription}
                    onChange={(e) => setContent(prev => ({ ...prev, metaDescription: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="Read our disclaimer..."
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

        {/* Sections */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" style={{backgroundColor: '#f0f0f0'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Disclaimer Sections</h2>
            <button
              onClick={addSection}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>

          <div className="space-y-6">
            {content.sections.map((section) => (
              <div key={section.id} className="bg-white rounded-lg border border-gray-300 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-gray-900">{section.title}</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newSections = content.sections.map(s =>
                          s.id === section.id ? { ...s, title: e.target.value } : s
                        );
                        setContent(prev => ({ ...prev, sections: newSections }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Content</label>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                      rows={6}
                      placeholder="Section content (HTML supported)..."
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
