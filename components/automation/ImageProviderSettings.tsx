/**
 * Image Provider Settings Component
 * Allows selection between Gemini and Midjourney for image generation
 */

"use client";

import React, { useState } from 'react';
import { Image, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface ImageProviderProps {
  currentProvider: 'gemini' | 'midjourney';
  midjourneyApiKey?: string;
  midjourneyWebhookUrl?: string;
  midjourneyPromptTemplate?: string;
  midjourneyProcessMode?: 'relax' | 'fast' | 'turbo';
  onChange: (data: ImageProviderSettings) => void;
}

interface ImageProviderSettings {
  imageProvider: 'gemini' | 'midjourney';
  midjourneyApiKey?: string;
  midjourneyWebhookUrl?: string;
  midjourneyPromptTemplate?: string;
  midjourneyProcessMode?: 'relax' | 'fast' | 'turbo';
}

export default function ImageProviderSettings({
  currentProvider,
  midjourneyApiKey = '',
  midjourneyWebhookUrl = '',
  midjourneyPromptTemplate = '',
  midjourneyProcessMode = 'relax',
  onChange
}: ImageProviderProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  // Generate default webhook URL based on environment
  const getDefaultWebhookUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/webhooks/goapi/midjourney`;
    }
    return process.env.NEXT_PUBLIC_BASE_URL 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/goapi/midjourney`
      : 'https://yourdomain.com/api/webhooks/goapi/midjourney';
  };

  const defaultWebhookUrl = getDefaultWebhookUrl();

  const providers = [
    {
      id: 'gemini' as const,
      name: 'Google Gemini',
      icon: '💎',
      description: 'Fast and cost-effective image generation using Gemini',
      pros: ['Free tier available', 'Fast generation', 'Integrated with existing AI'],
      cons: ['Lower quality', 'Less control']
    },
    {
      id: 'midjourney' as const,
      name: 'Midjourney',
      icon: '🎨',
      description: 'Premium quality images via GoAPI Midjourney integration',
      pros: ['Photorealistic quality', 'Style reference support', '4 variations per request'],
      cons: ['Requires paid GoAPI account', 'Async webhook pattern', 'Higher cost']
    }
  ];

  const handleProviderChange = (provider: 'gemini' | 'midjourney') => {
    onChange({
      imageProvider: provider,
      midjourneyApiKey,
      midjourneyWebhookUrl,
      midjourneyPromptTemplate,
      midjourneyProcessMode
    });
  };

  const handleFieldChange = (field: keyof ImageProviderSettings, value: any) => {
    onChange({
      imageProvider: currentProvider,
      midjourneyApiKey,
      midjourneyWebhookUrl,
      midjourneyPromptTemplate,
      midjourneyProcessMode,
      [field]: value
    });
  };

  const defaultPromptTemplate = `Create a high-quality, photorealistic food photography image for {recipeName}. 
Focus on: {seoKeyword}
Style: Professional food magazine, natural lighting, appetizing presentation
SEO Title: {seoTitle}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Image Generation Provider
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose which AI service generates recipe images (4 images per recipe)
        </p>
      </div>

      {/* Provider Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleProviderChange(provider.id)}
            className={`p-4 border-2 rounded-xl text-left transition-all ${
              currentProvider === provider.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:bg-gray-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{provider.icon}</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100">{provider.name}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{provider.description}</p>
                <div className="mt-3 space-y-1">
                  <div className="text-xs text-green-600 dark:text-green-400">
                    ✓ {provider.pros.join(' • ')}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    ⚠ {provider.cons.join(' • ')}
                  </div>
                </div>
              </div>
              {currentProvider === provider.id && (
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Midjourney Configuration */}
      {currentProvider === 'midjourney' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 space-y-4">
          {/* GoAPI Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              GoAPI API Key <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={midjourneyApiKey}
                onChange={(e) => handleFieldChange('midjourneyApiKey', e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-2 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Webhook URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={midjourneyWebhookUrl || defaultWebhookUrl}
              onChange={(e) => handleFieldChange('midjourneyWebhookUrl', e.target.value)}
              placeholder={defaultWebhookUrl}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Process Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Processing Mode
            </label>
            <select
              value={midjourneyProcessMode}
              onChange={(e) => handleFieldChange('midjourneyProcessMode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="relax">Relax (Cheapest, slower)</option>
              <option value="fast">Fast (Balanced)</option>
              <option value="turbo">Turbo (Most expensive, fastest)</option>
            </select>
          </div>

          {/* Prompt Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prompt Template
            </label>
            <textarea
              value={midjourneyPromptTemplate || defaultPromptTemplate}
              onChange={(e) => handleFieldChange('midjourneyPromptTemplate', e.target.value)}
              rows={6}
              placeholder={defaultPromptTemplate}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        </div>
      )}

      {/* Gemini Info */}
      {currentProvider === 'gemini' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Gemini Active:</strong> Using Gemini API for image generation.
          </p>
        </div>
      )}
    </div>
  );
}
