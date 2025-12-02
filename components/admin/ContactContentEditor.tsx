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
} from "lucide-react";
import { refreshAfterChange } from "@/lib/revalidation-utils";
import { adminFetch } from '@/lib/admin-fetch';

interface ContactContent {
  heroTitle: string;
  heroSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string | null;
}

export default function ContactContentEditor({ onBack }: { onBack?: () => void }) {
  const [content, setContent] = useState<ContactContent>({
    heroTitle: "",
    heroSubtitle: "",
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
      const response = await adminFetch("/api/admin/content/site", {
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
      console.log('📥 Loading contact content from /api/admin/settings...');
      const response = await adminFetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      
      console.log('📡 Load response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Loaded settings data:', JSON.stringify(data, null, 2));
        
        if (data.contactPageContent) {
          console.log('✅ Found contactPageContent:', JSON.stringify(data.contactPageContent, null, 2));
          setContent(data.contactPageContent);
        } else {
          console.log('⚠️ No contactPageContent in settings');
        }
      } else {
        console.error('❌ Load failed with status:', response.status);
      }
    } catch (error) {
      console.error("❌ Error loading content:", error);
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

  const generateMetaContent = async (field: 'heroTitle' | 'heroSubtitle' | 'metaTitle' | 'metaDescription') => {
    try {
      setGenerating(`meta-${field}`);
      setMessage(null);

      // Build AI Context from Site Settings
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

Task: Generate a compelling 3-5 word hero title for the Contact page. Should be inviting and encourage visitors to reach out to this ${businessType}. Use ${primaryLanguage} language. No explanations, just the title:`;
        maxLength = 60;
      } else if (field === 'heroSubtitle') {
        prompt = `Context:
${contextInfo}

Task: Generate a friendly 15-25 word subtitle for the Contact page hero section. Should explain why visitors should contact ${websiteName} and what they can reach out about. Make it warm and approachable. Use ${primaryLanguage} language. No explanations, just the subtitle:`;
        maxLength = 150;
      } else if (field === 'metaTitle') {
        prompt = `Context:
${contextInfo}

Task: Generate a 50-60 character SEO meta title for the Contact page. Should include "${websiteName}", be optimized for ${country} search results, and encourage visitors to get in touch with this ${businessType}. Use ${primaryLanguage} language. No explanations, just the title:`;
        maxLength = 60;
      } else {
        prompt = `Context:
${contextInfo}

Task: Generate a 150-160 character SEO meta description for the Contact page. Should invite visitors to reach out to ${ownerName} at ${websiteName}, explain available contact options, and be optimized for ${country} searchers interested in ${businessType}. Use ${primaryLanguage} language. No explanations, just the description:`;
        maxLength = 160;
      }

      const token = localStorage.getItem("admin_token");
      const response = await adminFetch("/api/admin/ai-generate-content", {
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
        console.log('🎯 Generated Content:', { field, content: generatedContent, provider: result.provider });
        
        updateMetaField(field, generatedContent);
        setMessage({
          type: "success",
          text: `Generated ${field} with ${result.provider === 'gemini' ? 'Google Gemini' : result.provider === 'ollama' ? 'Ollama Cloud' : 'OpenAI'}! ✨`
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

      const dataToSave = {
        contactPageContent: {
          ...content,
          lastUpdated: new Date().toISOString(),
        }
      };

      console.log('💾 Saving contact content:', JSON.stringify(dataToSave, null, 2));

      const token = localStorage.getItem("admin_token");
      const response = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSave),
      });

      console.log('📡 Save response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Save response data:', JSON.stringify(responseData, null, 2));
        
        setMessage({
          type: "success",
          text: "Contact content saved successfully!"
        });
        await loadContent();
        
        // Immediately revalidate contact page
        console.log('🔄 Revalidating contact page...');
        await refreshAfterChange(['contact']);
        console.log('✅ Revalidation complete');
      } else {
        const errorData = await response.json();
        console.error('❌ Save failed:', errorData);
        throw new Error(errorData.error || "Failed to save content");
      }
    } catch (error) {
      console.error("❌ Error saving content:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save content"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open("/contact", "_blank");
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
            <h1 className="text-2xl font-bold text-gray-900">Contact Page</h1>
            <p className="text-gray-600">
              Manage contact page hero section and SEO metadata
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
                  placeholder="Main heading for contact page (4-8 words)"
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
                  placeholder="Supporting text for hero section (15-25 words)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
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
                  placeholder="SEO title for contact page (50-60 characters)"
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
                  placeholder="SEO description for contact page (150-160 characters)"
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