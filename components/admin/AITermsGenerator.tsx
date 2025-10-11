"use client";

import React, { useState, useEffect } from "react";

interface AITermsGeneratorProps {
  onGenerated: (content: string) => void;
}

interface Message {
  type: "success" | "error" | "info";
  text: string;
}

interface SiteInfo {
  name: string;
  domain: string;
  url: string;
  email: string;
  description: string;
}

export default function AITermsGenerator({ onGenerated }: AITermsGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [generatedContent, setGeneratedContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<"openai" | "gemini">("gemini");
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    name: "Recipe Website",
    domain: "example.com",
    url: "https://example.com",
    email: "contact@example.com",
    description: "A recipe sharing website",
  });

  useEffect(() => {
    checkAIAvailability();
    loadSiteInfo();
  }, []);

  const checkAIAvailability = async () => {
    try {
      const response = await fetch("/api/admin/ai-settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const settings = await response.json();
        setAiAvailable(settings.enabled);
        setSelectedProvider(settings.provider);
      }
    } catch (error) {
      console.error("Failed to check AI availability:", error);
      setAiAvailable(false);
    }
  };

  const loadSiteInfo = async () => {
    try {
      // Load site configuration from existing admin content/site API
      const siteResponse = await fetch("/api/admin/content/site", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (siteResponse.ok) {
        const siteData = await siteResponse.json();
        console.log("Site Data loaded:", siteData); // Debug log
        
        // Use actual values from the site settings
        const newSiteInfo = {
          name: siteData.siteTitle || "Recipe Website",
          domain: siteData.siteDomain || "example.com",
          url: siteData.siteUrl || "https://example.com", 
          email: siteData.siteEmail || "contact@example.com",
          description: siteData.siteDescription || "A recipe sharing website"
        };

        setSiteInfo(newSiteInfo);
        console.log("Site Info set:", newSiteInfo); // Debug log
      }
    } catch (error) {
      console.error("Failed to load site info:", error);
      // Set fallback values if loading fails
      setSiteInfo({
        name: "Recipe Website",
        domain: "example.com",
        url: "https://example.com",
        email: "contact@example.com",
        description: "A recipe sharing website"
      });
    }
  };  const generateTerms = async () => {
    if (!aiAvailable) {
      setMessage({
        type: "error",
        text: "AI is not configured. Please set up AI in the Plugins section first.",
      });
      return;
    }

    setGenerating(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("admin_token");
      
      const response = await fetch("/api/admin/generate-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate terms and conditions");
      }

      const data = await response.json();
      setGeneratedContent(data.terms);
      setPreviewMode(true);
      setMessage({
        type: "success",
        text: "Terms and conditions generated successfully! Review them below and apply if satisfied.",
      });

    } catch (error) {
      console.error("Generation error:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to generate terms and conditions",
      });
    } finally {
      setGenerating(false);
    }
  };

  const applyGeneratedTerms = () => {
    onGenerated(generatedContent);
    setPreviewMode(false);
    setMessage({
      type: "success",
      text: "Terms and conditions applied! Don't forget to save your changes.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setMessage({
      type: "info",
      text: "Terms and conditions copied to clipboard!",
    });
  };

  if (previewMode) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Generated Terms and Conditions Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Copy
            </button>
            <button
              onClick={() => setPreviewMode(false)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>

        <div 
          className="max-h-96 overflow-y-auto border border-gray-200 rounded p-4 mb-4 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: generatedContent }}
        />

        <div className="flex gap-3">
          <button
            onClick={applyGeneratedTerms}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply These Terms
          </button>
          <button
            onClick={generateTerms}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={generating}
          >
            {generating ? "Regenerating..." : "Generate New Version"}
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" :
            message.type === "error" ? "bg-red-100 text-red-800" :
            "bg-blue-100 text-blue-800"
          }`}>
            {message.text}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">AI Terms Generator</h3>
        <div className={`px-2 py-1 text-xs rounded ${
          aiAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {aiAvailable ? `AI Ready (${selectedProvider})` : "AI Not Available"}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium text-gray-900 mb-2">Website Information</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Name:</span> {siteInfo.name}</p>
            <p><span className="font-medium">Domain:</span> {siteInfo.domain}</p>
            <p><span className="font-medium">Email:</span> {siteInfo.email}</p>
            <p><span className="font-medium">Description:</span> {siteInfo.description}</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-medium text-blue-900 mb-2">AI Terms Generator</h4>
          <p className="text-sm text-blue-800 mb-3">
            Generate comprehensive terms and conditions tailored for your recipe website. 
            The AI will create legally sound terms covering content usage, liability, 
            intellectual property, and user responsibilities.
          </p>
          <ul className="text-sm text-blue-700 space-y-1 mb-3">
            <li>• 11 comprehensive legal sections</li>
            <li>• Recipe website specific clauses</li>
            <li>• Content disclaimer and liability terms</li>
            <li>• User-generated content policies</li>
            <li>• Intellectual property protection</li>
          </ul>
        </div>

        <button
          onClick={generateTerms}
          disabled={generating || !aiAvailable}
          className={`w-full py-2 px-4 rounded font-medium ${
            aiAvailable && !generating
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {generating ? "Generating Terms..." : "Generate Terms and Conditions"}
        </button>

        {message && (
          <div className={`p-3 rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" :
            message.type === "error" ? "bg-red-100 text-red-800" :
            "bg-blue-100 text-blue-800"
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}