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

interface SiteSettingsEditorProps {
  onBack?: () => void;
}

export default function SiteSettingsEditor({ onBack }: SiteSettingsEditorProps) {
  const [settings, setSettings] = useState<SiteSettings>({
    logoType: "text",
    logoText: "",
    logoTagline: "",
    logoImage: "",
    favicon: "",
    footerCopyright: "",
    footerVersion: "",
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
      const response = await fetch("/api/admin/content/site", {
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

      if (response.ok) {
        setSaveStatus("success");
        setSettings((prev) => ({
          ...prev,
          lastUpdated: new Date().toISOString(),
        }));
        
        // Immediately revalidate all pages since site settings affect the entire site
        await refreshAfterChange(['site']);
        
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
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

      {/* Last Updated */}
      {settings.lastUpdated && (
        <div className="text-sm text-gray-500 text-center">
          Last updated: {new Date(settings.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
}