"use client";

import React, { useState } from "react";
import {
  Bot,
  Wand2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Target,
  Globe,
  Type,
  Copyright,
  Upload,
  Image,
  Trash2,
} from "lucide-react";
import { refreshAfterChange } from "@/lib/revalidation-utils";

interface SiteSettings {
  logoType: "text" | "image";
  logoText: string;
  logoTagline: string;
  logoImage: string;
  favicon: string;
  footerCopyright: string;
  footerVersion: string;
  siteTitle: string;
  siteDescription: string;
  siteDomain: string;
  siteUrl: string;
  siteEmail: string;
  lastUpdated: string | null;
}

interface AIContentAssistantProps {
  settings: SiteSettings;
  onUpdate: (field: keyof SiteSettings, value: string) => void;
  websiteType?: string;
  businessName?: string;
  targetAudience?: string;
}

interface ContentField {
  key: keyof SiteSettings;
  label: string;
  description: string;
  seoImportance: "critical" | "high" | "medium";
  maxLength?: number;
  contentType: "title" | "description" | "brand" | "contact" | "legal";
  icon: React.ReactNode;
  prompt: string;
}

const contentFields: ContentField[] = [
  {
    key: "siteTitle",
    label: "Site Title",
    description: "Main SEO title for your website",
    seoImportance: "critical",
    maxLength: 60,
    contentType: "title",
    icon: <Globe className="w-4 h-4" />,
    prompt: "Create an SEO-optimized site title for a recipe website. Make it catchy, include key food/recipe keywords, and stay under 60 characters. Focus on family-friendly recipes and cooking."
  },
  {
    key: "siteDescription",
    label: "Site Description",
    description: "Meta description for search engines",
    seoImportance: "critical",
    maxLength: 160,
    contentType: "description",
    icon: <Target className="w-4 h-4" />,
    prompt: "Write an SEO-optimized meta description for a recipe website. Include relevant keywords like 'recipes', 'cooking', 'family meals', 'delicious food'. Make it compelling for search results and under 160 characters."
  },
  {
    key: "logoText",
    label: "Logo Text",
    description: "Brand name for your website",
    seoImportance: "high",
    maxLength: 30,
    contentType: "brand",
    icon: <Type className="w-4 h-4" />,
    prompt: "Create a memorable and brandable logo text for a recipe website. Make it short, catchy, and related to food/cooking. Should be easy to remember and professional."
  },
  {
    key: "logoTagline",
    label: "Logo Tagline",
    description: "Short descriptive tagline",
    seoImportance: "medium",
    maxLength: 50,
    contentType: "brand",
    icon: <Sparkles className="w-4 h-4" />,
    prompt: "Write a short, catchy tagline for a recipe website logo. Should complement the brand and describe what the site offers. Keep it under 50 characters and inspiring."
  },
  {
    key: "siteUrl",
    label: "Site URL",
    description: "Main website URL (e.g., https://yoursite.com)",
    seoImportance: "high",
    contentType: "contact",
    icon: <Globe className="w-4 h-4" />,
    prompt: "Generate a professional website URL for a recipe website. Use a format like 'https://yourrecipesite.com' - make it brandable and related to food/cooking."
  },
  {
    key: "siteEmail",
    label: "Site Email",
    description: "Contact email for your website",
    seoImportance: "medium",
    contentType: "contact",
    icon: <Globe className="w-4 h-4" />,
    prompt: "Create a professional contact email for a recipe website. Use formats like 'contact@yoursite.com' or 'hello@yoursite.com' - make it professional and brandable."
  },

  {
    key: "footerCopyright",
    label: "Footer Copyright",
    description: "Copyright notice for website footer",
    seoImportance: "medium",
    contentType: "legal",
    icon: <Copyright className="w-4 h-4" />,
    prompt: "Generate ONLY a simple one-line copyright notice for a recipe website footer. Format: '© 2025 [Website Name] - All rights reserved.' Keep it simple and under 60 characters. Do not generate disclaimers or additional legal content."
  },
  {
    key: "footerVersion",
    label: "Footer Version/Info",
    description: "Additional footer information or version",
    seoImportance: "medium",
    maxLength: 50,
    contentType: "brand",
    icon: <Copyright className="w-4 h-4" />,
    prompt: "Create additional footer text for a recipe website. This could be a version number, tagline, or brief additional info to display in the footer. Keep it short, professional, and relevant to the brand."
  }
];

export default function AIContentAssistant({ settings, onUpdate, websiteType = "recipe website", businessName, targetAudience = "food lovers and home cooks" }: AIContentAssistantProps) {
  const [generating, setGenerating] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const generateContent = async (field: ContentField) => {
    try {
      setGenerating(field.key);
      setMessage(null);

      const context = {
        websiteType,
        businessName: businessName || settings.logoText || "Recipe Website",
        targetAudience,
        currentDomain: settings.siteDomain || "example.com",
        currentTitle: settings.siteTitle,
        currentDescription: settings.siteDescription,
      };

      const enhancedPrompt = `
        Context: ${websiteType} called "${context.businessName}"
        Target Audience: ${targetAudience}
        Domain: ${context.currentDomain}
        
        Task: ${field.prompt}
        
        Requirements:
        - SEO Importance: ${field.seoImportance}
        ${field.maxLength ? `- Maximum length: ${field.maxLength} characters` : ""}
        - Content type: ${field.contentType}
        - Make it unique and engaging
        - Include relevant keywords naturally
        - Match the brand voice (friendly, approachable, food-focused)
        
        Current content for reference:
        - Site Title: "${settings.siteTitle}"
        - Site Description: "${settings.siteDescription}"
        - Logo Text: "${settings.logoText}"
        
        Generate ONLY the content, no explanations or quotes.
      `;

      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/ai-generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          field: field.key,
          maxLength: field.maxLength,
          contentType: field.contentType,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const generatedContent = result.content.trim();
        setLastGenerated(prev => ({ ...prev, [field.key]: generatedContent }));
        onUpdate(field.key, generatedContent);
        setMessage({
          type: "success",
          text: `Generated ${field.label} successfully!`
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

  const handleImageUpload = async (file: File, fieldKey: 'logoImage' | 'favicon') => {
    try {
      setUploading(fieldKey);
      setMessage(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', fieldKey === 'logoImage' ? 'logos' : 'favicon');

      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onUpdate(fieldKey, result.url);
        setMessage({
          type: "success",
          text: `${fieldKey === 'logoImage' ? 'Logo' : 'Favicon'} uploaded successfully!`
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
      setUploading(null);
    }
  };

  const handleImageDelete = async (fieldKey: 'logoImage' | 'favicon') => {
    onUpdate(fieldKey, '');
    setMessage({
      type: "success",
      text: `${fieldKey === 'logoImage' ? 'Logo' : 'Favicon'} deleted successfully!`
    });
    
    // Revalidate site since logo/favicon appear on all pages
    await refreshAfterChange(['site', 'home']);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-2 rounded-lg">
            <Bot className="w-6 h-6 text-[#303740]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">AI Content Assistant</h3>
            <p className="text-sm text-gray-600">
              Generate SEO-optimized content for your website settings
            </p>
          </div>
        </div>
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
          const currentValue = settings[field.key] as string;
          const wasGenerated = lastGenerated[field.key] === currentValue;

          return (
            <div 
              key={field.key}
              className={`bg-gray-50 border rounded p-4 shadow-lg hover:shadow-2xl hover:scale-102 transition-all duration-200 ${
                wasGenerated ? "border-orange-500 bg-orange-50" : "border-gray-300"
              }`}
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
                  onChange={(e) => onUpdate(field.key, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-sm text-gray-900 min-h-[60px] resize-none"
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  rows={2}
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

        {/* Logo Image Upload Card */}
        <div className="bg-gray-50 border border-gray-300 rounded p-4 shadow-lg hover:shadow-2xl hover:scale-102 transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <div>
                <h4 className="font-medium text-gray-800 text-sm">Logo Image</h4>
                <p className="text-xs text-gray-600">Upload your website logo</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
              medium SEO
            </span>
          </div>

          <div className="mb-3">
            <div className="text-xs text-gray-700 mb-1">Current Logo:</div>
            {settings.logoImage ? (
              <div className="mb-2">
                <img 
                  src={settings.logoImage} 
                  alt="Logo preview" 
                  className="max-w-32 max-h-16 object-contain border border-gray-200 rounded"
                />
                <div className="text-xs text-gray-600 mt-1">{settings.logoImage}</div>
              </div>
            ) : (
              <div className="text-gray-600 italic text-sm mb-2">No logo uploaded</div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'logoImage');
              }}
              disabled={uploading === 'logoImage'}
              className="hidden"
              id="logo-upload"
            />
            <div className="flex items-center justify-center gap-2">
              <label
                htmlFor="logo-upload"
                className={`flex items-center gap-2 px-3 py-1.5 bg-[#303740] text-white rounded text-xs cursor-pointer hover:bg-[#404854] hover:scale-105 transition-all duration-200 ${
                  uploading === 'logoImage' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading === 'logoImage' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </label>
              
              {settings.logoImage && (
                <button
                  onClick={() => handleImageDelete('logoImage')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#1B79D7] text-white rounded hover:bg-[#2987E5] hover:scale-110 cursor-pointer text-xs transition-all duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Favicon Upload Card */}
        <div className="bg-gray-50 border border-gray-300 rounded p-4 shadow-lg hover:shadow-2xl hover:scale-102 transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <div>
                <h4 className="font-medium text-gray-800 text-sm">Favicon</h4>
                <p className="text-xs text-gray-600">Upload your site favicon (16x16 or 32x32 px)</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
              medium SEO
            </span>
          </div>

          <div className="mb-3">
            <div className="text-xs text-gray-700 mb-1">Current Favicon:</div>
            {settings.favicon ? (
              <div className="mb-2">
                <img 
                  src={settings.favicon} 
                  alt="Favicon preview" 
                  className="w-8 h-8 object-contain border border-gray-200 rounded"
                />
                <div className="text-xs text-gray-600 mt-1">{settings.favicon}</div>
              </div>
            ) : (
              <div className="text-gray-600 italic text-sm mb-2">No favicon uploaded</div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'favicon');
              }}
              disabled={uploading === 'favicon'}
              className="hidden"
              id="favicon-upload"
            />
            <div className="flex items-center justify-center gap-2">
              <label
                htmlFor="favicon-upload"
                className={`flex items-center gap-2 px-3 py-1.5 bg-[#303740] text-white rounded text-xs cursor-pointer hover:bg-[#404854] hover:scale-105 transition-all duration-200 ${
                  uploading === 'favicon' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading === 'favicon' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </label>
              
              {settings.favicon && (
                <button
                  onClick={() => handleImageDelete('favicon')}
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