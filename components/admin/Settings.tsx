"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Edit3,
  FileText,
  Settings as SettingsIcon,
  Download,
  Upload,
} from "lucide-react";
import { refreshAfterChange } from "@/lib/revalidation-utils";

interface CodeSection {
  html: string[];
  css: string[];
  javascript: string[];
}

interface CustomCodeSettings {
  header: CodeSection;
  body: CodeSection;
  footer: CodeSection;
  adsTxt: string;
  robotsTxt: string;
  lastUpdated: string | null;
  updatedBy: string | null;
}

interface SettingsProps {
  className?: string;
}

type Tab =
  | "header"
  | "body"
  | "footer"
  | "ads"
  | "robots";

type CodeType = "html" | "css" | "javascript";

export default function Settings({ className }: SettingsProps) {
  const [settings, setSettings] = useState<CustomCodeSettings>({
    header: { html: [], css: [], javascript: [] },
    body: { html: [], css: [], javascript: [] },
    footer: { html: [], css: [], javascript: [] },
    adsTxt: "# ads.txt file\n# Add your authorized seller information here",
    robotsTxt: "",
    lastUpdated: null,
    updatedBy: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("header");
  const [activeCodeType, setActiveCodeType] = useState<CodeType>("html");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingFile, setEditingFile] = useState<boolean>(false);
  const [fileEditValue, setFileEditValue] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setMessage({ type: "error", text: "Not authenticated" });
        return;
      }

      const response = await fetch("/api/admin/settings", {
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
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(async () => {
    try {
      setSaving(true);
      setMessage(null);
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setMessage({ type: "error", text: "Not authenticated" });
        return;
      }

      const response = await fetch("/api/admin/settings", {
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
        setMessage({ type: "success", text: "Settings saved successfully!" });
        
        // Immediately revalidate all pages since custom code affects the entire site
        await refreshAfterChange(['site', 'all']);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to save settings",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Error saving settings" });
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const isFileMode = useCallback(
    (tab: Tab) => ["ads", "robots"].includes(tab),
    []
  );

  const addCodeBlock = () => {
    if (isFileMode(activeTab)) return;

    const newCode = "";
    setSettings((prev) => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab as keyof CustomCodeSettings] as CodeSection),
        [activeCodeType]: [
          ...(prev[activeTab as keyof CustomCodeSettings] as CodeSection)[
            activeCodeType
          ],
          newCode,
        ],
      },
    }));
    setEditingIndex(
      (
        (settings[activeTab as keyof CustomCodeSettings] as CodeSection)[
          activeCodeType
        ] || []
      ).length
    );
    setEditValue(newCode);
  };

  const updateCodeBlock = (index: number, value: string) => {
    if (isFileMode(activeTab)) return;

    setSettings((prev) => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab as keyof CustomCodeSettings] as CodeSection),
        [activeCodeType]: (
          (prev[activeTab as keyof CustomCodeSettings] as CodeSection)[
            activeCodeType
          ] || []
        ).map((code: string, i: number) => (i === index ? value : code)),
      },
    }));
  };

  const removeCodeBlock = (index: number) => {
    if (isFileMode(activeTab)) return;

    setSettings((prev) => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab as keyof CustomCodeSettings] as CodeSection),
        [activeCodeType]: (
          (prev[activeTab as keyof CustomCodeSettings] as CodeSection)[
            activeCodeType
          ] || []
        ).filter((_: string, i: number) => i !== index),
      },
    }));
  };

  const startEditing = (index: number) => {
    if (isFileMode(activeTab)) return;

    setEditingIndex(index);
    setEditValue(
      (
        (settings[activeTab as keyof CustomCodeSettings] as CodeSection)[
          activeCodeType
        ] || []
      )[index]
    );
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      updateCodeBlock(editingIndex, editValue);
      setEditingIndex(null);
      setEditValue("");
      
      // Note: This updates local state, actual save happens via saveSettings button
      // No need for revalidation here since it's just editing in-memory
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const startEditingFile = () => {
    if (activeTab === "ads") {
      setFileEditValue(settings.adsTxt);
    } else if (activeTab === "robots") {
      setFileEditValue(settings.robotsTxt);
    }
    setEditingFile(true);
  };

  const saveFileEdit = async () => {
    if (activeTab === "ads") {
      setSettings((prev) => ({ ...prev, adsTxt: fileEditValue }));
    } else if (activeTab === "robots") {
      setSettings((prev) => ({ ...prev, robotsTxt: fileEditValue }));
    }
    setEditingFile(false);
    setFileEditValue("");
    
    // Note: This updates local state, actual API save happens via saveSettings button
    // No need for revalidation here since it's just editing in-memory
  };

  const cancelFileEdit = () => {
    setEditingFile(false);
    setFileEditValue("");
  };

  const downloadFile = () => {
    let content = "";
    let filename = "";

    if (activeTab === "ads") {
      content = settings.adsTxt;
      filename = "ads.txt";
    } else if (activeTab === "robots") {
      content = settings.robotsTxt;
      filename = "robots.txt";
    } else {
      return; // Should not happen in file mode
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;

      if (activeTab === "ads") {
        setSettings((prev) => ({ ...prev, adsTxt: content }));
      } else if (activeTab === "robots") {
        setSettings((prev) => ({ ...prev, robotsTxt: content }));
      }

      setMessage({
        type: "success",
        text: `${file.name} uploaded successfully!`,
      });
    };
    reader.readAsText(file);
  };

  const getCodeTypeLabel = (type: CodeType) => {
    switch (type) {
      case "html":
        return "HTML";
      case "css":
        return "CSS";
      case "javascript":
        return "JavaScript";
    }
  };

  const getSectionLabel = (section: Tab) => {
    switch (section) {
      case "header":
        return "Header";
      case "body":
        return "Body";
      case "footer":
        return "Footer";
      case "ads":
        return "Ads.txt";
      case "robots":
        return "Robots.txt";
      default:
        // For static pages like 'about', 'contact', etc.
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

  const currentIsFileMode = isFileMode(activeTab);

  const tabOptions = [
    { key: "header", label: "Header Code", icon: SettingsIcon },
    { key: "body", label: "Body Code", icon: SettingsIcon },
    { key: "footer", label: "Footer Code", icon: SettingsIcon },
    { key: "ads", label: "Ads.txt", icon: FileText },
    { key: "robots", label: "Robots.txt", icon: FileText },
  ];

  const codeBlocks = currentIsFileMode
    ? []
    : (settings[activeTab as keyof CustomCodeSettings] as CodeSection)?.[
        activeCodeType
      ] || [];

  const renderFileContent = () => {
    const currentFileContent =
      activeTab === "ads"
        ? settings.adsTxt
        : activeTab === "robots"
        ? settings.robotsTxt
        : "";

    return (
      <>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">File Content</h4>
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
                className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                style={{
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
                placeholder={`Enter your ${getSectionLabel(activeTab)} content here...`}
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
          <pre className="bg-gray-50 p-3 rounded-md text-sm font-mono overflow-x-auto max-h-64 whitespace-pre-wrap">
            {currentFileContent || `# Empty ${getSectionLabel(activeTab)} file`}
          </pre>
        )}
      </>
    );
  };  const renderFileHelpText = () => {
    switch (activeTab) {
      case "ads":
        return (
          <>
            <li>
              • <strong>Ads.txt</strong> helps prevent unauthorized
              inventory sales
            </li>
            <li>
              • List authorized sellers in format:{" "}
              <code>domain.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0</code>
            </li>
            <li>
              • Use <code>DIRECT</code> for direct relationships,{" "}
              <code>RESELLER</code> for resellers
            </li>
            <li>
              • Each line should contain: domain, publisher ID,
              relationship type, certification authority ID
            </li>
          </>
        );
      case "robots":
        return (
          <>
            <li>
              • <strong>Robots.txt</strong> tells search engines which
              pages to crawl
            </li>
            <li>
              • <code>User-agent: *</code> applies to all search engines
            </li>
            <li>
              • <code>Allow:</code> specifies pages that can be crawled
            </li>
            <li>
              • <code>Disallow:</code> specifies pages that should not be
              crawled
            </li>
            <li>
              • <code>Sitemap:</code> tells search engines where to find
              your sitemap
            </li>
          </>
        );
      default: // Static pages
        return (
          <>
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
          </>
        );
    }
  };

  return (
    <div className={`space-y-4 md:space-y-6 ${className || ""}`}>
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Admin Settings
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Manage custom code blocks, SEO files, and static page content for your
          website.
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
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabOptions.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as Tab)}
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

      {/* Content based on active tab */}
      {currentIsFileMode ? (
        /* File Management Mode */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {getSectionLabel(activeTab)} Content
            </h3>
            <div className="flex gap-2">
              {(activeTab === "ads" || activeTab === "robots") && (
                <>
                  <button
                    onClick={downloadFile}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                  <label className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                    <input
                      type="file"
                      accept={activeTab === "ads" || activeTab === "robots" ? ".txt" : ".html,.txt"}
                      onChange={uploadFile}
                      className="hidden"
                    />
                  </label>
                </>
              )}
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

          {/* File Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {renderFileContent()}
          </div>

          {/* Help Text for Files */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              {getSectionLabel(activeTab)} Guidelines
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {renderFileHelpText()}
            </ul>
          </div>
        </div>
      ) : (
        /* Code Blocks Mode */
        <>
          {/* Code Type Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {(["html", "css", "javascript"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveCodeType(type)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeCodeType === type
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {getCodeTypeLabel(type)}
                </button>
              ))}
            </nav>
          </div>

          {/* Code Blocks Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {getSectionLabel(activeTab as "header" | "body" | "footer")} -{" "}
                {getCodeTypeLabel(activeCodeType)} Blocks
                <span className="ml-2 text-sm text-gray-500">
                  ({codeBlocks.length} blocks)
                </span>
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={addCodeBlock}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Block
                </button>
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
                  {saving ? "Saving..." : "Save All"}
                </button>
              </div>
            </div>

            {/* Code Blocks List */}
            <div className="space-y-4">
              {codeBlocks.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">No code blocks yet</p>
                  <button
                    onClick={addCodeBlock}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Code Block
                  </button>
                </div>
              ) : (
                codeBlocks.map((codeBlock: string, index: number) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Code Block #{index + 1}
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(index)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => removeCodeBlock(index)}
                          className="inline-flex items-center px-2 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>

                    {editingIndex === index ? (
                      <div className="space-y-3">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full h-48 p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                          style={{
                            fontFamily:
                              'Monaco, Menlo, "Ubuntu Mono", monospace',
                            fontSize: "14px",
                            lineHeight: "1.5",
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <pre className="bg-gray-50 p-3 rounded-md text-sm font-mono overflow-x-auto max-h-48">
                        {codeBlock || "// Empty code block"}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Help Text for Code */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Code Block Guidelines
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • <strong>Header:</strong> Code inserted in {"<head>"} section
                  (meta tags, stylesheets, scripts)
                </li>
                 <li>
                  • <strong>Body:</strong> Code inserted after {"<body>"} tag
                  (tracking scripts, widgets)
                </li>
                <li>
                  • <strong>Footer:</strong> Code inserted before {"<body>"} tag
                  (analytics, performance scripts)
                </li>
                <li>
                  • Each section can have multiple code blocks that will be
                  combined
                </li>
                <li>
                  • Always test your code in a development environment first
                </li>
                <li>• Invalid code may break your website's functionality</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
