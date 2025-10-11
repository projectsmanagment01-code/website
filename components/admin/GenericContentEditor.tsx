"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Wand2,
} from "lucide-react";

interface StaticPageContent {
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string | null;
}

type ContentField = keyof StaticPageContent | "heroTitle" | "heroIntro";

interface GenericContentEditorProps {
  pageId: string;
  pageTitle: string;
  pageDescription: string;
  previewPath: string;
  onBack?: () => void;
}

export default function GenericContentEditor({
  pageId,
  pageTitle,
  pageDescription,
  previewPath,
  onBack,
}: GenericContentEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState<
    StaticPageContent & { heroTitle?: string; heroIntro?: string }
  >({
    title: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    lastUpdated: null,
    heroTitle: "",
    heroIntro: "",
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [generatingField, setGeneratingField] = useState<ContentField | null>(null);

  useEffect(() => {
    loadContent();
  }, [pageId]);

  const loadContent = async () => {
    try {
      const response = await fetch(`/api/admin/content/${pageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Loaded ${pageId} content:`, data); // Debug log
        // Merge with default values to ensure all fields exist
        setContent(prev => ({
          ...prev,
          ...data,
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          title: data.title || "",
          content: data.content || "",
          heroTitle: data.heroTitle || "",
          heroIntro: data.heroIntro || "",
        }));
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: ContentField, value: string) => {
    setContent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus("saving");

    try {
      const response = await fetch(`/api/admin/content/${pageId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          ...content,
          lastUpdated: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSaveStatus("success");
        setContent((prev) => ({
          ...prev,
          lastUpdated: new Date().toISOString(),
        }));
        setTimeout(() => setSaveStatus("idle"), 3000);
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

  const handlePreview = () => {
    window.open(previewPath, "_blank");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/admin/content");
    }
  };

  const generateFieldContent = async (fieldName: ContentField, basePrompt: string) => {
    try {
      setGeneratingField(fieldName);
      
      const requestData = {
        prompt: basePrompt,
        field: fieldName,
        maxLength: fieldName === "metaTitle" ? 60 : fieldName === "metaDescription" ? 160 : fieldName === "title" ? 100 : pageId === "disclaimer" && fieldName === "content" ? 8000 : 500,
        contentType: fieldName.includes("meta") ? (fieldName === "metaTitle" ? "title" : "description") : fieldName === "content" ? "legal" : "brand",
        websiteContext: {
          currentBrandName: "Recipe & Cooking Website",
          currentDescription: content.metaDescription || `A ${pageId} page for a recipe and cooking website`,
          currentDomain: window.location.hostname,
          currentUrl: window.location.origin,
          currentYear: new Date().getFullYear(),
          existingContent: content[fieldName as keyof typeof content] || "",
          pageType: pageId,
          pageTitle: content.title,
          pageContent: content.content,
        },
      };
      
      const response = await fetch("/api/admin/ai-generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        if (result.content && result.content.length > 0) {
          setContent(prev => ({
            ...prev,
            [fieldName]: result.content
          }));
        } else {
          alert("Generated content is empty. Please try again.");
        }
      } else {
        alert(result.error || "Failed to generate content");
      }
    } catch (error) {
      console.error("Exception in generateFieldContent:", error);
      alert("Failed to generate content: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setGeneratingField(null);
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
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {pageTitle}
            </h1>
            <p className="text-gray-600">{pageDescription}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:scale-105 transition-all duration-200"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleSave}
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

      {/* Content */}
      <div className="w-full px-2 py-4">
        <div className="space-y-3">
          {/* Hero Section Manager for Disclaimer */}
          {pageId === "disclaimer" && (
            <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Hero Section
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Hero Title
                    </label>
                    <button
                      onClick={() => generateFieldContent("heroTitle", "Generate a professional hero title for the disclaimer page of a recipe website. Make it clear and legally appropriate. No explanations, just the title:")}
                      disabled={generatingField === "heroTitle" || !!generatingField}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
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
                    value={content.heroTitle || ""}
                    onChange={(e) => handleInputChange("heroTitle", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter hero title (e.g., Disclaimer)"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Hero Intro
                    </label>
                    <button
                      onClick={() => generateFieldContent("heroIntro", "Generate a concise hero intro for the disclaimer page of a recipe website. Make it welcoming and informative about legal notices. No explanations, just the intro:")}
                      disabled={generatingField === "heroIntro" || !!generatingField}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
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
                    value={content.heroIntro || ""}
                    onChange={(e) => handleInputChange("heroIntro", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter hero intro (e.g., Important disclaimers for using our food blog and recipes.)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Page Content
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Page Title
                  </label>
                  <button
                    onClick={() => generateFieldContent("title", `Generate a professional page title for the ${pageId} page of a recipe website. Make it clear and appropriate. No explanations, just the title:`)}
                    disabled={generatingField === "title" || !!generatingField}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                  >
                    {generatingField === "title" ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    {generatingField === "title" ? "Generating..." : "AI Generate"}
                  </button>
                </div>
                <input
                  type="text"
                  value={content.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter page title"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Main Content
                  </label>
                  <button
                    onClick={() => generateFieldContent("content", pageId === "disclaimer" 
                      ? `Generate a comprehensive legal disclaimer for a recipe and cooking website. Include the following sections: 1. Recipe accuracy and cooking results disclaimer, 2. Food safety and preparation warnings, 3. Nutritional information accuracy disclaimer, 4. Health and dietary considerations, 5. Liability limitations, 6. User responsibility statements, 7. Website content disclaimers, 8. Contact information for questions. Make it legally sound but user-friendly. Use proper HTML formatting with headers, paragraphs, and lists. Always reference the project context to customize brand names and specific details. No explanations, just the complete disclaimer content:`
                      : `Generate comprehensive content for the ${pageId} page of a recipe website. Make it informative, professional, and user-friendly. Use proper HTML formatting. Always reference the project context to customize brand names and specific details. No explanations, just the content:`
                    )}
                    disabled={generatingField === "content" || !!generatingField}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                  >
                    {generatingField === "content" ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    {generatingField === "content" ? "Generating..." : "AI Generate"}
                  </button>
                </div>
                <textarea
                  value={content.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={pageId === "disclaimer" ? 20 : 12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder={pageId === "disclaimer" 
                    ? "Enter disclaimer content with HTML formatting..."
                    : "Enter page content with HTML formatting..."
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use HTML formatting for better display. The AI generation will create properly formatted content.
                </p>
              </div>
            </div>
          </div>

          {/* SEO Meta */}
          <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              SEO Meta Information
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Meta Title (max 60 characters)
                  </label>
                  <button
                    onClick={() => generateFieldContent("metaTitle", `Generate an SEO-optimized meta title for the ${pageId} page of a recipe website. Keep it under 60 characters, include relevant keywords, and make it compelling for search results. Always reference the project context for brand names. No explanations, just the title:`)}
                    disabled={generatingField === "metaTitle" || !!generatingField}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
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
                  value={content.metaTitle}
                  onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter meta title"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(content.metaTitle || "").length}/60 characters
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Meta Description (max 160 characters)
                  </label>
                  <button
                    onClick={() => generateFieldContent("metaDescription", `Generate an SEO-optimized meta description for the ${pageId} page of a recipe website. Keep it under 160 characters, include relevant keywords, and make it compelling for search results. Always reference the project context for brand names. No explanations, just the description:`)}
                    disabled={generatingField === "metaDescription" || !!generatingField}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
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
                  value={content.metaDescription}
                  onChange={(e) =>
                    handleInputChange("metaDescription", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter meta description"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(content.metaDescription || "").length}/160 characters
                </p>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Content Preview
            </h2>
            <div className="border rounded p-4 bg-white">
              <h3 className="text-lg font-semibold mb-4">
                {content.title || "Page Title"}
              </h3>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: content.content || "<p>No content yet...</p>",
                }}
              />
            </div>
          </div>

          {/* Last Updated */}
          {content.lastUpdated && (
            <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
              <p className="text-sm text-gray-600">
                Last updated:{" "}
                {new Date(content.lastUpdated).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
