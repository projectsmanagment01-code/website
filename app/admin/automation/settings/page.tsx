'use client';

import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Settings, Info, HelpCircle, BookOpen } from 'lucide-react';
import ImageProviderSettings from '@/components/automation/ImageProviderSettings';

interface PromptSettings {
  // SEO Extraction Prompts
  seoExtractionSystem: string;
  seoExtractionUser: string;
  
  // Image Provider Selection
  imageProvider: 'gemini' | 'midjourney';
  midjourneyApiKey: string;
  midjourneyWebhookUrl: string;
  midjourneyPromptTemplate: string;
  midjourneyProcessMode: 'relax' | 'fast' | 'turbo';
  
  // Image Generation Prompts (4 types) - Only for Gemini
  imagePrompt1: string; // Finished dish hero shot
  imagePrompt2: string; // Raw ingredients layout
  imagePrompt3: string; // Cooking action shot
  imagePrompt4: string; // Styled presentation
  
  // Recipe Generation Prompts
  recipeSystemPrompt: string;
  recipeDefaultPrompt: string;
  
  // Model Settings
  seoTemperature: number;
  seoMaxTokens: number;
  recipeTemperature: number;
  recipeMaxTokens: number;
  imageGuidanceScale: number;
  
  // Pinterest Integration
  enablePinterest: boolean;
  pinterestWebhookUrl: string;
  pinterestImageEditPrompt: string;
  
  // Google Indexing
  enableGoogleIndexing: boolean;
  googleIndexingCredentials: string;
}

const DEFAULT_SETTINGS: PromptSettings = {
  // SEO Extraction Prompts
  seoExtractionSystem: `You are an expert SEO specialist for a recipe food blog. Your task is to analyze Pinterest spy data and extract optimized SEO metadata.

REQUIREMENTS:
- SEO Keyword: 2-4 words, highly searchable, specific to the recipe
- SEO Title: 50-60 characters, includes keyword naturally, compelling and click-worthy
- SEO Description: 150-160 characters, includes keyword, action-oriented with call-to-action
- SEO Category: Must match one of the existing website categories

GUIDELINES:
- Maintain the essence of the original recipe
- Optimize for Google search visibility
- Use natural language that appeals to home cooks
- Focus on what makes this recipe unique or appealing`,

  seoExtractionUser: `Analyze the following Pinterest spy data and generate optimized SEO metadata:

**Spy Title:** {spyTitle}
**Spy Description:** {spyDescription}
**Image URL:** {imageUrl}

**Available Categories:** {categories}

Generate SEO metadata in the following JSON format:
{
  "seoKeyword": "main keyword phrase",
  "seoTitle": "Optimized Title Here",
  "seoDescription": "Compelling meta description here.",
  "seoCategory": "matching-category-slug",
  "confidence": 0.95,
  "reasoning": "Brief explanation of SEO choices"
}`,

  // Image Provider Selection
  imageProvider: 'gemini',
  midjourneyApiKey: '',
  midjourneyWebhookUrl: '',
  midjourneyPromptTemplate: 'Create a high-quality, photorealistic food photography image for {recipeName}. Focus on: {seoKeyword}',
  midjourneyProcessMode: 'relax',

  // Image Generation Prompts (for Gemini)
  imagePrompt1: `FINISHED DISH HERO SHOT: Close-up 45-degree angle of {recipeTitle} plated on kitchen surface. Show complete finished dish as main subject. NO raw ingredients, NO cooking process, ONLY final result. Kitchen environment, 16:9 tall aspect ratio.`,
  
  imagePrompt2: `RAW INGREDIENTS LAYOUT: ONLY raw, uncooked ingredients for {recipeTitle} laid out separately. NO finished dish, NO cooking in progress. Ingredients in bowls, measuring cups, on cutting board. Overhead flat lay view from directly above. Kitchen environment, 16:9 tall aspect ratio.`,
  
  imagePrompt3: `COOKING ACTION SHOT: {recipeTitle} being cooked/mixed/baked IN PROGRESS. Steam, bubbles, or action visible. Side angle or 3/4 view showing the process. NO finished dish, NO raw ingredients layout. Kitchen environment, 16:9 tall aspect ratio.`,
  
  imagePrompt4: `STYLED PRESENTATION: {recipeTitle} finished dish in ELEGANT table setting. Different angle than image 1 (front view or side profile). More styling and props. Kitchen environment, 16:9 tall aspect ratio.`,

  // Recipe Generation Prompts
  recipeSystemPrompt: `You are an advanced AI agent that generates complete recipe data strictly in valid JSON format.

PRIMARY OBJECTIVE:
Generate a fully structured recipe JSON object. Autofill all narrative and technical fields based on the input.

AUTHOR PERSONA:
Write in the voice of a 40-year-old woman — a calm, graceful home cook with a background in design.
- Warm, nostalgic, sensory-driven tone
- Short sentences, conversational rhythm
- Use casual interjections: "honestly," "oops," "so," "yeah," "wow"
- Focus on feelings, textures, smells, memories

CORE RULES:
1. Output ONLY valid JSON - no text, no markdown, no comments
2. Never omit or rename fields
3. Apply ingredient substitutions: pork→lamb, bacon→turkey ham, Italian sausage→beef sausage
4. NO alcohol in any form
5. Build slug from title using lowercase and hyphens
6. Build href as /recipes/{slug}
7. Build categoryLink as /categories/{CategoryName}

Output must match exact schema with all required fields filled with natural, human-quality writing.`,

  recipeDefaultPrompt: `Generate a complete recipe article with the following details:

RECIPE INFORMATION:
- Title: {title}
- Description: {description}
- Category: {category}
- Category ID: {categoryId}
- Author ID: {authorId}
- SEO Keyword: {keyword}

IMAGES (use these exact URLs):
- Feature Image: {featureImage}
- Ingredients Image: {ingredientsImage}
- Cooking Image: {cookingImage}
- Final Presentation: {finalImage}

SITEMAP FOR INTERNAL LINKING:
{sitemap}

Generate a complete, valid JSON recipe article following the schema. Ensure all fields are filled with high-quality, human-like content.`,

  // Model Settings
  seoTemperature: 0.7,
  seoMaxTokens: 1024,
  recipeTemperature: 0.8,
  recipeMaxTokens: 8192,
  imageGuidanceScale: 7.5,
  
  // Pinterest Integration
  enablePinterest: false,
  pinterestWebhookUrl: '',
  pinterestImageEditPrompt: `Transform the following Pinterest image into a recipe-optimized photo:

EDITING INSTRUCTIONS:
- Enhance colors and lighting to make food look appetizing
- Add subtle text overlay with recipe title if specified
- Optimize for Pinterest's 2:3 aspect ratio (1000x1500px)
- Maintain food authenticity - no unrealistic enhancements
- Add subtle branding watermark if needed

Original Image: {spyPinImage}
Recipe Title: {recipeTitle}

Generate an edited, Pinterest-ready image that maximizes engagement while staying true to the original.`,
  
  // Google Indexing
  enableGoogleIndexing: false,
  googleIndexingCredentials: '',
};

export default function AutomationSettingsPage() {
  const [settings, setSettings] = useState<PromptSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'seo' | 'images' | 'recipe' | 'models' | 'pinterest' | 'indexing'>('seo');

  // Load settings from database on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/automation/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      
      const data = await response.json();
      
      if (data.success && data.settings) {
        // Map database fields to UI fields
        const dbSettings = data.settings;
        const uiSettings: PromptSettings = {
          ...DEFAULT_SETTINGS,
          // Map the database prompt fields if they exist
          ...(dbSettings.seoPromptSystemPrompt && {
            seoExtractionSystem: dbSettings.seoPromptSystemPrompt,
            seoExtractionUser: dbSettings.seoPromptSystemPrompt // Using same for both for now
          }),
          ...(dbSettings.imagePromptSystemPrompt && {
            // Parse image prompt to extract individual prompts
            // Split by the section headers and clean up
            imagePrompt1: dbSettings.imagePromptSystemPrompt.split('IMAGE 1 -')[1]?.split('2. IMAGE 2 -')[0]?.replace(/^\s*FINISHED DISH HERO SHOT:\s*/, '').trim() || settings.imagePrompt1,
            imagePrompt2: dbSettings.imagePromptSystemPrompt.split('IMAGE 2 -')[1]?.split('3. IMAGE 3 -')[0]?.replace(/^\s*RAW INGREDIENTS LAYOUT:\s*/, '').trim() || settings.imagePrompt2,
            imagePrompt3: dbSettings.imagePromptSystemPrompt.split('IMAGE 3 -')[1]?.split('4. IMAGE 4 -')[0]?.replace(/^\s*COOKING ACTION SHOT:\s*/, '').trim() || settings.imagePrompt3,
            imagePrompt4: dbSettings.imagePromptSystemPrompt.split('IMAGE 4 -')[1]?.replace(/^\s*STYLED PRESENTATION:\s*/, '').split(/Output ONLY valid JSON/)[0]?.trim() || settings.imagePrompt4,
          }),
          ...(dbSettings.recipePromptSystemPrompt && {
            recipeSystemPrompt: dbSettings.recipePromptSystemPrompt,
          }),
          // Pinterest settings
          ...(dbSettings.enablePinterest !== undefined && {
            enablePinterest: dbSettings.enablePinterest,
          }),
          ...(dbSettings.pinterestWebhookUrl && {
            pinterestWebhookUrl: dbSettings.pinterestWebhookUrl,
          }),
          ...(dbSettings.pinterestImageEditPrompt && {
            pinterestImageEditPrompt: dbSettings.pinterestImageEditPrompt,
          }),
          // Google Indexing settings
          ...(dbSettings.enableGoogleIndexing !== undefined && {
            enableGoogleIndexing: dbSettings.enableGoogleIndexing,
          }),
          ...(dbSettings.googleIndexingCredentials && {
            googleIndexingCredentials: dbSettings.googleIndexingCredentials,
          }),
          // Image Provider settings
          ...(dbSettings.imageProvider && {
            imageProvider: dbSettings.imageProvider,
          }),
          ...(dbSettings.midjourneyApiKey && {
            midjourneyApiKey: dbSettings.midjourneyApiKey,
          }),
          ...(dbSettings.midjourneyWebhookUrl && {
            midjourneyWebhookUrl: dbSettings.midjourneyWebhookUrl,
          }),
          ...(dbSettings.midjourneyPromptTemplate && {
            midjourneyPromptTemplate: dbSettings.midjourneyPromptTemplate,
          }),
          ...(dbSettings.midjourneyProcessMode && {
            midjourneyProcessMode: dbSettings.midjourneyProcessMode,
          }),
        };
        
        setSettings(uiSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSaveMessage('⚠️ Using default settings - could not load from database');
      setTimeout(() => setSaveMessage(''), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Combine image prompts into single system prompt (without hardcoded JSON format)
      const imagePromptSystemPrompt = `You are an AI agent responsible for generating FOUR COMPLETELY DIFFERENT AND UNIQUE image prompts for a single recipe.

1. IMAGE 1 - FINISHED DISH HERO SHOT:
${settings.imagePrompt1}

2. IMAGE 2 - RAW INGREDIENTS LAYOUT:
${settings.imagePrompt2}

3. IMAGE 3 - COOKING ACTION SHOT:
${settings.imagePrompt3}

4. IMAGE 4 - STYLED PRESENTATION:
${settings.imagePrompt4}`;

      // Map UI fields to database fields
      const dbData = {
        seoPromptSystemPrompt: settings.seoExtractionSystem,
        imagePromptSystemPrompt: imagePromptSystemPrompt,
        recipePromptSystemPrompt: settings.recipeSystemPrompt,
        // Image Provider settings
        imageProvider: settings.imageProvider,
        midjourneyApiKey: settings.midjourneyApiKey,
        midjourneyWebhookUrl: settings.midjourneyWebhookUrl,
        midjourneyPromptTemplate: settings.midjourneyPromptTemplate,
        midjourneyProcessMode: settings.midjourneyProcessMode,
        // Pinterest settings
        enablePinterest: settings.enablePinterest,
        pinterestWebhookUrl: settings.pinterestWebhookUrl,
        pinterestImageEditPrompt: settings.pinterestImageEditPrompt,
        // Google Indexing settings
        enableGoogleIndexing: settings.enableGoogleIndexing,
        googleIndexingCredentials: settings.googleIndexingCredentials,
      };

      const response = await fetch('/api/admin/automation/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        },
        body: JSON.stringify(dbData)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const result = await response.json();
      
      if (result.success) {
        setSaveMessage('✅ Settings saved to database successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      setSaveMessage('❌ Failed to save settings: ' + (error instanceof Error ? error.message : 'Unknown error'));
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all prompts to defaults? This cannot be undone.')) {
      setSettings(DEFAULT_SETTINGS);
      // Save defaults to database
      setIsSaving(true);
      try {
        await handleSave();
        setSaveMessage('✅ Settings reset to defaults and saved to database');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (error) {
        setSaveMessage('⚠️ Reset to defaults but failed to save to database');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleResetTab = (tab: 'seo' | 'images' | 'recipe' | 'models' | 'pinterest' | 'indexing') => {
    const tabNames = {
      seo: 'SEO Extraction',
      images: 'Image Generation',
      recipe: 'Recipe Generation',
      models: 'Model Settings',
      pinterest: 'Pinterest Integration',
      indexing: 'Google Indexing'
    };
    
    if (!confirm(`Reset ${tabNames[tab]} prompts to defaults? This cannot be undone.`)) {
      return;
    }

    switch (tab) {
      case 'seo':
        setSettings(prev => ({
          ...prev,
          seoExtractionSystem: DEFAULT_SETTINGS.seoExtractionSystem,
          seoExtractionUser: DEFAULT_SETTINGS.seoExtractionUser,
        }));
        setSaveMessage(`✅ ${tabNames[tab]} reset to defaults`);
        break;
      case 'images':
        setSettings(prev => ({
          ...prev,
          imagePrompt1: DEFAULT_SETTINGS.imagePrompt1,
          imagePrompt2: DEFAULT_SETTINGS.imagePrompt2,
          imagePrompt3: DEFAULT_SETTINGS.imagePrompt3,
          imagePrompt4: DEFAULT_SETTINGS.imagePrompt4,
        }));
        setSaveMessage(`✅ ${tabNames[tab]} reset to defaults`);
        break;
      case 'recipe':
        setSettings(prev => ({
          ...prev,
          recipeSystemPrompt: DEFAULT_SETTINGS.recipeSystemPrompt,
          recipeDefaultPrompt: DEFAULT_SETTINGS.recipeDefaultPrompt,
        }));
        setSaveMessage(`✅ ${tabNames[tab]} reset to defaults`);
        break;
      case 'models':
        setSettings(prev => ({
          ...prev,
          seoTemperature: DEFAULT_SETTINGS.seoTemperature,
          seoMaxTokens: DEFAULT_SETTINGS.seoMaxTokens,
          recipeTemperature: DEFAULT_SETTINGS.recipeTemperature,
          recipeMaxTokens: DEFAULT_SETTINGS.recipeMaxTokens,
          imageGuidanceScale: DEFAULT_SETTINGS.imageGuidanceScale,
        }));
        setSaveMessage(`✅ ${tabNames[tab]} reset to defaults`);
        break;
      case 'pinterest':
        setSettings(prev => ({
          ...prev,
          enablePinterest: DEFAULT_SETTINGS.enablePinterest,
          pinterestWebhookUrl: DEFAULT_SETTINGS.pinterestWebhookUrl,
          pinterestImageEditPrompt: DEFAULT_SETTINGS.pinterestImageEditPrompt,
        }));
        setSaveMessage(`✅ ${tabNames[tab]} reset to defaults`);
        break;
      case 'indexing':
        setSettings(prev => ({
          ...prev,
          enableGoogleIndexing: DEFAULT_SETTINGS.enableGoogleIndexing,
          googleIndexingCredentials: DEFAULT_SETTINGS.googleIndexingCredentials,
        }));
        setSaveMessage(`✅ ${tabNames[tab]} reset to defaults`);
        break;
    }
    
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const updateSetting = (key: keyof PromptSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Automation Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Configure all automation prompts and model parameters
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <a
                href="/admin"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = '#automation-help';
                  window.location.reload();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                View Documentation
              </a>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
          
          {saveMessage && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300">
              {saveMessage}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="grid grid-cols-2 md:grid-cols-5 gap-0" aria-label="Settings tabs">
              {[
                { id: 'seo', label: 'SEO Extraction', icon: '🧠', color: 'purple' },
                { id: 'images', label: 'Image Generation', icon: '🎨', color: 'blue' },
                { id: 'recipe', label: 'Recipe Generation', icon: '📝', color: 'green' },
                { id: 'models', label: 'Model Settings', icon: '⚙️', color: 'gray' },
                { id: 'indexing', label: 'Google Indexing', icon: '🔍', color: 'yellow' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex items-center justify-center gap-3 px-6 py-4 font-medium transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className={`text-xl transition-transform duration-200 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {tab.icon}
                  </span>
                  <span className="font-semibold">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* SEO Extraction Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              {/* Tab Header with Reset Button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">SEO Extraction Prompts</h2>
                <button
                  onClick={() => handleResetTab('seo')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset This Tab
                </button>
              </div>
              
              {/* Help Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">About SEO Extraction</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-400 mb-2">
                      These prompts control how AI analyzes Pinterest spy data to extract SEO-optimized metadata. The system prompt defines the AI's role and requirements, while the user prompt provides the actual data and output format.
                    </p>
                    <div className="text-xs text-blue-700 dark:text-blue-500 space-y-1">
                      <p><strong>Available Variables:</strong></p>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        <li><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{'{spyTitle}'}</code> - Original Pinterest recipe title</li>
                        <li><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{'{spyDescription}'}</code> - Original recipe description</li>
                        <li><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{'{imageUrl}'}</code> - Reference image URL</li>
                        <li><code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{'{categories}'}</code> - Available website categories</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  System Prompt (SEO Extraction)
                </label>
                <textarea
                  value={settings.seoExtractionSystem}
                  onChange={(e) => updateSetting('seoExtractionSystem', e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent font-mono text-sm"
                  placeholder="Enter the system prompt for SEO extraction..."
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  This prompt defines the AI's role and requirements for SEO extraction.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  User Prompt Template (SEO Extraction)
                </label>
                <textarea
                  value={settings.seoExtractionUser}
                  onChange={(e) => updateSetting('seoExtractionUser', e.target.value)}
                  rows={14}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent font-mono text-sm"
                  placeholder="Enter the user prompt template..."
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Available variables: {'{spyTitle}'}, {'{spyDescription}'}, {'{imageUrl}'}, {'{categories}'}
                </p>
              </div>
            </div>
          )}

          {/* Image Generation Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              {/* Tab Header with Reset Button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Image Generation Configuration</h2>
                <button
                  onClick={() => handleResetTab('images')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset This Tab
                </button>
              </div>

              {/* Image Provider Selection */}
              <ImageProviderSettings
                currentProvider={settings.imageProvider}
                midjourneyApiKey={settings.midjourneyApiKey}
                midjourneyWebhookUrl={settings.midjourneyWebhookUrl}
                midjourneyPromptTemplate={settings.midjourneyPromptTemplate}
                midjourneyProcessMode={settings.midjourneyProcessMode}
                onChange={(data) => {
                  setSettings(prev => ({
                    ...prev,
                    imageProvider: data.imageProvider,
                    midjourneyApiKey: data.midjourneyApiKey || '',
                    midjourneyWebhookUrl: data.midjourneyWebhookUrl || '',
                    midjourneyPromptTemplate: data.midjourneyPromptTemplate || '',
                    midjourneyProcessMode: data.midjourneyProcessMode || 'relax'
                  }));
                }}
              />

              {/* Gemini-specific Image Prompts - Only show when Gemini is selected */}
              {settings.imageProvider === 'gemini' && (
                <>
                  <hr className="border-gray-200 dark:border-gray-700 my-8" />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                    Image 1: Finished Dish Hero Shot
                  </label>
                  <div className="relative group">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-6 top-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Close-up 45° angle of plated final result
                    </span>
                  </div>
                </div>
                <textarea
                  value={settings.imagePrompt1}
                  onChange={(e) => updateSetting('imagePrompt1', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent font-mono text-sm"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Variable: {'{recipeTitle}'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                    Image 2: Raw Ingredients Layout
                  </label>
                  <div className="relative group">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-6 top-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Overhead flat lay of uncooked ingredients
                    </span>
                  </div>
                </div>
                <textarea
                  value={settings.imagePrompt2}
                  onChange={(e) => updateSetting('imagePrompt2', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent font-mono text-sm"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Variable: {'{recipeTitle}'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                    Image 3: Cooking Action Shot
                  </label>
                  <div className="relative group">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-6 top-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Side angle showing cooking process in action
                    </span>
                  </div>
                </div>
                <textarea
                  value={settings.imagePrompt3}
                  onChange={(e) => updateSetting('imagePrompt3', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent font-mono text-sm"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Variable: {'{recipeTitle}'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                    Image 4: Styled Presentation
                  </label>
                  <div className="relative group">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <span className="absolute left-6 top-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Elegant table setting with different angle
                    </span>
                  </div>
                </div>
                <textarea
                  value={settings.imagePrompt4}
                  onChange={(e) => updateSetting('imagePrompt4', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent font-mono text-sm"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Variable: {'{recipeTitle}'}
                </p>
              </div>
                </>
              )}
            </div>
          )}

          {/* Recipe Generation Tab */}
          {activeTab === 'recipe' && (
            <div className="space-y-6">
              {/* Tab Header with Reset Button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recipe Generation Prompts</h2>
                <button
                  onClick={() => handleResetTab('recipe')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset This Tab
                </button>
              </div>
              
              {/* Help Section */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">About Recipe Generation</h3>
                    <p className="text-sm text-orange-800 dark:text-orange-400 mb-2">
                      These prompts control how AI writes complete recipe articles. The system prompt defines writing style, tone, and structure rules. The default prompt provides data and output format.
                    </p>
                    <div className="text-xs text-orange-700 dark:text-orange-500 space-y-1">
                      <p><strong>Available Variables:</strong></p>
                      <ul className="list-disc list-inside ml-2 space-y-0.5">
                        <li><code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">{'{title}'}</code>, <code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">{'{description}'}</code>, <code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">{'{category}'}</code>, <code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">{'{keyword}'}</code></li>
                        <li><code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">{'{featureImage}'}</code>, <code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">{'{ingredientsImage}'}</code>, <code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">{'{cookingImage}'}</code>, <code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">{'{finalImage}'}</code></li>
                        <li><code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">{'{sitemap}'}</code> - For internal linking to related recipes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  System Prompt (Recipe Generation)
                </label>
                <textarea
                  value={settings.recipeSystemPrompt}
                  onChange={(e) => updateSetting('recipeSystemPrompt', e.target.value)}
                  rows={16}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent font-mono text-sm"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Defines the AI's persona, tone, and core rules for recipe generation.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Default User Prompt Template
                </label>
                <textarea
                  value={settings.recipeDefaultPrompt}
                  onChange={(e) => updateSetting('recipeDefaultPrompt', e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent font-mono text-sm"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Available variables: {'{title}'}, {'{description}'}, {'{category}'}, {'{categoryId}'}, {'{authorId}'}, {'{keyword}'}, {'{featureImage}'}, {'{ingredientsImage}'}, {'{cookingImage}'}, {'{finalImage}'}, {'{sitemap}'}
                </p>
              </div>
            </div>
          )}

          {/* Model Settings Tab */}
          {activeTab === 'models' && (
            <div className="space-y-8">
              {/* Tab Header with Reset Button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Model Settings</h2>
                <button
                  onClick={() => handleResetTab('models')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset This Tab
                </button>
              </div>
              
              {/* Help Section */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">About Model Settings</h3>
                    <p className="text-sm text-purple-800 dark:text-purple-400 mb-2">
                      Fine-tune AI behavior for each automation stage. These parameters control output quality, creativity, and length.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-purple-700 dark:text-purple-500">
                      <div><strong>Temperature:</strong> 0.0 = deterministic, 1.0 = balanced, 2.0 = very creative</div>
                      <div><strong>Max Tokens:</strong> Maximum length of AI response</div>
                      <div><strong>Guidance Scale:</strong> How strictly images follow prompts (7-15 recommended)</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  SEO Extraction Model Settings
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Temperature
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={settings.seoTemperature}
                      onChange={(e) => updateSetting('seoTemperature', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Controls randomness. Lower = more focused, Higher = more creative
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      step="128"
                      min="128"
                      max="4096"
                      value={settings.seoMaxTokens}
                      onChange={(e) => updateSetting('seoMaxTokens', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Maximum response length
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recipe Generation Model Settings
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Temperature
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={settings.recipeTemperature}
                      onChange={(e) => updateSetting('recipeTemperature', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Controls creativity in recipe writing
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      step="512"
                      min="1024"
                      max="16384"
                      value={settings.recipeMaxTokens}
                      onChange={(e) => updateSetting('recipeMaxTokens', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Maximum recipe article length
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Image Generation Settings
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Guidance Scale
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="20"
                    value={settings.imageGuidanceScale}
                    onChange={(e) => updateSetting('imageGuidanceScale', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    How closely the AI follows the prompt. Higher = more adherence, Lower = more creativity
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Google Indexing Tab */}
          {activeTab === 'indexing' && (
            <div className="space-y-6">
              {/* Tab Header with Reset Button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Google Indexing</h2>
                <button
                  onClick={() => handleResetTab('indexing')}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Tab
                </button>
              </div>

              {/* Enable Google Indexing Toggle */}
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Enable Google Indexing</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Automatically submit new recipe URLs to Google for faster indexing
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableGoogleIndexing}
                    onChange={(e) => updateSetting('enableGoogleIndexing', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Service Account JSON */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Google Service Account JSON <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={settings.googleIndexingCredentials}
                  onChange={(e) => updateSetting('googleIndexingCredentials', e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 font-mono text-xs"
                  placeholder='Paste your Google service account JSON here...'
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Service account credentials with Indexing API permissions (stored encrypted)
                </p>
              </div>

              {/* Setup Instructions */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                  🔍 Google Indexing API Setup Guide:
                </h4>
                <ol className="text-sm text-yellow-800 dark:text-yellow-400 space-y-2 list-decimal list-inside">
                  <li>
                    Go to{' '}
                    <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-600">
                      Google Cloud Console
                    </a>
                  </li>
                  <li>Create a new project or select existing one</li>
                  <li>Enable the "Indexing API" for your project</li>
                  <li>Create a service account with "Indexing API" permissions</li>
                  <li>Generate and download the JSON key file</li>
                  <li>Add the service account email to your Search Console property as an owner</li>
                  <li>Copy and paste the entire JSON content above</li>
                </ol>
                <p className="mt-3 text-sm text-yellow-800 dark:text-yellow-400">
                  <strong>⚡ Benefit:</strong> New recipes will be indexed by Google within minutes instead of days or weeks
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            <strong>💡 Tip:</strong> These prompts control how the automation pipeline generates content. 
            Changes will affect all future recipe generations. Use variables like {'{recipeTitle}'} to insert dynamic content.
          </p>
        </div>
      </div>
    </div>
  );
}
