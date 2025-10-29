"use client";

import React, { useState, useEffect } from "react";
import {
import { adminFetch } from '@/lib/admin-fetch';
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Edit3,
  FileText,
} from "lucide-react";

interface AdminSettings {
  staticPages: {
    about: string;
    contact: string;
    privacy: string;
    terms: string;
    faq: string;
    disclaimer: string;
    cookies: string;
  };
  hero: {
    page: string;
    content: string;
  };
  lastUpdated: string | null;
  updatedBy: string | null;
}

interface ContentManagementProps {
  className?: string;
}

export default function ContentManagement({ className }: ContentManagementProps) {
  const [settings, setSettings] = useState<AdminSettings>({
    staticPages: {
      about: "",
      contact: "",
      privacy: "",
      terms: "",
      faq: "",
      disclaimer: "",
      cookies: "",
    },
    hero: {
      page: "",
      content: "",
    },
    lastUpdated: null,
    updatedBy: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    "about" | "contact" | "privacy" | "terms" | "faq" | "disclaimer" | "cookies" | "hero"
  >("about");
  const [editingFile, setEditingFile] = useState<boolean>(false);
  const [fileEditValue, setFileEditValue] = useState("");

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setMessage({ type: "error", text: "Not authenticated" });
        return;
      }

      // Load settings from API
      const response = await adminFetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        setMessage({ type: "error", text: "Failed to load settings" });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      setMessage({ type: "error", text: "Error loading settings" });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const token = localStorage.getItem("admin_token");
      if (!token) {
        setMessage({ type: "error", text: "Not authenticated" });
        return;
      }

      const response = await adminFetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setMessage({ type: "success", text: "Content saved successfully!" });
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to save content",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Error saving content" });
    } finally {
      setSaving(false);
    }
  };

  const startEditingFile = () => {
    let contentToEdit = '';
    if (activeTab === "hero") {
      contentToEdit = settings.hero.content;
    } else {
      contentToEdit = settings.staticPages[activeTab as keyof typeof settings.staticPages];
    }
    
    console.log('=== START EDITING FILE ===');
    console.log('Active tab:', activeTab);
    console.log('Content length:', contentToEdit?.length || 0);
    console.log('First 200 chars:', contentToEdit?.substring(0, 200));
    console.log('Last 200 chars:', contentToEdit?.substring(Math.max(0, (contentToEdit?.length || 0) - 200)));
    
    setFileEditValue(contentToEdit);
    setEditingFile(true);
  };

  const saveFileEdit = async () => {
    if (activeTab === "hero") {
      setSettings((prev) => ({
        ...prev,
        hero: { ...prev.hero, content: fileEditValue },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        staticPages: {
          ...prev.staticPages,
          [activeTab]: fileEditValue,
        },
      }));
    }
    setEditingFile(false);
    setFileEditValue("");
  };

  const cancelFileEdit = () => {
    setEditingFile(false);
    setFileEditValue("");
  };

  const getSectionLabel = (section: string) => {
    switch (section) {
      case "about":
        return "About";
      case "contact":
        return "Contact";
      case "privacy":
        return "Privacy Policy";
      case "terms":
        return "Terms of Service";
      case "faq":
        return "FAQ";
      case "disclaimer":
        return "Disclaimer";
      case "cookies":
        return "Cookies Policy";
      case "hero":
        return "Hero Section";
      default:
        return String(section).charAt(0).toUpperCase() + String(section).slice(1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 md:space-y-6 ${className || ""}`}>
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Content Management
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Manage the content of your website's static pages including About, Contact, Privacy Policy, Terms of Service, FAQ, Disclaimer, and Cookies Policy.
        </p>
        {settings.lastUpdated && (
          <p className="text-xs md:text-sm text-gray-500 mt-2">
            Last updated: {new Date(settings.lastUpdated).toLocaleString()}
            {settings.updatedBy && ` by ${settings.updatedBy}`}
          </p>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-3 md:p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 md:w-5 h-4 md:h-5" />
          ) : (
            <AlertCircle className="w-4 md:w-5 h-4 md:h-5" />
          )}
          <span className="text-sm md:text-base">{message.text}</span>
        </div>
      )}

      {/* Page Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 md:space-x-8 overflow-x-auto pb-2">
          {[
            { key: "about", label: "About", icon: FileText },
            { key: "contact", label: "Contact", icon: FileText },
            { key: "privacy", label: "Privacy", icon: FileText },
            { key: "terms", label: "Terms", icon: FileText },
            { key: "faq", label: "FAQ", icon: FileText },
            { key: "disclaimer", label: "Disclaimer", icon: FileText },
            { key: "cookies", label: "Cookies", icon: FileText },
            { key: "hero", label: "Hero Section", icon: Edit3 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Page Content Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {getSectionLabel(activeTab)} Page Content
          </h3>
          <div className="flex gap-2">
            <button
              onClick={loadSettings}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {/* Hero Section Page Selector */}
          {activeTab === "hero" && (
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Hero Page</h4>
              <select
                value={settings.hero.page}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, page: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select page for hero section...</option>
                <option value="home">Home</option>
                <option value="about">About</option>
                <option value="recipes">Recipes</option>
                <option value="categories">Categories</option>
                <option value="contact">Contact</option>
              </select>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              {activeTab === "hero" ? "Hero Content (HTML)" : "Page Content"}
            </h4>
            <button
              onClick={startEditingFile}
              className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              Edit
            </button>
          </div>

          {editingFile ? (
            <div className="space-y-3">
              <textarea
                value={fileEditValue}
                onChange={(e) => setFileEditValue(e.target.value)}
                className="w-full h-screen p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500 resize-y"
                style={{
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
                placeholder={`Enter your ${getSectionLabel(activeTab).toLowerCase()} page content here...`}
              />
              <div className="flex gap-2">
                <button
                  onClick={saveFileEdit}
                  className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
                <button
                  onClick={cancelFileEdit}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <pre className="bg-gray-50 p-3 rounded-md text-sm font-mono overflow-x-auto max-h-screen whitespace-pre-wrap">
              {activeTab === "hero"
                ? settings.hero.content || `# Empty ${getSectionLabel(activeTab).toLowerCase()} content`
                : settings.staticPages[
                    activeTab as keyof typeof settings.staticPages
                  ] || `# Empty ${getSectionLabel(activeTab).toLowerCase()} page content`}
            </pre>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            {getSectionLabel(activeTab)} Page Guidelines
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              • <strong>Static Page Content</strong> allows you to manage
              the content of your website's static pages
            </li>
            <li>
              • Content can include HTML, text, and basic formatting
            </li>
            <li>
              • Changes will be reflected on the live website after saving
            </li>
            <li>• Use proper HTML structure for best display results</li>
            {activeTab === "privacy" && (
              <li>• Include all required privacy disclosures for your jurisdiction</li>
            )}
            {activeTab === "terms" && (
              <li>• Ensure terms are legally compliant and up-to-date</li>
            )}
            {activeTab === "cookies" && (
              <li>• List all cookies used on your website and their purposes</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
