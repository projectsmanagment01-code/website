"use client";

import React, { useState, useEffect } from "react";
import {
  Wand2,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Eye,
  Copy,
  Save,
  Bot,
  Globe,
  Shield,
} from "lucide-react";

interface AIPrivacyGeneratorProps {
  onGenerated: (content: string) => void;
  currentContent: string;
}

interface SiteInfo {
  name: string;
  domain: string;
  url: string;
  email: string;
  description: string;
}

export default function AIPrivacyGenerator({ onGenerated, currentContent }: AIPrivacyGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [providers, setProviders] = useState({ openai: false, gemini: false });
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('gemini');
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    checkAIAvailability();
    loadSiteInfo();
  }, []);

  const checkAIAvailability = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/ai-settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const settings = await response.json();
        console.log("AI Settings loaded:", settings); // Debug log
        
        // Check if AI is enabled and has at least one API key (even masked ones)
        const hasOpenAI = !!(settings.apiKeys.openai && settings.apiKeys.openai.trim());
        const hasGemini = !!(settings.apiKeys.gemini && settings.apiKeys.gemini.trim());
        const isAvailable = settings.enabled && (hasOpenAI || hasGemini);
        
        setAiAvailable(isAvailable);
        setProviders({
          openai: hasOpenAI,
          gemini: hasGemini,
        });
        
        // Set default provider based on availability
        if (hasGemini) {
          setSelectedProvider('gemini');
        } else if (hasOpenAI) {
          setSelectedProvider('openai');
        }
        
        console.log("AI Available:", isAvailable, "Providers:", { openai: hasOpenAI, gemini: hasGemini }); // Debug log
      } else {
        console.error("Failed to load AI settings:", response.status);
        setAiAvailable(false);
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
  };

  const generatePrivacyPolicy = async () => {
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
      
      const response = await fetch("/api/admin/generate-privacy-policy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate privacy policy");
      }

      const data = await response.json();
      console.log('=== RECEIVED PRIVACY POLICY ===');
      console.log('Privacy policy length:', data.privacyPolicy?.length || 0);
      console.log('Privacy policy preview (first 300):', data.privacyPolicy?.substring(0, 300));
      console.log('Privacy policy preview (last 300):', data.privacyPolicy?.substring(data.privacyPolicy.length - 300));
      console.log('=== END RECEIVED ===');
      
      setGeneratedContent(data.privacyPolicy);
      setPreviewMode(true);
      setMessage({
        type: "success",
        text: "Privacy policy generated successfully! Review it below and apply if satisfied.",
      });

    } catch (error) {
      console.error("Generation error:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to generate privacy policy",
      });
    } finally {
      setGenerating(false);
    }
  };

  const applyGeneratedPolicy = () => {
    console.log('=== APPLYING GENERATED POLICY ===');
    console.log('Generated content length before apply:', generatedContent.length);
    console.log('Generated content preview (first 200):', generatedContent.substring(0, 200));
    console.log('Generated content preview (last 200):', generatedContent.substring(generatedContent.length - 200));
    
    onGenerated(generatedContent);
    setPreviewMode(false);
    setMessage({
      type: "success",
      text: "Privacy policy applied! Don't forget to save your changes.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setMessage({
      type: "info",
      text: "Privacy policy copied to clipboard!",
    });
  };

  if (!aiAvailable) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-yellow-600" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">AI Generation Not Available</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Configure AI settings in the Plugins section to enable automatic privacy policy generation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Wand2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Privacy Policy Generator</h3>
          <p className="text-sm text-gray-600">
            Generate a comprehensive, legally-compliant privacy policy using AI
          </p>
        </div>
      </div>

      {/* Site Information Display */}
      {siteInfo && (
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Website Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span> {siteInfo.name}
            </div>
            <div>
              <span className="font-medium text-gray-700">Domain:</span> {siteInfo.domain}
            </div>
            <div>
              <span className="font-medium text-gray-700">URL:</span> {siteInfo.url}
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span> {siteInfo.email}
            </div>
          </div>
          <div className="mt-2">
            <span className="font-medium text-gray-700">Description:</span> {siteInfo.description}
          </div>
        </div>
      )}

      {/* Provider Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
        <div className="flex gap-2">
          {providers.gemini && (
            <button
              onClick={() => setSelectedProvider('gemini')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedProvider === 'gemini'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              💎 Gemini
            </button>
          )}
          {providers.openai && (
            <button
              onClick={() => setSelectedProvider('openai')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedProvider === 'openai'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              🤖 OpenAI
            </button>
          )}
        </div>
      </div>

      {/* Features List */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Generated Policy Will Include
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            GDPR Compliance
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            CCPA/CPRA Compliance
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Cookie Policy Details
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Data Collection & Usage
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            User Rights & Contact Info
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Recipe Website Specific Terms
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={generatePrivacyPolicy}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          {generating ? "Generating..." : "Generate Privacy Policy"}
        </button>

        {generatedContent && (
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? "Hide Preview" : "Show Preview"}
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg mb-4 flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : message.type === "error"
              ? "bg-red-50 border border-red-200 text-red-800"
              : "bg-blue-50 border border-blue-200 text-blue-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : message.type === "error" ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Info className="w-5 h-5" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Preview */}
      {previewMode && generatedContent && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Preview Generated Policy</h4>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={applyGeneratedPolicy}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Apply
              </button>
            </div>
          </div>
          <div 
            className="prose prose-lg max-w-none text-black border border-gray-200 rounded p-4 max-h-screen overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: generatedContent }}
          />
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Important Notes:</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• The generated policy uses your current website information</li>
              <li>• Review the content carefully before publishing</li>
              <li>• Consider consulting with a legal professional for compliance</li>
              <li>• Update the policy when your data practices change</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}