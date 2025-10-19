"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import AIContentAssistant from "./AIContentAssistant";
import { refreshAfterChange } from "@/lib/revalidation-utils";

interface SiteSettings {
  // AI Context Fields (used for content generation)
  websiteName: string;
  businessType: string;
  ownerName: string;
  country: string;
  primaryLanguage: string;
  
  // Logo & Branding
  logoType: "text" | "image";
  logoText: string;
  logoTagline: string;
  logoImage: string;
  favicon: string;
  
  // Footer
  footerCopyright: string;
  footerVersion: string;
  
  // SEO & Meta
  siteTitle: string;
  siteDescription: string;
  siteDomain: string;
  siteUrl: string;
  siteEmail: string;
  
  lastUpdated: string | null;
}

interface SiteSettingsEditorProps {
  onBack?: () => void;
}

export default function SiteSettingsEditor({ onBack }: SiteSettingsEditorProps) {
  const [settings, setSettings] = useState<SiteSettings>({
    // AI Context Fields
    websiteName: "",
    businessType: "Personal Blog",
    ownerName: "",
    country: "United States",
    primaryLanguage: "English",
    
    // Logo & Branding
    logoType: "text",
    logoText: "",
    logoTagline: "",
    logoImage: "",
    favicon: "",
    
    // Footer
    footerCopyright: "",
    footerVersion: "",
    
    // SEO & Meta
    siteTitle: "",
    siteDescription: "",
    siteDomain: "",
    siteUrl: "",
    siteEmail: "",
    
    lastUpdated: null,
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/content/site", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Loaded site settings:", data);
        setSettings(prevSettings => ({
          ...prevSettings,
          ...data,
        }));
      }
    } catch (error) {
      console.error("Error loading site settings:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus("saving");

    try {
      // Save to site settings
      const siteResponse = await fetch("/api/admin/content/site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          ...settings,
          lastUpdated: new Date().toISOString(),
        }),
      });

      // Also save AI Context Settings to admin_settings for CMS components
      // Use PATCH for partial update (doesn't require header/body/footer sections)
      const aiContextResponse = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          aiContextSettings: {
            websiteName: settings.websiteName || "",
            businessType: settings.businessType || "",
            ownerName: settings.ownerName || "",
            country: settings.country || "",
            primaryLanguage: settings.primaryLanguage || "",
            siteDomain: settings.siteDomain || "",
          }
        }),
      });

      if (siteResponse.ok && aiContextResponse.ok) {
        setSaveStatus("success");
        setSettings((prev) => ({
          ...prev,
          lastUpdated: new Date().toISOString(),
        }));
        
        // Immediately revalidate all pages since site settings affect the entire site
        await refreshAfterChange(['site']);
        
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        // Log which request failed for debugging
        if (!siteResponse.ok) {
          console.error("Site settings save failed:", await siteResponse.text());
        }
        if (!aiContextResponse.ok) {
          console.error("AI Context settings save failed:", await aiContextResponse.text());
        }
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    window.open("/", "_blank");
  };

  const handleAIUpdate = (field: keyof SiteSettings, value: string) => {
    handleInputChange(field, value);
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
            <p className="text-gray-600">
              Manage site branding, logo, favicon and footer
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePreview}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{loading ? "Saving..." : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus !== "idle" && (
        <div
          className={`flex items-center space-x-2 p-4 rounded-lg ${
            saveStatus === "success"
              ? "bg-orange-50 text-orange-700 border border-orange-200"
              : saveStatus === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {saveStatus === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : saveStatus === "error" ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <RefreshCw className="h-5 w-5 animate-spin" />
          )}
          <span>
            {saveStatus === "success"
              ? "Site settings saved successfully!"
              : saveStatus === "error"
              ? "Failed to save site settings"
              : "Saving site settings..."}
          </span>
        </div>
      )}

      {/* AI Context Settings - Fields that AI will use for content generation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 space-y-6">
        <div className="border-b border-blue-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Context Settings</h2>
              <p className="text-sm text-gray-600 mt-1">These details help AI generate better, more relevant content for your website</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Website Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Website Name *
              <span className="block text-xs font-normal text-gray-600 mt-1">Official name of your website/brand</span>
            </label>
            <input
              type="text"
              value={settings.websiteName}
              onChange={(e) => handleInputChange("websiteName", e.target.value)}
              placeholder="e.g., Tasty Kitchen"
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Owner/Company Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Owner/Company Name *
              <span className="block text-xs font-normal text-gray-600 mt-1">Person or company that owns the website</span>
            </label>
            <input
              type="text"
              value={settings.ownerName}
              onChange={(e) => handleInputChange("ownerName", e.target.value)}
              placeholder="e.g., John Smith or Tasty Kitchen LLC"
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Business Type *
              <span className="block text-xs font-normal text-gray-600 mt-1">What type of website is this?</span>
            </label>
            <select
              value={settings.businessType}
              onChange={(e) => handleInputChange("businessType", e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="Personal Blog">Personal Blog</option>
              <option value="Business Website">Business Website</option>
              <option value="Online Magazine">Online Magazine</option>
              <option value="Recipe Portal">Recipe Portal</option>
              <option value="Food Blog">Food Blog</option>
              <option value="Restaurant Website">Restaurant Website</option>
              <option value="E-commerce Store">E-commerce Store</option>
            </select>
          </div>

          {/* Country/Region */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Country/Region *
              <span className="block text-xs font-normal text-gray-600 mt-1">Primary location for legal compliance</span>
            </label>
            <select
              value={settings.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Spain">Spain</option>
              <option value="Italy">Italy</option>
              <option value="Netherlands">Netherlands</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Primary Language */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Primary Language *
              <span className="block text-xs font-normal text-gray-600 mt-1">Main language for content generation</span>
            </label>
            <select
              value={settings.primaryLanguage}
              onChange={(e) => handleInputChange("primaryLanguage", e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Dutch">Dutch</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Domain (from existing fields) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Domain Name *
              <span className="block text-xs font-normal text-gray-600 mt-1">Your website domain (e.g., example.com)</span>
            </label>
            <input
              type="text"
              value={settings.siteDomain}
              onChange={(e) => handleInputChange("siteDomain", e.target.value)}
              placeholder="e.g., tastykitchen.com"
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">💡 How AI uses this information:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Generate accurate legal documents (Privacy Policy, Terms of Service)</li>
                <li>Create SEO-optimized titles and descriptions with your brand name</li>
                <li>Include proper contact information in generated content</li>
                <li>Match content tone to your business type and audience</li>
                <li>Apply correct legal compliance (GDPR, CCPA) based on region</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <div>
        <AIContentAssistant
          settings={settings}
          onUpdate={handleAIUpdate}
          websiteType="recipe website"
          businessName={settings.logoText || "Recipe Website"}
          targetAudience="food lovers and home cooks"
        />
      </div>

      {/* Manual Settings Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Additional Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Configure site contact and footer information</p>
        </div>

        {/* Site URL */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Site URL
            <span className="ml-2 text-xs font-normal text-gray-500">Main website URL (e.g., https://yoursite.com)</span>
          </label>
          <input
            type="url"
            value={settings.siteUrl}
            onChange={(e) => handleInputChange("siteUrl", e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Site Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Site Email
            <span className="ml-2 text-xs font-normal text-gray-500">Contact email for your website</span>
          </label>
          <input
            type="email"
            value={settings.siteEmail}
            onChange={(e) => handleInputChange("siteEmail", e.target.value)}
            placeholder="contact@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Footer Copyright */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Footer Copyright
            <span className="ml-2 text-xs font-normal text-gray-500">Copyright notice for website footer</span>
          </label>
          <input
            type="text"
            value={settings.footerCopyright}
            onChange={(e) => handleInputChange("footerCopyright", e.target.value)}
            placeholder="© 2025 Your Website. All rights reserved."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Footer Version */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Footer Version/Info
            <span className="ml-2 text-xs font-normal text-gray-500">Additional footer information or version</span>
          </label>
          <input
            type="text"
            value={settings.footerVersion}
            onChange={(e) => handleInputChange("footerVersion", e.target.value)}
            placeholder="V0.1"
            maxLength={50}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {settings.footerVersion && (
            <p className="text-xs text-gray-500">{settings.footerVersion.length}/50 characters</p>
          )}
        </div>
      </div>

      {/* Last Updated */}
      {settings.lastUpdated && (
        <div className="text-sm text-gray-500 text-center">
          Last updated: {new Date(settings.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
}