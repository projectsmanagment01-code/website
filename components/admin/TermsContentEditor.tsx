"use client";

import React, { useState, useEffect } from "react";
import {
  Wand2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Save,
  Eye,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import { refreshAfterChange } from "@/lib/revalidation-utils";

interface TermsSection {
  id: string;
  title: string;
  content: string;
}

interface TermsContent {
  heroTitle: string;
  heroSubtitle: string;
  sections: TermsSection[];
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string | null;
}

const defaultSections: TermsSection[] = [
  { id: "agreement", title: "Agreement to Terms", content: "" },
  { id: "license", title: "Use License", content: "" },
  { id: "acceptable-use", title: "Acceptable Use", content: "" },
  { id: "user-content", title: "User Content", content: "" },
  { id: "intellectual-property", title: "Intellectual Property", content: "" },
  { id: "disclaimers", title: "Disclaimers", content: "" },
  { id: "limitation-liability", title: "Limitation of Liability", content: "" },
  { id: "changes", title: "Changes to Terms", content: "" },
];

export default function TermsContentEditor({ onBack }: { onBack?: () => void }) {
  const [content, setContent] = useState<TermsContent>({
    heroTitle: "",
    heroSubtitle: "",
    sections: defaultSections,
    metaTitle: "",
    metaDescription: "",
    lastUpdated: null,
  });

  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
    loadSiteSettings();
  }, []);

  const loadSiteSettings = async () => {
    try {
      const response = await fetch("/api/admin/content/site", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSiteSettings(data);
      }
    } catch (error) {
      console.error("Error loading site settings:", error);
    }
  };

  const loadContent = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.termsPageContent) {
          setContent(data.termsPageContent);
        }
      }
    } catch (error) {
      console.error("Error loading content:", error);
      setMessage({
        type: "error",
        text: "Failed to load content"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMetaField = (field: 'heroTitle' | 'heroSubtitle' | 'metaTitle' | 'metaDescription', value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const updateSection = (sectionId: string, field: 'title' | 'content', value: string) => {
    setContent(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    }));
  };

  const addSection = () => {
    const newSection: TermsSection = {
      id: `section-${Date.now()}`,
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

  const generateMetaContent = async (field: 'heroTitle' | 'heroSubtitle' | 'metaTitle' | 'metaDescription') => {
    try {
      setGenerating(`meta-${field}`);
      setMessage(null);

      const websiteName = siteSettings?.websiteName || siteSettings?.logoText || "Recipe Website";
      const businessType = siteSettings?.businessType || "Recipe Blog";
      const ownerName = siteSettings?.ownerName || "Website Owner";
      const country = siteSettings?.country || "United States";
      const primaryLanguage = siteSettings?.primaryLanguage || "English";

      const contextInfo = `Website: "${websiteName}"
Business Type: ${businessType}
Owner: ${ownerName}
Language: ${primaryLanguage}
Country: ${country}`;

      let prompt = "";
      let maxLength = 200;

      if (field === 'heroTitle') {
        prompt = `Context:
${contextInfo}

Task: Generate a clear, professional 2-4 word title for the Terms & Conditions page of ${websiteName}. Should be formal and legally appropriate. Use ${primaryLanguage} language. No explanations, just the title:`;
        maxLength = 60;
      } else if (field === 'heroSubtitle') {
        prompt = `Context:
${contextInfo}

Task: Generate a professional 15-25 word subtitle for the Terms & Conditions hero section. Should explain that this page contains the legal terms for using ${websiteName} services. Use ${primaryLanguage} language. No explanations, just the subtitle:`;
        maxLength = 150;
      } else if (field === 'metaTitle') {
        prompt = `Context:
${contextInfo}

Task: Generate a 50-60 character SEO meta title for the Terms & Conditions page. Should include "${websiteName}" and communicate legal terms. Optimized for ${country} search results. Use ${primaryLanguage} language. No explanations, just the title:`;
        maxLength = 60;
      } else {
        prompt = `Context:
${contextInfo}

Task: Generate a 150-160 character SEO meta description for the Terms & Conditions page. Should explain that visitors can read the terms of service, usage rules, and legal agreements for ${websiteName}. Optimized for ${country} searchers. Use ${primaryLanguage} language. No explanations, just the description:`;
        maxLength = 160;
      }

      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/ai-generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          field,
          contentType: field.includes('Title') ? "title" : "description",
          maxLength,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const generatedContent = result.content.trim();
        updateMetaField(field, generatedContent);
        setMessage({
          type: "success",
          text: `Generated ${field} with ${result.provider === 'gemini' ? 'Google Gemini' : 'OpenAI'}! ✨`
        });
      } else {
        throw new Error(result.error || "Failed to generate content");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to generate content"
      });
    } finally {
      setGenerating(null);
    }
  };

  const generateSectionContent = async (sectionId: string, field: 'title' | 'content') => {
    try {
      setGenerating(`${sectionId}-${field}`);
      setMessage(null);

      const section = content.sections.find(s => s.id === sectionId);
      if (!section) return;

      const websiteName = siteSettings?.websiteName || siteSettings?.logoText || "Recipe Website";
      const businessType = siteSettings?.businessType || "Recipe Blog";
      const ownerName = siteSettings?.ownerName || "Website Owner";
      const country = siteSettings?.country || "United States";
      const primaryLanguage = siteSettings?.primaryLanguage || "English";
      const siteDomain = siteSettings?.siteDomain || "example.com";

      const contextInfo = `Website: "${websiteName}"
Business Type: ${businessType}
Owner: ${ownerName}
Language: ${primaryLanguage}
Country: ${country}
Domain: ${siteDomain}`;

      let prompt = "";
  let maxLength = 6000; // allow full policy sections to render without clipping

      if (field === 'title') {
        prompt = `Generate a clear 2-5 word section title for Terms & Conditions about "${section.title}". Professional and legally appropriate.`;
        maxLength = 80;
      } else {
        // Simplified, focused prompts based on section
        const sectionPrompts: Record<string, string> = {
          'agreement': `Write comprehensive terms agreement section (250-400 words). Cover: binding agreement statement, acceptance by using service, who can use (age, capacity), what if don't agree, jurisdiction (${country}), governing law. Multiple paragraphs with HTML <p> tags.`,
          
          'license': `Write detailed use license section for ${businessType} (250-400 words). Cover: grant of limited license, what permitted (view, personal use), what NOT permitted (commercial, reproduction, modification), recipe republishing restrictions, license limitations, IP protections. Use HTML <p> and <ul><li> tags. Multiple paragraphs.`,
          
          'acceptable-use': `Write comprehensive acceptable use section (250-400 words). Cover: prohibited activities (harassment, spam, illegal content, hacking), user conduct expectations, content posting guidelines, recipe submission rules, comment policy, violation consequences. Use HTML <p> and <ul><li> tags. Multiple paragraphs.`,
          
          'user-content': `Write detailed user content section (250-400 words). Cover: ownership of user content (comments, reviews, recipe variations), license granted to ${websiteName}, user representations about content, content moderation rights, removal procedures, ${businessType} content rules. Use HTML <p> tags. Multiple paragraphs.`,
          
          'intellectual-property': `Write comprehensive IP section for ${businessType} (250-400 words). Cover: ownership of content (recipes, photos, text, design), copyright protections, trademarks, recipe attribution requirements, DMCA compliance, how to report infringement. Use HTML <p> and <ul><li> tags. Multiple paragraphs.`,
          
          'disclaimers': `Write detailed disclaimers section for ${businessType} (250-400 words). Cover: no warranty on recipe results, "as-is" disclaimer, no accuracy guarantee, nutritional info disclaimers, food safety disclaimers, third-party link disclaimers, service availability, ${country} legal disclaimers. Use HTML <p> and <ul><li> tags. Multiple paragraphs.`,
          
          'limitation-liability': `Write comprehensive liability limitation section (250-400 words). Cover: limitation for ${ownerName} and ${websiteName}, no liability for recipe outcomes/allergic reactions/food safety, indirect damages limitations, maximum liability, ${country} liability limits, ${businessType} liability issues. Use HTML <p> tags. Multiple paragraphs.`,
          
          'changes': `Write terms changes section (150-250 words). Cover: right to modify terms, how users notified, effective date of changes, continued use = acceptance, material changes notification, historical version access. Use HTML <p> tags. Multiple paragraphs.`
        };

        prompt = sectionPrompts[section.id] || `Write comprehensive terms & conditions content for "${section.title}" (250-400 words). Be legally sound, formal, protective. Cover all relevant aspects for ${businessType}. Comply with ${country} laws. Use HTML <p> and <ul><li> tags. Multiple detailed paragraphs.`;
        
        // Add context
        prompt = `Context: ${websiteName} (${businessType}) owned by ${ownerName} in ${country}, language: ${primaryLanguage}

${prompt}

Write FULL paragraphs (not summaries). Use proper HTML formatting. Be legally protective.`;
  maxLength = 6000;
      }

      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/ai-generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          field: `${sectionId}-${field}`,
          contentType: field === 'title' ? "title" : "paragraph",
          maxLength,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const generatedContent = result.content?.trim() || "";
        
        // Check if content is actually empty
        if (!generatedContent || generatedContent.length === 0) {
          throw new Error("Generated content is empty. Please try again.");
        }
        
        updateSection(sectionId, field, generatedContent);
        setMessage({
          type: "success",
          text: `Generated ${field} with ${result.provider === 'gemini' ? 'Google Gemini' : 'OpenAI'}! ✨ (${generatedContent.length} characters)`
        });
      } else {
        throw new Error(result.error || "Failed to generate content");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to generate content"
      });
    } finally {
      setGenerating(null);
    }
  };

  const saveContent = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          termsPageContent: {
            ...content,
            lastUpdated: new Date().toISOString(),
          }
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Terms content saved successfully!"
        });
        await loadContent();
        await refreshAfterChange(['terms']);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save content"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open("/terms", "_blank");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>
            <p className="text-gray-600">
              Manage terms of service content with AI assistance
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded ${
          message.type === "success"
            ? "bg-orange-50 border border-orange-200 text-orange-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handlePreview}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 hover:scale-105 transition-all duration-200"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>

        <button
          onClick={saveContent}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700 hover:scale-105 disabled:opacity-50 transition-all duration-200"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-3">
        {/* Hero Section */}
        <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Hero Section
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Hero Title
                </label>
                <button
                  onClick={() => generateMetaContent('heroTitle')}
                  disabled={generating === 'meta-heroTitle'}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                  title="Generate with AI"
                >
                  {generating === 'meta-heroTitle' ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  AI
                </button>
              </div>
              <input
                type="text"
                value={content.heroTitle}
                onChange={(e) => updateMetaField('heroTitle', e.target.value)}
                placeholder="Main heading for terms page"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Hero Subtitle
                </label>
                <button
                  onClick={() => generateMetaContent('heroSubtitle')}
                  disabled={generating === 'meta-heroSubtitle'}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                  title="Generate with AI"
                >
                  {generating === 'meta-heroSubtitle' ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  AI
                </button>
              </div>
              <textarea
                value={content.heroSubtitle}
                onChange={(e) => updateMetaField('heroSubtitle', e.target.value)}
                placeholder="Supporting text for hero section"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Terms Sections
            </h2>
            <button
              onClick={addSection}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#303740] hover:bg-[#404854] hover:scale-105 rounded transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>

          <div className="space-y-4">
            {content.sections.map((section, index) => (
              <div
                key={section.id}
                className="p-4 rounded border-2 border-gray-300 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 bg-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">Section {index + 1}</span>
                  {content.sections.length > 1 && (
                    <button
                      onClick={() => removeSection(section.id)}
                      className="p-1 text-white bg-red-600 hover:bg-red-700 hover:scale-110 rounded transition-all duration-200"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-700">Section Title</label>
                      <button
                        onClick={() => generateSectionContent(section.id, "title")}
                        disabled={generating === `${section.id}-title`}
                        className="p-1 text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                      >
                        {generating === `${section.id}-title` ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Wand2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-sm transition-all duration-200"
                      placeholder="Section title"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-700">Section Content</label>
                      <button
                        onClick={() => generateSectionContent(section.id, "content")}
                        disabled={generating === `${section.id}-content`}
                        className="p-1 text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                      >
                        {generating === `${section.id}-content` ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Wand2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                      rows={6}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-sm resize-vertical transition-all duration-200 font-mono"
                      placeholder="Section content (HTML supported)"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Metadata */}
        <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            SEO Metadata
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Meta Title
                </label>
                <button
                  onClick={() => generateMetaContent('metaTitle')}
                  disabled={generating === 'meta-metaTitle'}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                  title="Generate with AI"
                >
                  {generating === 'meta-metaTitle' ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  AI
                </button>
              </div>
              <input
                type="text"
                value={content.metaTitle}
                onChange={(e) => updateMetaField('metaTitle', e.target.value)}
                placeholder="SEO title for terms page"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <div className="text-xs text-gray-600 mt-1">
                {content.metaTitle.length}/60 characters
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Meta Description
                </label>
                <button
                  onClick={() => generateMetaContent('metaDescription')}
                  disabled={generating === 'meta-metaDescription'}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                  title="Generate with AI"
                >
                  {generating === 'meta-metaDescription' ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  AI
                </button>
              </div>
              <textarea
                value={content.metaDescription}
                onChange={(e) => updateMetaField('metaDescription', e.target.value)}
                placeholder="SEO description for terms page"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-all duration-200"
              />
              <div className="text-xs text-gray-600 mt-1">
                {content.metaDescription.length}/160 characters
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
