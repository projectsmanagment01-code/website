"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Wand2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Home,
  Type,
  MousePointer,
  Link,
  Image,
  Upload,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { refreshAfterChange } from "@/lib/revalidation-utils";
import { adminFetch } from '@/lib/admin-fetch';

interface HomeContent {
  heroTitle: string;
  heroDescription: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroBackgroundImage: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string | null;
}

interface ContentField {
  key: keyof HomeContent;
  label: string;
  description: string;
  seoImportance: "critical" | "high" | "medium";
  maxLength?: number;
  contentType: "title" | "description" | "button" | "link" | "image";
  icon: React.ReactNode;
  prompt: string;
}

const contentFields: ContentField[] = [
  {
    key: "heroTitle",
    label: "Hero Title",
    description: "Main headline for your homepage hero section",
    seoImportance: "critical",
    maxLength: 80,
    contentType: "title",
    icon: <Type className="w-4 h-4" />,
    prompt: "Create a compelling hero title for a recipe website homepage. Make it catchy, emotional, and food-focused. Should inspire visitors to explore recipes. Keep it under 80 characters and family-friendly."
  },
  {
    key: "heroDescription",
    label: "Hero Description",
    description: "Supporting text that describes your website's value",
    seoImportance: "high",
    maxLength: 120,
    contentType: "description",
    icon: <Type className="w-4 h-4" />,
    prompt: "Write an engaging hero description for a recipe website. Explain what visitors will find, focus on family meals, easy cooking, and delicious results. Make it warm and inviting, under 120 characters."
  },
  {
    key: "metaTitle",
    label: "SEO Meta Title",
    description: "Title that appears in search engine results",
    seoImportance: "critical",
    maxLength: 60,
    contentType: "title",
    icon: <Home className="w-4 h-4" />,
    prompt: "Create an SEO-optimized meta title for a recipe website homepage. Include main keywords like 'recipes', 'cooking', 'family meals'. Make it compelling for search results and under 60 characters."
  },
  {
    key: "metaDescription",
    label: "SEO Meta Description",
    description: "Description that appears in search engine results",
    seoImportance: "critical",
    maxLength: 160,
    contentType: "description",
    icon: <Home className="w-4 h-4" />,
    prompt: "Write an SEO-optimized meta description for a recipe website homepage. Include relevant keywords, describe the value proposition, and make it compelling for search results. Under 160 characters."
  }
];

export default function HomeContentEditor({ onBack }: { onBack?: () => void }) {
  const [content, setContent] = useState<HomeContent>({
    heroTitle: "",
    heroDescription: "",
    heroButtonText: "",
    heroButtonLink: "",
    heroBackgroundImage: "",
    metaTitle: "",
    metaDescription: "",
    lastUpdated: null,
  });
  
  const [generating, setGenerating] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  // Load content and site settings on mount
  useEffect(() => {
    loadContent();
    loadSiteSettings();
  }, []);

  const loadSiteSettings = async () => {
    try {
      const response = await adminFetch("/api/admin/content/site", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      const data = await response.json();
      setSiteSettings(data);
    } catch (error) {
      console.error("Error loading site settings:", error);
    }
  };

  const loadContent = async () => {
    try {
      const response = await adminFetch("/api/admin/content/home", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      const data = await response.json();
      setContent(data);
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

  const updateField = (field: keyof HomeContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const generateContent = async (field: ContentField) => {
    try {
      setGenerating(field.key);
      setMessage(null);

      // Get context from AI Context Settings (Site Settings)
      const context = {
        websiteName: siteSettings?.websiteName || siteSettings?.logoText || "Recipe Website",
        businessType: siteSettings?.businessType || "Recipe & Cooking",
        ownerName: siteSettings?.ownerName || "Website Owner",
        country: siteSettings?.country || "United States",
        primaryLanguage: siteSettings?.primaryLanguage || "English",
        siteDomain: siteSettings?.siteDomain || window.location.hostname || "recipeswebsite.com"
      };

      const token = localStorage.getItem("admin_token");
      const response = await adminFetch("/api/admin/generate-homepage-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          field: field.key,
          context,
          provider: "gemini"  // Default to Gemini
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const generatedContent = result.content.trim();
        setLastGenerated(prev => ({ ...prev, [field.key]: generatedContent }));
        updateField(field.key, generatedContent);
        setMessage({
          type: "success",
          text: `Generated ${field.label} successfully with ${result.provider === 'gemini' ? 'Google Gemini' : 'OpenAI'}! ✨`
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

  const generateAllContent = async () => {
    setMessage(null);
    for (const field of contentFields) {
      await generateContent(field);
      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setMessage({
      type: "success",
      text: "Generated all content successfully!"
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'hero-backgrounds');

      const token = localStorage.getItem("admin_token");
      const response = await adminFetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        updateField('heroBackgroundImage', result.url);
        setMessage({
          type: "success",
          text: "Hero background uploaded successfully!"
        });
      } else {
        throw new Error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to upload image"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = () => {
    updateField('heroBackgroundImage', '');
    setMessage({
      type: "success",
      text: "Hero background deleted successfully!"
    });
  };

  const saveContent = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const token = localStorage.getItem("admin_token");
      const response = await adminFetch("/api/admin/content/home", {
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

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({
          type: "success",
          text: "Home content saved successfully!"
        });
        
        // Reload content to get the updated timestamp
        await loadContent();
        
        // Immediately revalidate home page
        await refreshAfterChange(['home']);
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
            <h1 className="text-2xl font-bold text-gray-900">Home Page</h1>
            <p className="text-gray-600">
              Manage your homepage hero section and SEO metadata with AI assistance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateAllContent}
            disabled={!!generating}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#303740] text-white rounded text-xs hover:bg-[#404854] hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {generating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            Generate All
          </button>
          <button
            onClick={saveContent}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
            Save
          </button>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {contentFields.map((field) => {
          const isGenerating = generating === field.key;
          const currentValue = content[field.key] as string;
          const wasGenerated = lastGenerated[field.key] === currentValue;

          return (
            <div 
              key={field.key}
              className={`border-2 rounded p-4 shadow-lg hover:shadow-2xl hover:scale-102 transition-all duration-200 ${
                wasGenerated ? "border-orange-500" : "border-gray-300"
              }`}
              style={{backgroundColor: wasGenerated ? '#FEF3E2' : '#FAF7F2'}}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {field.icon}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800 text-sm">{field.label}</h4>
                      <button
                        onClick={() => generateContent(field)}
                        disabled={isGenerating || !!generating}
                        className="p-1 bg-orange-600 text-white rounded hover:bg-orange-700 hover:scale-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {isGenerating ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Wand2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">{field.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    field.seoImportance === "critical" 
                      ? "bg-red-100 text-red-700"
                      : field.seoImportance === "high"
                      ? "bg-orange-100 text-orange-700"  
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {field.seoImportance} SEO
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-700 mb-1">Current Content:</div>
                <textarea
                  value={currentValue || ""}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-sm text-gray-900 min-h-[60px] resize-none"
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  rows={field.contentType === "description" ? 3 : 2}
                />
                {field.maxLength && (
                  <div className="text-xs text-gray-600 mt-1">
                    {currentValue?.length || 0}/{field.maxLength} characters
                  </div>
                )}
              </div>
              
              {wasGenerated && (
                <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                  <CheckCircle className="w-3 h-3" />
                  Generated by AI
                </div>
              )}
            </div>
          );
        })}

        {/* Hero Background Image Upload Card */}
        <div className="border-2 border-gray-300 rounded p-4 shadow-lg hover:shadow-2xl hover:scale-102 transition-all duration-200" style={{backgroundColor: '#FAF7F2'}}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <div>
                <h4 className="font-medium text-gray-800 text-sm">Hero Background Image</h4>
                <p className="text-xs text-gray-600">Upload background image for hero section</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
              high SEO
            </span>
          </div>

          <div className="mb-3">
            <div className="text-xs text-gray-700 mb-1">Current Background:</div>
            {content.heroBackgroundImage ? (
              <div className="mb-2">
                <img 
                  src={content.heroBackgroundImage} 
                  alt="Hero background preview" 
                  className="w-full max-h-32 object-cover border border-gray-200 rounded"
                />
                <div className="text-xs text-gray-600 mt-1">{content.heroBackgroundImage}</div>
              </div>
            ) : (
              <div className="text-gray-600 italic text-sm mb-2">No background image uploaded</div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              disabled={uploading}
              className="hidden"
              id="hero-background-upload"
            />
            <div className="flex items-center justify-center gap-2">
              <label
                htmlFor="hero-background-upload"
                className={`flex items-center gap-2 px-3 py-1.5 bg-[#303740] text-white rounded text-xs cursor-pointer hover:bg-[#404854] hover:scale-105 transition-all duration-200 ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </label>
              
              {content.heroBackgroundImage && (
                <button
                  onClick={handleImageDelete}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#1B79D7] text-white rounded hover:bg-[#2987E5] hover:scale-110 cursor-pointer text-xs transition-all duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}