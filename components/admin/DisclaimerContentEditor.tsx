"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Wand2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Save,
  Scale,
  FileText,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { refreshAfterChange } from "@/lib/revalidation-utils";

interface DisclaimerContent {
  heroTitle: string;
  heroDescription: string;
  mainContent: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string | null;
}

export default function DisclaimerContentEditor({ onBack }: { onBack?: () => void }) {
  const [content, setContent] = useState<DisclaimerContent>({
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
      const response = await fetch("/api/admin/content/disclaimer", {
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

  const updateField = (field: keyof DisclaimerContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const generateContent = async (field: keyof DisclaimerContent) => {
    try {
      setGenerating(field);
      setMessage(null);

      // Get AI Context Settings
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

      switch (field) {
        case "heroTitle":
          prompt = `Generate a professional 1-3 word title for a Disclaimer page. Direct and legally appropriate.`;
          maxLength = 60;
          break;
        case "heroDescription":
          prompt = `Generate a brief 15-25 word description for a Disclaimer page on ${websiteName} (${businessType}). Explain the page contains legal disclaimers. Professional tone.`;
          maxLength = 150;
          break;
        case "mainContent":
          prompt = `Write comprehensive legal disclaimer content for ${websiteName}, a ${businessType} in ${country} (MINIMUM 600 words).

Include these sections:

1. Recipe Results Disclaimer (100-150 words): No guarantee of outcomes, variations in ingredients/equipment/techniques, cooking results differ, user skill variations, environmental factors.

2. Food Safety & Preparation (100-150 words): User's responsibility, proper handling/storage, temperature guidelines, cross-contamination warnings, expiration dates.

3. Nutritional Information (80-120 words): Approximate data, calculated from databases, may not reflect actual values, not nutritional advice, ingredient variations.

4. Allergies & Dietary Restrictions (100-150 words): Users check ingredients, allergen warnings, cross-contamination, dietary considerations, not medical advice, consult professionals.

5. Health & Medical Disclaimers (80-120 words): Not medical/health advice, consult healthcare professionals, individual needs vary, medication interactions possible.

6. Website Content & Accuracy (60-80 words): Content "as is", no accuracy guarantee, information may be outdated, errors possible.

7. Third-Party Content & Links (60-80 words): External links for convenience, no endorsement, not responsible for external sites.

8. Liability Limitations (100-150 words): ${ownerName} and ${websiteName} not liable for damages, use at own risk, no liability for adverse reactions/injuries, ${country} liability limitations.

9. User Responsibility (60-80 words): Users responsible for actions, due diligence required, common sense, seek professional advice.

10. Changes to Disclaimer (40-60 words): Right to modify, continued use = acceptance, check regularly.

Use proper HTML: <h2> for section titles, <p> for paragraphs, <ul><li> for lists, <strong> for emphasis. Write FULL paragraphs (not summaries). Make it legally comprehensive for ${businessType} in ${country}. Language: ${primaryLanguage}.`;
          maxLength = 15000; // disclaimer needs enough room for all sections
          break;
        case "metaTitle":
          prompt = `Generate SEO meta title (50-60 chars) for ${websiteName} Disclaimer page. Include site name and "Disclaimer" or "Legal Notice".`;
          maxLength = 60;
          break;
        case "metaDescription":
          prompt = `Generate SEO meta description (150-160 chars) for Disclaimer page. Describe legal disclaimers, liability limitations, user responsibilities for ${websiteName}.`;
          maxLength = 160;
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
          contentType: field === "metaTitle" || field === "heroTitle" ? "title" : field === "metaDescription" || field === "heroDescription" ? "description" : "legal",
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
        
        setLastGenerated(prev => ({ ...prev, [field]: generatedContent }));
        updateField(field, generatedContent);
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
      const response = await fetch("/api/admin/content/disclaimer", {
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
          text: "Disclaimer content saved successfully!"
        });
        await loadContent();
        
        // Immediately revalidate disclaimer page
        await refreshAfterChange(['disclaimer']);
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
    window.open("/disclaimer", "_blank");
  };

  const wasGenerated = (field: keyof DisclaimerContent) => lastGenerated[field] === content[field];

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
            <h1 className="text-2xl font-bold text-gray-900">Disclaimer</h1>
            <p className="text-gray-600">
              Manage legal disclaimer content with AI assistance
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
                placeholder="Disclaimer"
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
                placeholder="Important disclaimers for using our food blog and recipes."
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
              Main Disclaimer Content
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
              Generate Full Disclaimer
            </button>
          </div>
          
          <textarea
            value={content.mainContent}
            onChange={(e) => updateField("mainContent", e.target.value)}
            rows={20}
            className={`w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm font-mono resize-vertical transition-all duration-200 ${
              wasGenerated("mainContent") ? 'border-orange-500' : ''
            }`}
            placeholder="Enter main disclaimer content with HTML formatting..."
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
                placeholder="SEO title for disclaimer page (50-60 characters)"
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
                placeholder="SEO description for disclaimer page (150-160 characters)"
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