'use client';

import React, { useState } from 'react';
import { TabType, TabConfig, PinterestSpyData, PromptSettings } from './types';
import { usePinterestData, useImageExtraction, useSEOProcessing } from './hooks';
import { DataManagementTab } from './DataManagementTab';
import { SEOResultsTab } from './SEOResultsTab';
import { SettingsTab } from './SettingsTab';
import BulkImportModal from '@/components/admin/BulkImportModal';

const TABS: TabConfig[] = [
  { id: 'data', name: 'Data Management', icon: '📊' }
];

const DEFAULT_PROMPT_SETTINGS: PromptSettings = {
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

export default function PinterestSpyManager() {
  // Tab management
  const [activeTab, setActiveTab] = useState<TabType>('data');
  
  // Selection state
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  
  // Bulk import modal
  const [showBulkImport, setShowBulkImport] = useState(false);
  
  // Background extraction state
  const [backgroundExtractionActive, setBackgroundExtractionActive] = useState(false);
  
  // Settings
  const [promptSettings, setPromptSettings] = useState<PromptSettings>(DEFAULT_PROMPT_SETTINGS);

  // Data management hook
  const {
    spyData,
    stats,
    loading,
    loadSpyData,
    updateSpyData,
    deleteSpyData,
    getAuthHeaders
  } = usePinterestData();

  // Image extraction hook (for automatic processing)
  const {
    extractFeaturedImage
  } = useImageExtraction(getAuthHeaders);

  // SEO processing hook (pass spyData to load existing results)
  const {
    seoResults,
    seoProgress,
    processSEO,
    setSeoProgress,
    isPaused: isSEOPaused,
    isStopped: isSEOStopped,
    togglePause: toggleSEOPause,
    stopProcessing: stopSEOProcessing,
    resetStopFlag: resetSEOStopFlag
  } = useSEOProcessing(getAuthHeaders, spyData);

  // Handle bulk import success
  const handleBulkImportSuccess = () => {
    setShowBulkImport(false);
    loadSpyData();
  };

  // Background extraction management
  const handleBackgroundExtractionStart = () => {
    console.log('🔄 Background extraction started - enabling auto-refresh');
    setBackgroundExtractionActive(true);
  };

  const handleBackgroundExtractionEnd = () => {
    console.log('✅ Background extraction ended - disabling auto-refresh');
    setBackgroundExtractionActive(false);
  };

  // Force refresh function
  const handleForceRefresh = async () => {
    console.log('🔄 Force refreshing Pinterest spy data...');
    await loadSpyData();
  };

  // Automatic image extraction when new data is added
  const handleAutoImageExtraction = async (entry: PinterestSpyData) => {
    if (entry.spyArticleUrl && !entry.spyImageUrl) {
      try {
        const result = await extractFeaturedImage(entry);
        
        if (result?.imageUrl) {
          await updateSpyData(entry.id, { spyImageUrl: result.imageUrl });
          return true;
        }
      } catch (error) {
        console.error('Auto image extraction failed:', error);
      }
    }
    return false;
  };

  // Handle SEO processing with pause/resume/stop
  const handleProcessSEO = async (entries: PinterestSpyData[], prompt: string) => {
    resetSEOStopFlag(); // Reset stop flag at start
    setSeoProgress({ current: 0, total: entries.length });

    for (let i = 0; i < entries.length; i++) {
      // Check if stopped
      if (isSEOStopped) {
        console.log('⏹️ SEO processing stopped by user');
        break;
      }

      // Check if paused - wait until resumed
      while (isSEOPaused && !isSEOStopped) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Check again after pause
      if (isSEOStopped) {
        console.log('⏹️ SEO processing stopped by user');
        break;
      }

      const entry = entries[i];
      console.log(`🔄 Processing SEO ${i + 1}/${entries.length}: ${entry.spyTitle}`);
      setSeoProgress({ current: i + 1, total: entries.length });
      
      const result = await processSEO(entry, prompt);
      
      // Update database if processing was successful
      if (result) {
        await updateSpyData(entry.id, {
          spyTitle: result.title,
          spyDescription: result.description,
          spyKeywords: result.keywords,
          spyCategory: result.category,
          spyStatus: 'SEO_COMPLETED'
        });
      }
      
      // 30-second delay between requests to avoid rate limiting
      if (i < entries.length - 1 && !isSEOStopped) {
        console.log('⏳ Waiting 30 seconds before next request...');
        
        // Break delay into 1-second chunks so we can check pause/stop
        for (let delay = 0; delay < 30; delay++) {
          if (isSEOStopped) break;
          
          // Pause countdown if paused
          while (isSEOPaused && !isSEOStopped) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          if (isSEOStopped) break;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (!isSEOStopped) {
      console.log('✅ SEO processing completed');
    }
    setSeoProgress({ current: 0, total: 0 });
    loadSpyData();
  };

  // Handle SEO results export
  const handleExportResults = () => {
    const results = Object.values(seoResults).filter(r => r.status === 'completed');
    
    if (results.length === 0) {
      alert('No completed SEO results to export.');
      return;
    }

    const csvContent = [
      'ID,Title,Description,Keywords,Category',
      ...results.map(r => 
        `"${r.id}","${r.title}","${r.description}","${r.keywords}","${r.category}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle test AI connection
  const handleTestConnection = async (model: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/pinterest-spy/test-ai', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ model })
      });

      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  };

  // Handle settings update
  const handleUpdateSettings = (settings: PromptSettings) => {
    setPromptSettings(settings);
    // You could also save to localStorage or API here
    localStorage.setItem('pinterest_prompt_settings', JSON.stringify(settings));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'data' && (
          <DataManagementTab
            spyData={spyData}
            stats={stats}
            loading={loading}
            selectedEntries={selectedEntries}
            onSelectionChange={setSelectedEntries}
            onRefresh={handleForceRefresh}
            onBulkImport={() => setShowBulkImport(true)}
            onUpdateEntry={updateSpyData}
            onDeleteEntries={deleteSpyData}
            onAutoImageExtraction={handleAutoImageExtraction}
            backgroundExtractionActive={backgroundExtractionActive}
            onBackgroundExtractionStart={handleBackgroundExtractionStart}
            onBackgroundExtractionEnd={handleBackgroundExtractionEnd}
          />
        )}
      </div>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImportModal
          onClose={() => setShowBulkImport(false)}
          onSuccess={handleBulkImportSuccess}
          apiEndpoint="/api/admin/pinterest-spy"
          getAuthHeaders={getAuthHeaders}
          onBackgroundExtractionStart={handleBackgroundExtractionStart}
          onBackgroundExtractionEnd={handleBackgroundExtractionEnd}
        />
      )}
    </div>
  );
}