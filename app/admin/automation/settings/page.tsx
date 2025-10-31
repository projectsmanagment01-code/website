'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  ExternalLink
} from 'lucide-react';

interface Settings {
  id?: string;
  googleSheetId?: string;
  googleSheetUrl?: string;
  googleCredentialsJson?: string;
  geminiApiKey?: string;
  geminiFlashModel?: string;
  geminiProModel?: string;
  websiteApiUrl?: string;
  websiteApiToken?: string;
  enablePinterest?: boolean;
  makeWebhookUrl?: string;
  enableIndexing?: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
  isConfigured?: boolean;
  lastTestedAt?: string;
  testStatus?: string;
  testMessage?: string;
}

export default function AutomationSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    geminiFlashModel: 'gemini-2.0-flash-exp',
    geminiProModel: 'gemini-1.5-pro',
    enablePinterest: false,
    enableIndexing: false,
    maxRetries: 3,
    retryDelayMs: 5000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  // Show/hide sensitive fields
  const [showGoogleCreds, setShowGoogleCreds] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/automation/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load settings');

      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      showMessage('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/automation/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
        showMessage('Settings saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/automation/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to test settings');

      const data = await response.json();
      
      if (data.success) {
        showMessage('All configurations validated successfully!', 'success');
      } else {
        showMessage(data.message || 'Configuration validation failed', 'error');
      }

      // Reload settings to get updated test status
      await loadSettings();
    } catch (error) {
      console.error('Failed to test settings:', error);
      showMessage('Failed to test settings', 'error');
    } finally {
      setTesting(false);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Automation Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure your automation credentials and settings. All sensitive data is encrypted in the database.
          </p>
        </div>

        {/* Status Badge */}
        {settings.isConfigured !== undefined && (
          <div className={`mb-6 p-4 rounded-lg border ${
            settings.isConfigured 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-2">
              {settings.isConfigured ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              <span className={`font-medium ${
                settings.isConfigured ? 'text-green-900' : 'text-yellow-900'
              }`}>
                {settings.isConfigured 
                  ? 'Automation is fully configured and ready to use' 
                  : 'Please complete all required fields to enable automation'}
              </span>
            </div>
            {settings.lastTestedAt && (
              <p className="text-sm text-gray-600 mt-2">
                Last tested: {new Date(settings.lastTestedAt).toLocaleString()}
                {settings.testMessage && ` - ${settings.testMessage}`}
              </p>
            )}
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-900'
              : messageType === 'error'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* Google Sheets Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Google Sheets Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Sheet ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.googleSheetId || ''}
                  onChange={(e) => setSettings({ ...settings, googleSheetId: e.target.value })}
                  placeholder="1abc123xyz..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Found in your sheet URL: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Sheet URL (optional, for reference)
                </label>
                <input
                  type="url"
                  value={settings.googleSheetUrl || ''}
                  onChange={(e) => setSettings({ ...settings, googleSheetUrl: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Service Account JSON <span className="text-red-500">*</span>
                  <button
                    type="button"
                    onClick={() => setShowGoogleCreds(!showGoogleCreds)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showGoogleCreds ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </label>
                <textarea
                  value={settings.googleCredentialsJson || ''}
                  onChange={(e) => setSettings({ ...settings, googleCredentialsJson: e.target.value })}
                  placeholder='{"type":"service_account","project_id":"...","private_key":"..."}'
                  rows={showGoogleCreds ? 8 : 3}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${!showGoogleCreds ? 'password-dots' : ''}`}
                  style={!showGoogleCreds ? { WebkitTextSecurity: 'disc' } as any : undefined}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste your entire Google Service Account JSON file content here
                  <a 
                    href="https://console.cloud.google.com/iam-admin/serviceaccounts" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1 inline-flex items-center gap-1"
                  >
                    Get credentials <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* AI Configuration Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-purple-600" />
              Gemini AI Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Gemini API Key <span className="text-red-500">*</span>
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </label>
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={settings.geminiApiKey || ''}
                  onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                  placeholder="AIza..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from Google AI Studio
                  <a 
                    href="https://makersuite.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1 inline-flex items-center gap-1"
                  >
                    Get API key <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flash Model (for prompts)
                  </label>
                  <input
                    type="text"
                    value={settings.geminiFlashModel || ''}
                    onChange={(e) => setSettings({ ...settings, geminiFlashModel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pro Model (for articles)
                  </label>
                  <input
                    type="text"
                    value={settings.geminiProModel || ''}
                    onChange={(e) => setSettings({ ...settings, geminiProModel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Website API Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-green-600" />
              Website API Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={settings.websiteApiUrl || ''}
                  onChange={(e) => setSettings({ ...settings, websiteApiUrl: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  API Token <span className="text-red-500">*</span>
                  <button
                    type="button"
                    onClick={() => setShowApiToken(!showApiToken)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showApiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </label>
                <input
                  type={showApiToken ? 'text' : 'password'}
                  value={settings.websiteApiToken || ''}
                  onChange={(e) => setSettings({ ...settings, websiteApiToken: e.target.value })}
                  placeholder="Your API token"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Generate a token in the API Tokens section of your admin panel
                </p>
              </div>
            </div>
          </div>

          {/* Optional Features Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Optional Features</h2>
            
            <div className="space-y-4">
              {/* Pinterest */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enablePinterest || false}
                    onChange={(e) => setSettings({ ...settings, enablePinterest: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">Enable Pinterest Integration</span>
                    <p className="text-sm text-gray-500">Send recipes to Pinterest via Make.com webhook</p>
                  </div>
                </label>

                {settings.enablePinterest && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Make.com Webhook URL
                    </label>
                    <input
                      type="url"
                      value={settings.makeWebhookUrl || ''}
                      onChange={(e) => setSettings({ ...settings, makeWebhookUrl: e.target.value })}
                      placeholder="https://hook.eu1.make.com/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Google Indexing */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableIndexing || false}
                    onChange={(e) => setSettings({ ...settings, enableIndexing: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">Enable Google Indexing</span>
                    <p className="text-sm text-gray-500">Automatically request indexing for published recipes</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Behavior Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Automation Behavior</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Retries
                </label>
                <input
                  type="number"
                  value={settings.maxRetries || 3}
                  onChange={(e) => setSettings({ ...settings, maxRetries: parseInt(e.target.value) })}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Number of retry attempts on failure</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retry Delay (ms)
                </label>
                <input
                  type="number"
                  value={settings.retryDelayMs || 5000}
                  onChange={(e) => setSettings({ ...settings, retryDelayMs: parseInt(e.target.value) })}
                  min="1000"
                  max="60000"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Delay between retry attempts</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>

            <button
              onClick={handleTest}
              disabled={testing || !settings.isConfigured}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="w-5 h-5" />
                  Test Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
