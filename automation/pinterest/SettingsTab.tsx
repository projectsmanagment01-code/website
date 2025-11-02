'use client';

import React, { useState } from 'react';
import { PromptSettings } from './types';

interface SettingsTabProps {
  promptSettings: PromptSettings;
  onUpdateSettings: (settings: PromptSettings) => void;
  onTestConnection: (model: string) => Promise<boolean>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  promptSettings,
  onUpdateSettings,
  onTestConnection
}) => {
  const [settings, setSettings] = useState<PromptSettings>(promptSettings);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: keyof PromptSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    onUpdateSettings(settings);
    setHasChanges(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const success = await onTestConnection(settings.model);
      setTestResult({
        success,
        message: success ? 'Connection successful!' : 'Connection failed. Please check your API settings.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed: ' + (error as Error).message
      });
    } finally {
      setTesting(false);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings: PromptSettings = {
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 1000,
      systemPrompt: 'You are an expert SEO copywriter specializing in recipe content optimization.',
      extractionPrompt: `Extract comprehensive SEO data from this recipe content and return a JSON object with the following structure:

{
  "title": "SEO-optimized recipe title (60 chars max)",
  "description": "Compelling meta description (150-160 chars)",
  "keywords": "comma-separated relevant keywords",
  "category": "main recipe category",
  "tags": "comma-separated recipe tags",
  "author": "recipe author name",
  "cookingTime": "cooking time in minutes",
  "prepTime": "prep time in minutes", 
  "servings": "number of servings",
  "difficulty": "Easy|Medium|Hard"
}

Focus on making the title and description compelling for search engines while maintaining accuracy.`
    };
    
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* AI Model Configuration */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Model Configuration</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Model
              </label>
              <select
                value={settings.model}
                onChange={(e) => handleSettingChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
                <option value="gpt-4o">GPT-4o (Premium)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Budget)</option>
                <option value="gemini-pro">Gemini Pro</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose the AI model for SEO processing. GPT-4o Mini offers the best balance of quality and cost.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature: {settings.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Conservative (0)</span>
                <span>Creative (1)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lower values for more consistent, factual outputs. Higher values for more creative content.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                min="100"
                max="4000"
                step="100"
                value={settings.maxTokens}
                onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum number of tokens in the AI response. Higher values allow longer responses but cost more.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Connection Test</h4>
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {testing ? 'Testing Connection...' : 'Test AI Connection'}
              </button>
              
              {testResult && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${
                  testResult.success 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {testResult.message}
                </div>
              )}
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-800 mb-2">💡 Model Recommendations</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li><strong>GPT-4o Mini:</strong> Best balance of quality and cost</li>
                <li><strong>GPT-4o:</strong> Highest quality, higher cost</li>
                <li><strong>GPT-3.5 Turbo:</strong> Budget option, good quality</li>
                <li><strong>Gemini Pro:</strong> Google's model alternative</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Configuration */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Prompt Configuration</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Prompt
            </label>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="Define the AI's role and expertise..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Sets the context and role for the AI. This helps ensure consistent, high-quality responses.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Extraction Prompt
            </label>
            <textarea
              value={settings.extractionPrompt}
              onChange={(e) => handleSettingChange('extractionPrompt', e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="Detailed instructions for extracting SEO data from recipe content..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Detailed instructions for extracting and optimizing SEO data from recipe content. Be specific about the JSON structure and requirements.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={!hasChanges}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              💾 Save Settings
            </button>

            <button
              onClick={resetToDefaults}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              🔄 Reset to Defaults
            </button>

            {hasChanges && (
              <div className="flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                ⚠️ You have unsaved changes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Advanced Settings</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Processing Options</h4>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">Auto-retry failed requests</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">Rate limit API calls</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">Validate JSON responses</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Performance Settings</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Size
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="1">1 (Sequential)</option>
                <option value="3" selected>3 (Recommended)</option>
                <option value="5">5 (Fast)</option>
                <option value="10">10 (Very Fast)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Number of items to process simultaneously. Higher values process faster but use more API quota.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Timeout (seconds)
              </label>
              <input
                type="number"
                min="30"
                max="300"
                defaultValue="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">📊 Usage Statistics</h3>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">1,234</div>
            <div className="text-sm text-purple-600">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">$12.45</div>
            <div className="text-sm text-purple-600">API Costs (Month)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">98.5%</div>
            <div className="text-sm text-purple-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">2.3s</div>
            <div className="text-sm text-purple-600">Avg Response</div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm">
            📈 View Detailed Analytics
          </button>
        </div>
      </div>
    </div>
  );
};