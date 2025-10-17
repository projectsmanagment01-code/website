"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Wand2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Save,
  Cookie,
  Shield,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { refreshAfterChange } from "@/lib/revalidation-utils";

interface CookiesContent {
  heroTitle: string;
  heroDescription: string;
  mainContent: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string | null;
}

export default function CookiesContentEditor({ onBack }: { onBack?: () => void }) {
  const [content, setContent] = useState<CookiesContent>({
    heroTitle: "",
    heroDescription: "",
    mainContent: "",
    metaTitle: "",
    metaDescription: "",
    lastUpdated: null,
  });
  
  const [generating, setGenerating] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch("/api/admin/content/cookies", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setContent(prev => ({ ...prev, ...data }));
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

  const updateField = (field: keyof CookiesContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const generateContent = async (field: keyof CookiesContent) => {
    try {
      setGenerating(field);
      setMessage(null);

      let prompt = "";
      switch (field) {
        case "heroTitle":
          prompt = "Generate a clear, professional hero title for a cookie policy page on a recipe website. Should be straightforward and privacy-focused. Keep it under 60 characters.";
          break;
        case "heroDescription":
          prompt = "Generate a friendly, informative hero description for a cookie policy page. Should explain what users will learn about cookie usage in an approachable way. Keep it under 150 characters.";
          break;
        case "mainContent":
          prompt = "Generate comprehensive cookie policy content for a recipe and cooking website. Include sections on: 1) What are cookies and how we use them, 2) Types of cookies used (essential, analytics, advertising), 3) Third-party cookies and services, 4) Cookie management and user choices, 5) How to disable cookies, 6) Contact information for questions. Make it legally compliant but user-friendly. Use proper HTML formatting with headers, paragraphs, and lists.";
          break;
        case "metaTitle":
          prompt = "Generate an SEO-optimized meta title for a cookie policy page on a recipe website. Include relevant keywords, keep under 60 characters.";
          break;
        case "metaDescription":
          prompt = "Generate an SEO-optimized meta description for a cookie policy page. Should describe cookie usage and privacy information. Keep under 160 characters.";
          break;
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
          contentType: field === "metaTitle" ? "title" : field === "metaDescription" ? "description" : field === "mainContent" ? "legal" : "text",
          maxLength: field === "metaTitle" ? 60 : field === "metaDescription" ? 160 : field === "heroTitle" ? 60 : field === "heroDescription" ? 150 : 8000,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const generatedContent = result.content.trim();
        setLastGenerated(prev => ({ ...prev, [field]: generatedContent }));
        updateField(field, generatedContent);
        setMessage({
          type: "success",
          text: `Generated ${field} successfully!`
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
      const response = await fetch("/api/admin/content/cookies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...content,
          lastUpdated: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Cookie policy content saved successfully!"
        });
        await loadContent();
        
        // Immediately revalidate cookies page
        await refreshAfterChange(['cookies']);
      } else {
        throw new Error("Failed to save content");
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
    window.open("/cookies", "_blank");
  };

  const wasGenerated = (field: keyof CookiesContent) => lastGenerated[field] === content[field];

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
            <h1 className="text-2xl font-bold text-gray-900">Cookie Policy</h1>
            <p className="text-gray-600">
              Manage cookie policy content with AI assistance
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
      <div className="flex justify-end">
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Hero Title</label>
                <button
                  onClick={() => generateContent("heroTitle")}
                  disabled={generating === "heroTitle"}
                  className="p-1 text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                >
                  {generating === "heroTitle" ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                </button>
              </div>
              <input
                type="text"
                value={content.heroTitle}
                onChange={(e) => updateField("heroTitle", e.target.value)}
                className={`w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-sm transition-all duration-200 ${
                  wasGenerated("heroTitle") ? 'border-orange-500' : ''
                }`}
                placeholder="Cookie Policy"
              />
              <div className="text-xs text-gray-600 mt-1">
                {content.heroTitle.length}/60 characters
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Hero Description</label>
                <button
                  onClick={() => generateContent("heroDescription")}
                  disabled={generating === "heroDescription"}
                  className="p-1 text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                >
                  {generating === "heroDescription" ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                </button>
              </div>
              <textarea
                value={content.heroDescription}
                onChange={(e) => updateField("heroDescription", e.target.value)}
                rows={2}
                className={`w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-sm resize-none transition-all duration-200 ${
                  wasGenerated("heroDescription") ? 'border-orange-500' : ''
                }`}
                placeholder="Learn how we use cookies to improve your browsing experience."
              />
              <div className="text-xs text-gray-600 mt-1">
                {content.heroDescription.length}/150 characters
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Main Cookie Policy Content
            </h2>
            <button
              onClick={() => generateContent("mainContent")}
              disabled={generating === "mainContent"}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
            >
              {generating === "mainContent" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Generate Full Cookie Policy
            </button>
          </div>
          
          <textarea
            value={content.mainContent}
            onChange={(e) => updateField("mainContent", e.target.value)}
            rows={20}
            className={`w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm font-mono resize-vertical transition-all duration-200 ${
              wasGenerated("mainContent") ? 'border-orange-500' : ''
            }`}
            placeholder="Enter main cookie policy content with HTML formatting..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Use HTML formatting for better display. The AI generation will create properly formatted legal content.
          </p>
        </div>

        {/* SEO Metadata */}
        <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            SEO Metadata
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Meta Title</label>
                <button
                  onClick={() => generateContent("metaTitle")}
                  disabled={generating === "metaTitle"}
                  className="p-1 text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                >
                  {generating === "metaTitle" ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                </button>
              </div>
              <input
                type="text"
                value={content.metaTitle}
                onChange={(e) => updateField("metaTitle", e.target.value)}
                className={`w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-sm transition-all duration-200 ${
                  wasGenerated("metaTitle") ? 'border-orange-500' : ''
                }`}
                placeholder="SEO title for cookie policy page (50-60 characters)"
              />
              <div className="text-xs text-gray-600 mt-1">
                {content.metaTitle.length}/60 characters
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Meta Description</label>
                <button
                  onClick={() => generateContent("metaDescription")}
                  disabled={generating === "metaDescription"}
                  className="p-1 text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                >
                  {generating === "metaDescription" ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                </button>
              </div>
              <textarea
                value={content.metaDescription}
                onChange={(e) => updateField("metaDescription", e.target.value)}
                rows={2}
                className={`w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-sm resize-none transition-all duration-200 ${
                  wasGenerated("metaDescription") ? 'border-orange-500' : ''
                }`}
                placeholder="SEO description for cookie policy page (150-160 characters)"
              />
              <div className="text-xs text-gray-600 mt-1">
                {content.metaDescription.length}/160 characters
              </div>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Content Preview
          </h2>
          <div className="border rounded p-4 bg-white">
            <h3 className="text-lg font-semibold mb-2">
              {content.heroTitle || "Hero Title"}
            </h3>
            <p className="text-gray-600 mb-4">
              {content.heroDescription || "Hero description will appear here..."}
            </p>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: content.mainContent || "<p>Main content will appear here...</p>",
              }}
            />
          </div>
        </div>

        {/* Last Updated */}
        {content.lastUpdated && (
          <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
            <p className="text-sm text-gray-600">
              Last updated: {new Date(content.lastUpdated).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}