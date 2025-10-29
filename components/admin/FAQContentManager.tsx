"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Wand2,
} from "lucide-react";
import { refreshAfterChange } from "@/lib/revalidation-utils";
import { adminFetch } from '@/lib/admin-fetch';

export default function FAQContentManager({ onBack }: { onBack?: () => void }) {
  const [content, setContent] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroIntro, setHeroIntro] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
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
        console.log("FAQ CMS - Loaded settings:", data);
        console.log("FAQ CMS - aiContextSettings:", data.aiContextSettings);
        setSettings(data);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const loadContent = async () => {
    try {
      const response = await adminFetch("/api/admin/content/faq", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.content || "");
        setHeroTitle(data.heroTitle || "Frequently Asked Questions");
        setHeroIntro(data.heroIntro || "Find answers to common questions about our recipes and cooking tips.");
        setMetaTitle(data.metaTitle || "FAQ - Frequently Asked Questions");
        setMetaDescription(data.metaDescription || "Get answers to frequently asked questions about recipes, cooking tips, and website features.");
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus("saving");
    
    try {
      const response = await adminFetch("/api/admin/content/faq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          content: content,
          heroTitle: heroTitle,
          heroIntro: heroIntro,
          metaTitle: metaTitle,
          metaDescription: metaDescription,
          lastUpdated: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        
        // Immediately revalidate FAQ page
        await refreshAfterChange(['faq']);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error saving content:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setLoading(false);
    }
  };

  const generateFAQContent = async () => {
    setIsGenerating(true);
    
    try {
      const token = localStorage.getItem("admin_token");
      
      const aiSettingsResponse = await adminFetch("/api/admin/ai-settings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!aiSettingsResponse.ok) {
        throw new Error("Failed to load AI settings");
      }

      const aiSettings = await aiSettingsResponse.json();
      const provider = aiSettings.apiKeys.gemini ? 'gemini' : 'openai';
      
      const websiteContext = getWebsiteContext();
      
      const promptLines = [
        `CRITICAL INSTRUCTIONS - READ CAREFULLY:`,
        `- Website Name: "${websiteContext.websiteName}"`,
        `- Business Type: ${websiteContext.businessType}`,
        `- Owner: ${websiteContext.ownerName}`,
        `- Country: ${websiteContext.country}`,
        ``,
        `YOU MUST use "${websiteContext.websiteName}" in your responses.`,
        `DO NOT use placeholders like "[Website Name]", "[Your Website]", "Your Website", or "localhost".`,
        ``,
        `Generate a complete FAQ page in HTML format for ${websiteContext.websiteName}, a ${websiteContext.businessType}.`,
        "",
        "You must create EXACTLY 5 categories with 4-5 questions each.",
        "",
        "Categories (in order):",
        "1. Getting Started",
        "2. Cooking & Recipes", 
        "3. Meal Planning",
        "4. Cooking Tips",
        "5. Website Features",
        "",
        "Use this HTML structure for each category:",
        "",
        '<div class="space-y-6 mb-12">',
        '  <div class="flex items-center justify-between uppercase">',
        '    <h2 class="text-neutral-900 text-[24.96px] font-bold items-center box-border flex basis-[0%] grow leading-[29.952px] md:text-[36.48px] md:leading-[43.776px] after:accent-auto after:bg-zinc-200 after:box-border after:text-neutral-900 after:block after:basis-[0%] after:grow after:text-[24.96px] after:not-italic after:normal-nums after:font-bold after:h-1.5 after:tracking-[normal] after:leading-[29.952px] after:list-outside after:list-disc after:min-w-4 after:outline-dashed after:outline-1 after:text-start after:indent-[0px] after:uppercase after:visible after:w-full after:ml-4 after:rounded-lg after:border-separate after:font-system_ui after:md:text-[36.48px] after:md:leading-[43.776px] before:bg-zinc-200 before:box-border before:text-neutral-900 before:block before:basis-[0%] before:grow before:text-[24.96px] before:not-italic before:normal-nums before:font-bold before:h-1.5 before:tracking-[normal] before:leading-[29.952px] before:list-outside before:list-disc before:min-w-4 before:outline-dashed before:outline-1 before:text-start before:indent-[0px] before:uppercase before:visible before:w-full before:mr-4 before:rounded-lg before:border-separate before:font-system_ui before:md:text-[36.48px] before:md:leading-[43.776px]">CATEGORY NAME</h2>',
        '  </div>',
        '  <div class="space-y-4 w-full flex flex-col">',
        '    <details class="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-600 text-gray-600">',
        '      <summary class="text-xl font-medium cursor-pointer hover:text-gray-800 transition-colors">Question?</summary>',
        '      <div class="mt-6"><p class="text-base leading-relaxed">Answer.</p></div>',
        '    </details>',
        '  </div>',
        '</div>',
        "",
        'Start output with: <div class="bg-white min-h-screen mt-4"><div class="my-12 space-y-12 flex flex-col">',
        'End output with: </div></div>',
        "",
        `Generate all 5 categories completely for ${websiteContext.websiteName}. Keep answers brief (1-2 sentences).`
      ];
      
      const prompt = promptLines.join('\n');

      const response = await adminFetch("/api/admin/ai-generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          provider: provider,
          maxLength: 12000,
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        let generatedContent = result.content;
        
        // Clean up the content if it has markdown wrapping
        generatedContent = generatedContent.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();
        
        setContent(generatedContent);
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        throw new Error(result.error || "Failed to generate FAQ content");
      }
    } catch (error) {
      console.error("Error generating FAQ content:", error);
      alert("Failed to generate FAQ content: " + (error instanceof Error ? error.message : String(error)));
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const getWebsiteContext = () => {
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

  const generateFieldContent = async (fieldType: string) => {
    setGeneratingField(fieldType);
    
    try {
      const token = localStorage.getItem("admin_token");
      
      const aiSettingsResponse = await adminFetch("/api/admin/ai-settings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!aiSettingsResponse.ok) {
        throw new Error("Failed to load AI settings");
      }

      const aiSettings = await aiSettingsResponse.json();
      const provider = aiSettings.apiKeys.gemini ? 'gemini' : 'openai';
      
      const websiteContext = getWebsiteContext();
      const contextInfo = `
CRITICAL INSTRUCTIONS - READ CAREFULLY:
- Website Name: "${websiteContext.websiteName}"
- Business Type: ${websiteContext.businessType}
- Owner: ${websiteContext.ownerName}
- Country: ${websiteContext.country}
- Language: ${websiteContext.primaryLanguage}
- Domain: ${websiteContext.siteDomain}

YOU MUST use the actual website name "${websiteContext.websiteName}" in your response.
DO NOT use placeholders like "[Website Name]", "[Your Website]", "Your Website", "localhost", or any generic terms.
ALWAYS use the specific website name provided above.
`;
      
      let prompt = "";
      let maxLength = 150;
      
      switch (fieldType) {
        case "heroTitle":
          prompt = `${contextInfo}\n\nGenerate a compelling 4-6 word title for a FAQ page. Make it welcoming and informative. Return only the title, no quotes or extra text.`;
          maxLength = 60;
          break;
        case "heroIntro":
          prompt = `${contextInfo}\n\nWrite a friendly 2-sentence introduction for a FAQ page for ${websiteContext.websiteName}. Explain what users can find and encourage them to browse. Return only the intro text.`;
          maxLength = 200;
          break;
        case "metaTitle":
          prompt = `${contextInfo}\n\nGenerate an SEO-optimized meta title (under 60 characters) for FAQ page. Include "${websiteContext.websiteName}" and "FAQ". Return only the title.`;
          maxLength = 60;
          break;
        case "metaDescription":
          prompt = `${contextInfo}\n\nWrite an SEO meta description (under 160 characters) for ${websiteContext.websiteName}'s FAQ page. Mention that users can find answers about recipes, cooking tips, and website features. Return only the description.`;
          maxLength = 160;
          break;
      }

      const response = await adminFetch("/api/admin/ai-generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          provider: provider,
          maxLength: maxLength,
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        let generatedContent = result.content.trim();
        
        // Remove quotes if present
        generatedContent = generatedContent.replace(/^["']|["']$/g, "");
        
        switch (fieldType) {
          case "heroTitle":
            setHeroTitle(generatedContent);
            break;
          case "heroIntro":
            setHeroIntro(generatedContent);
            break;
          case "metaTitle":
            setMetaTitle(generatedContent);
            break;
          case "metaDescription":
            setMetaDescription(generatedContent);
            break;
        }
        
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        throw new Error(result.error || `Failed to generate ${fieldType}`);
      }
    } catch (error) {
      console.error(`Error generating ${fieldType}:`, error);
      alert(`Failed to generate ${fieldType}: ` + (error instanceof Error ? error.message : String(error)));
    } finally {
      setGeneratingField(null);
    }
  };

  const handlePreview = () => {
    window.open("/faq", "_blank");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">FAQ</h1>
            <p className="text-gray-600">
              Manage your website's frequently asked questions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
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

      {/* Save Status */}
      {saveStatus !== "idle" && (
        <div className="bg-white border-b">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3">
              {saveStatus === "saving" && (
                <div className="flex items-center gap-2 text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Saving changes...</span>
                </div>
              )}
              {saveStatus === "success" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Changes saved successfully!</span>
                </div>
              )}
              {saveStatus === "error" && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Error saving changes. Please try again.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Hero Section
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Hero Title
                  </label>
                  <button
                    onClick={() => generateFieldContent("heroTitle")}
                    disabled={generatingField === "heroTitle" || !!generatingField}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                  >
                    {generatingField === "heroTitle" ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    {generatingField === "heroTitle" ? "Generating..." : "AI Generate"}
                  </button>
                </div>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter hero title"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Hero Introduction
                  </label>
                  <button
                    onClick={() => generateFieldContent("heroIntro")}
                    disabled={generatingField === "heroIntro" || !!generatingField}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                  >
                    {generatingField === "heroIntro" ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    {generatingField === "heroIntro" ? "Generating..." : "AI Generate"}
                  </button>
                </div>
                <textarea
                  value={heroIntro}
                  onChange={(e) => setHeroIntro(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter hero introduction"
                />
              </div>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              SEO Metadata
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Meta Title
                  </label>
                  <button
                    onClick={() => generateFieldContent("metaTitle")}
                    disabled={generatingField === "metaTitle" || !!generatingField}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                  >
                    {generatingField === "metaTitle" ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    {generatingField === "metaTitle" ? "Generating..." : "AI Generate"}
                  </button>
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter meta title"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 50-60 characters ({metaTitle.length} characters)
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Meta Description
                  </label>
                  <button
                    onClick={() => generateFieldContent("metaDescription")}
                    disabled={generatingField === "metaDescription" || !!generatingField}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                  >
                    {generatingField === "metaDescription" ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    {generatingField === "metaDescription" ? "Generating..." : "AI Generate"}
                  </button>
                </div>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter meta description"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 150-160 characters ({metaDescription.length} characters)
                </p>
              </div>
            </div>
          </div>
          {/* AI Generation */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              AI FAQ Generator
            </h2>
            <p className="text-gray-600 mb-6">
              Generate a comprehensive FAQ page with exactly 5 categories and 4-5 questions each. This will create 20-25 total questions tailored to your recipe website.
            </p>
            <button
              onClick={generateFAQContent}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Wand2 className="w-5 h-5" />
              )}
              {isGenerating ? "Generating FAQ Content..." : "Generate Complete FAQ with AI"}
            </button>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              FAQ Content (HTML)
            </h2>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={25}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="FAQ content will appear here after AI generation, or you can manually edit HTML content..."
            />
            <p className="text-xs text-gray-500 mt-1">
              HTML content that will be displayed on the FAQ page
            </p>
          </div>

          {/* Content Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Content Preview
            </h2>
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              {content ? (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <p className="text-gray-500 italic">No content yet. Use the AI generator to create FAQ content.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}