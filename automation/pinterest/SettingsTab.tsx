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
  "category": "main recipe category"
}

Focus on making the title and description compelling for search engines while maintaining accuracy.`
    };
    
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Prompt Configuration */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 SEO Extraction Prompt</h3>
        
        <div className="space-y-6">
          <div>
            <textarea
              value={settings.extractionPrompt}
              onChange={(e) => handleSettingChange('extractionPrompt', e.target.value)}
              rows={16}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm font-mono"
              placeholder="Detailed instructions for extracting SEO data from recipe content..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Detailed instructions for extracting and optimizing SEO data from recipe content.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={!hasChanges}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
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
              <div className="flex items-center px-3 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm">
                ⚠️ You have unsaved changes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};