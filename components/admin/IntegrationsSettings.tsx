"use client";

import React, { useState, useEffect } from "react";
import { Puzzle, Save, Loader2, Mail, Code, FileText } from "lucide-react";
import { adminFetch } from '@/lib/admin-fetch';

interface EmailSettings {
  provider: 'gmail' | 'custom';
  email: string;
  appPassword?: string;
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  from?: string;
}

interface IntegrationsConfig {
  googleTagManagerId: string;
  emailSettings?: EmailSettings;
  headerCode: string;
  bodyCode: string;
  footerCode: string;
  adsTxt: string;
  robotsTxt: string;
}

export default function IntegrationsSettings() {
  const [config, setConfig] = useState<IntegrationsConfig>({ 
    googleTagManagerId: "",
    emailSettings: {
      provider: 'gmail',
      email: '',
      appPassword: '',
      host: '',
      port: 587,
      user: '',
      pass: '',
      from: ''
    },
    headerCode: "",
    bodyCode: "",
    footerCode: "",
    adsTxt: "",
    robotsTxt: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminFetch("/api/admin/integrations");
      if (response.ok) {
        const data = await response.json();
        setConfig({ 
          googleTagManagerId: data.googleTagManagerId || "",
          emailSettings: data.emailSettings || {
            provider: 'gmail',
            email: '',
            appPassword: '',
            host: '',
            port: 587,
            user: '',
            pass: '',
            from: ''
          },
          headerCode: data.headerCode || "",
          bodyCode: data.bodyCode || "",
          footerCode: data.footerCode || "",
          adsTxt: data.adsTxt || "",
          robotsTxt: data.robotsTxt || ""
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await adminFetch("/api/admin/integrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Settings saved successfully" });
      } else {
        setMessage({ type: "error", text: "Failed to save settings" });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "An error occurred while saving" });
    } finally {
      setSaving(false);
    }
  };

  const updateEmailSettings = (key: keyof EmailSettings, value: any) => {
    setConfig(prev => ({
      ...prev,
      emailSettings: {
        ...prev.emailSettings!,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
          <p className="text-gray-500">Manage third-party integrations and services.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Google Tag Manager */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Puzzle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Google Tag Manager</h3>
            </div>
            
            <div>
              <label htmlFor="gtm-id" className="block text-sm font-medium text-gray-700 mb-1">
                Container ID (GTM-XXXXXX)
              </label>
              <input
                id="gtm-id"
                type="text"
                value={config.googleTagManagerId}
                onChange={(e) => setConfig({ ...config, googleTagManagerId: e.target.value })}
                placeholder="GTM-XXXXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter your Google Tag Manager Container ID. This will enable GTM on all pages.
              </p>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Mail className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="provider"
                      checked={config.emailSettings?.provider === 'gmail'}
                      onChange={() => updateEmailSettings('provider', 'gmail')}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span>Gmail (Recommended)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="provider"
                      checked={config.emailSettings?.provider === 'custom'}
                      onChange={() => updateEmailSettings('provider', 'custom')}
                      className="text-orange-500 focus:ring-orange-500"
                    />
                    <span>Custom SMTP</span>
                  </label>
                </div>
              </div>

              {config.emailSettings?.provider === 'gmail' ? (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gmail Address</label>
                    <input
                      type="email"
                      value={config.emailSettings.email}
                      onChange={(e) => updateEmailSettings('email', e.target.value)}
                      placeholder="your-email@gmail.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">App Password</label>
                    <input
                      type="password"
                      value={config.emailSettings.appPassword}
                      onChange={(e) => updateEmailSettings('appPassword', e.target.value)}
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      To get an App Password: Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Google App Passwords</a>.
                      Select "Mail" and "Other (Custom name)" and generate a password.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                      <input
                        type="text"
                        value={config.emailSettings?.host}
                        onChange={(e) => updateEmailSettings('host', e.target.value)}
                        placeholder="smtp.example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                      <input
                        type="number"
                        value={config.emailSettings?.port}
                        onChange={(e) => updateEmailSettings('port', parseInt(e.target.value))}
                        placeholder="587"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={config.emailSettings?.user}
                        onChange={(e) => updateEmailSettings('user', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={config.emailSettings?.pass}
                        onChange={(e) => updateEmailSettings('pass', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Address</label>
                    <input
                      type="text"
                      value={config.emailSettings?.from}
                      onChange={(e) => updateEmailSettings('from', e.target.value)}
                      placeholder='"My Site" <noreply@example.com>'
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Code Injection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Code className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Custom Code Injection</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Header Code (HTML)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Code to be injected into the &lt;head&gt; section. Useful for verification tags, custom meta tags, etc.
                </p>
                <textarea
                  value={config.headerCode}
                  onChange={(e) => setConfig({ ...config, headerCode: e.target.value })}
                  placeholder="<meta name='verification' content='...' />"
                  className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body Code (HTML)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Code to be injected at the beginning of the &lt;body&gt; section.
                </p>
                <textarea
                  value={config.bodyCode}
                  onChange={(e) => setConfig({ ...config, bodyCode: e.target.value })}
                  placeholder="<!-- Custom body code -->"
                  className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer Code (HTML)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Code to be injected before the closing &lt;/body&gt; tag. Useful for tracking scripts.
                </p>
                <textarea
                  value={config.footerCode}
                  onChange={(e) => setConfig({ ...config, footerCode: e.target.value })}
                  placeholder="<script>...</script>"
                  className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEO Files Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">SEO Files</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ads.txt Content
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Content for your ads.txt file. This file is used to declare authorized sellers of your inventory.
              </p>
              <textarea
                value={config.adsTxt}
                onChange={(e) => setConfig({ ...config, adsTxt: e.target.value })}
                placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
                className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                robots.txt Content
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Content for your robots.txt file. This file tells search engine crawlers which pages or files they can or can't request from your site.
              </p>
              <textarea
                value={config.robotsTxt}
                onChange={(e) => setConfig({ ...config, robotsTxt: e.target.value })}
                placeholder="User-agent: *&#10;Allow: /"
                className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
