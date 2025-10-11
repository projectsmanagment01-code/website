"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Key,
  TestTube,
  Power,
  Save,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Zap,
  Brain,
  Settings,
  Unplug,
} from "lucide-react";

interface AISettings {
  enabled: boolean;
  provider: "openai" | "gemini";
  apiKeys: {
    openai: string;
    gemini: string;
  };
  model: string;
  temperature: number;
  maxTokens: number;
  features: {
    contentGeneration: boolean;
    recipeAssistance: boolean;
    seoOptimization: boolean;
    imageAnalysis: boolean;
    imageDescriptions: boolean;
    objectDetection: boolean;
  };
  lastTested: string | null;
  connectionStatus: "connected" | "disconnected" | "testing";
}

export default function AIPlugin() {
  const [settings, setSettings] = useState<AISettings>({
    enabled: false,
    provider: "gemini",
    apiKeys: {
      openai: "",
      gemini: "",
    },
    model: "gemini-2.5-flash",
    temperature: 0.7,
    maxTokens: 1000,
    features: {
      contentGeneration: true,
      recipeAssistance: true,
      seoOptimization: false,
      imageAnalysis: true,
      imageDescriptions: true,
      objectDetection: false,
    },
    lastTested: null,
    connectionStatus: "disconnected",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [showApiKey, setShowApiKey] = useState(false);

  const providers = [
    {
      id: "openai" as const,
      name: "OpenAI",
      model: "gpt-4.1-mini",
      icon: "🤖",
      supportsVision: true
    },
    {
      id: "gemini" as const,
      name: "Google Gemini",
      model: "gemini-2.5-flash",
      icon: "💎",
      supportsVision: true
    },
  ];

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setMessage({ type: "error", text: "Not authenticated" });
        return;
      }

      const response = await fetch("/api/admin/ai-settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
      } else if (response.status === 404) {
        console.log("No existing AI settings found, using defaults");
      } else {
        console.error("Failed to load AI settings:", response.status);
      }
    } catch (error) {
      console.error("Error loading AI settings:", error);
      setMessage({ type: "error", text: "Error loading AI settings" });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setMessage({ type: "error", text: "Not authenticated" });
        return;
      }

      const response = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "AI settings saved successfully!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to save AI settings" });
      }
    } catch (error) {
      console.error("Error saving AI settings:", error);
      setMessage({ type: "error", text: "Error saving AI settings" });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    const currentApiKey = settings.apiKeys[settings.provider];
    if (!currentApiKey) {
      setMessage({ 
        type: "error", 
        text: `Please enter your ${settings.provider} API key first` 
      });
      return;
    }

    try {
      setTesting(true);
      setSettings(prev => ({ ...prev, connectionStatus: "testing" }));
      
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/ai-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: settings.provider,
          apiKey: currentApiKey,
          model: settings.model,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSettings(prev => ({
          ...prev,
          connectionStatus: "connected",
          lastTested: new Date().toISOString(),
        }));
        setMessage({ 
          type: "success", 
          text: `✅ Connection successful! Response: "${result.testResponse}"` 
        });
      } else {
        setSettings(prev => ({ ...prev, connectionStatus: "disconnected" }));
        setMessage({ 
          type: "error", 
          text: `Connection failed: ${result.error || "Unknown error"}` 
        });
      }
    } catch (error) {
      console.error("Error testing AI connection:", error);
      setSettings(prev => ({ ...prev, connectionStatus: "disconnected" }));
      setMessage({ type: "error", text: "Error testing connection" });
    } finally {
      setTesting(false);
    }
  };

  const disconnectProvider = async () => {
    try {
      // Clear the API key for the current provider
      const clearedSettings = {
        ...settings,
        apiKeys: {
          ...settings.apiKeys,
          [settings.provider]: ""
        },
        connectionStatus: "disconnected" as const,
        lastTested: null,
        enabled: false
      };
      
      setSettings(clearedSettings);
      
      // Save the updated settings
      setSaving(true);
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setMessage({ type: "error", text: "Not authenticated" });
        return;
      }

      const response = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clearedSettings),
      });

      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: `🔌 Disconnected from ${currentProvider?.name}. API key cleared and AI disabled.` 
        });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: "error", text: "Failed to save disconnect settings" });
      }
    } catch (error) {
      console.error("Error disconnecting provider:", error);
      setMessage({ type: "error", text: "Error disconnecting provider" });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const currentProvider = providers.find(p => p.id === settings.provider);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>Loading AI settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Bot className="w-8 h-8 text-purple-600" />
            AI Plugin
          </h1>
          <p className="text-gray-600">
            Configure AI assistance for content generation and recipe management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            settings.enabled 
              ? "bg-green-100 text-green-700" 
              : "bg-gray-100 text-gray-600"
          }`}>
            {settings.enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === "success"
            ? "bg-green-50 border-green-200 text-green-700"
            : message.type === "error"
            ? "bg-red-50 border-red-200 text-red-700"
            : "bg-blue-50 border-blue-200 text-blue-700"
        }`}>
          <div className="flex items-center gap-2">
            {message.type === "success" && <CheckCircle className="w-4 h-4" />}
            {message.type === "error" && <AlertCircle className="w-4 h-4" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Provider Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              AI Provider Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setSettings(prev => ({ 
                        ...prev, 
                        provider: provider.id,
                        model: provider.model 
                      }))}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        settings.provider === provider.id
                          ? "border-purple-200 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">{provider.icon}</div>
                      <div className="font-medium">{provider.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Selected Model:</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg border">
                    <span className="font-mono text-sm text-gray-800">{currentProvider?.model}</span>
                    {currentProvider?.supportsVision && (
                      <span className="ml-2 text-xs text-green-600 flex items-center gap-1">
                        <span>👁️</span>
                        <span>Vision Supported</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key Configuration
                </h4>
                
                {settings.provider === "openai" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OpenAI API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={settings.apiKeys.openai}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          apiKeys: { ...prev.apiKeys, openai: e.target.value }
                        }))}
                        placeholder="sk-..."
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        {showApiKey ? "Hide" : "Show"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Get your API key from{" "}
                      <a 
                        href="https://platform.openai.com/api-keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        OpenAI Platform
                      </a>
                    </p>
                  </div>
                )}

                {settings.provider === "gemini" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Gemini API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={settings.apiKeys.gemini}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          apiKeys: { ...prev.apiKeys, gemini: e.target.value }
                        }))}
                        placeholder="AIza..."
                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-2 px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        {showApiKey ? "Hide" : "Show"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Get your API key from{" "}
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={testConnection}
                  disabled={testing || !settings.apiKeys[settings.provider]}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                  Test Connection
                </button>

                {settings.apiKeys[settings.provider] && (
                  <button
                    onClick={disconnectProvider}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Unplug className="w-4 h-4" />
                    )}
                    Disconnect & Clear
                  </button>
                )}
                
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  settings.connectionStatus === "connected"
                    ? "bg-green-100 text-green-700"
                    : settings.connectionStatus === "testing"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    settings.connectionStatus === "connected"
                      ? "bg-green-500"
                      : settings.connectionStatus === "testing"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-red-500"
                  }`} />
                  <span className="text-sm font-medium">
                    {settings.connectionStatus === "connected" ? "Connected" : 
                     settings.connectionStatus === "testing" ? "Testing..." : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-gray-600" />
              Advanced Settings
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature ({settings.temperature})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    temperature: parseFloat(e.target.value) 
                  }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Conservative</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    maxTokens: parseInt(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features & Controls */}
        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Power className="w-5 h-5 text-gray-600" />
              Plugin Control
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Enable AI Plugin</div>
                  <div className="text-sm text-gray-500">
                    Turn on AI assistance features
                  </div>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enabled ? "bg-green-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              
              {settings.lastTested && (
                <div className="text-xs text-gray-500">
                  Last tested: {new Date(settings.lastTested).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* AI Features */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-gray-600" />
              AI Features
            </h3>
            
            <div className="space-y-3">
              {Object.entries(settings.features).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {key === 'contentGeneration' && 'Auto-generate blog content'}
                      {key === 'recipeAssistance' && 'Recipe suggestions & improvements'}
                      {key === 'seoOptimization' && 'Optimize content for search engines'}
                      {key === 'imageAnalysis' && 'Analyze and understand images'}
                      {key === 'imageDescriptions' && 'Auto-generate image alt text'}
                      {key === 'objectDetection' && 'Detect objects in images with bounding boxes'}
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      features: { ...prev.features, [key]: !enabled }
                    }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      enabled ? "bg-green-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        enabled ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}