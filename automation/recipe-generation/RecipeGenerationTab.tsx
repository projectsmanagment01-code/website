/**
 * Recipe Generation Tab - Generate complete recipes from Pinterest Spy data
 */

'use client';

import React, { useState, useMemo } from 'react';
import { PinterestSpyData } from '../pinterest/types';

interface RecipeGenerationTabProps {
  spyData: PinterestSpyData[];
  getAuthHeaders: () => Record<string, string>;
  onRefresh: () => Promise<void>;
}

interface Author {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  img?: string;
  bio?: string;
}

export default function RecipeGenerationTab({ spyData, getAuthHeaders, onRefresh }: RecipeGenerationTabProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('');
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [currentProgress, setCurrentProgress] = useState({ current: 0, total: 0 });

  // Load authors on mount
  React.useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    try {
      const response = await fetch('/api/admin/authors/list', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthors(data.authors || []);
        // Auto-select first author if available
        if (data.authors && data.authors.length > 0) {
          setSelectedAuthorId(data.authors[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load authors:', error);
    } finally {
      setLoadingAuthors(false);
    }
  };

  // Filter entries ready for recipe generation (have images but no recipe yet)
  const entriesReady = useMemo(() => {
    return spyData.filter(e =>
      e.seoKeyword && 
      e.seoTitle && 
      e.seoDescription && 
      e.generatedImage1Url &&
      e.generatedImage2Url &&
      e.generatedImage3Url &&
      e.generatedImage4Url &&
      !e.generatedRecipeId // Not yet generated
    );
  }, [spyData]);

  // Stats
  const stats = useMemo(() => ({
    ready: entriesReady.length,
    selected: selectedIds.length
  }), [entriesReady, selectedIds]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleGenerateRecipes = async () => {
    const entriesToProcess = entriesReady.filter(e => selectedIds.includes(e.id));
    if (entriesToProcess.length === 0) {
      console.log('⚠️ No entries selected');
      return;
    }

    if (!selectedAuthorId) {
      alert('Please select an author first');
      return;
    }

    if (!confirm(`Generate ${entriesToProcess.length} recipe(s) with AI? This may take several minutes.`)) return;

    setProcessing(true);
    setCurrentProgress({ current: 0, total: entriesToProcess.length });

    for (let i = 0; i < entriesToProcess.length; i++) {
      const entry = entriesToProcess[i];
      
      try {
        console.log(`📝 Generating recipe ${i + 1}/${entriesToProcess.length}: ${entry.seoTitle}`);
        setCurrentProgress({ current: i + 1, total: entriesToProcess.length });
        
        // Call recipe generation API
        const response = await fetch('/api/admin/pinterest-spy/generate-recipe', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            spyEntryId: entry.id,
            authorId: selectedAuthorId
          })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Generation failed');
        }

        console.log(`✅ Recipe generated: ${result.recipeId}`);
        
      } catch (error) {
        console.error(`❌ Error generating recipe for ${entry.id}:`, error);
        alert(`Failed to generate recipe for "${entry.seoTitle}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    setProcessing(false);
    console.log(`✅ Recipe generation completed!`);
    await onRefresh();
    setSelectedIds([]);
    setCurrentProgress({ current: 0, total: 0 });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="flex justify-center gap-6">
        {[
          { label: 'Ready for Recipes', value: stats.ready },
          { label: 'Selected', value: stats.selected }
        ].map((stat, i) => (
          <div 
            key={i} 
            className="bg-white dark:bg-gray-800 p-6 rounded border border-gray-200 dark:border-gray-700 shadow-sm w-48"
          >
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{stat.label}</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Author Selection */}
      <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">👤 Select Recipe Author</h3>
        {loadingAuthors ? (
          <p className="text-gray-500 dark:text-gray-400">Loading authors...</p>
        ) : authors.length === 0 ? (
          <p className="text-red-500">No authors found. Please create an author first.</p>
        ) : (
          <div className="flex items-center gap-4">
            <select
              value={selectedAuthorId}
              onChange={(e) => setSelectedAuthorId(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
            {selectedAuthorId && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ✅ Selected: {authors.find(a => a.id === selectedAuthorId)?.name}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button 
          onClick={() => setSelectedIds(entriesReady.map(e => e.id))} 
          disabled={processing}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
        >
          Select All ({stats.ready})
        </button>
        <button 
          onClick={() => setSelectedIds([])} 
          disabled={processing}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
        >
          Clear
        </button>
        <div className="flex-1" />
        <button
          onClick={handleGenerateRecipes}
          disabled={stats.selected === 0 || processing || !selectedAuthorId}
          className="px-6 py-2 bg-green-500 dark:bg-green-600 text-white rounded disabled:opacity-50 hover:bg-green-600 dark:hover:bg-green-700"
        >
          {processing ? `⏳ Generating ${currentProgress.current}/${currentProgress.total}...` : `🍳 Generate Recipes (${stats.selected})`}
        </button>
      </div>

      {/* Progress Bar */}
      {processing && (
        <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300">
            <span>Generating Recipes: {currentProgress.current} / {currentProgress.total}</span>
            <span>{Math.round((currentProgress.current / currentProgress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 dark:bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentProgress.current / currentProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Entries Ready for Recipe Generation
        </h3>

        {entriesReady.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">📋 No entries ready</p>
            <p className="text-sm">
              Entries need SEO data and 4 generated images before recipe generation
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entriesReady.map((entry) => (
              <div
                key={entry.id}
                className={`
                  p-4 rounded border transition-colors cursor-pointer
                  ${selectedIds.includes(entry.id)
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                onClick={() => toggleSelection(entry.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(entry.id)}
                    onChange={() => toggleSelection(entry.id)}
                    className="mt-1 w-4 h-4"
                  />

                  {/* Images Preview */}
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => {
                      const imageUrl = entry[`generatedImage${num}Url` as keyof PinterestSpyData] as string;
                      return imageUrl ? (
                        <img
                          key={num}
                          src={imageUrl}
                          alt={`Image ${num}`}
                          className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-600"
                        />
                      ) : null;
                    })}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {entry.seoTitle || 'Untitled'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {entry.seoDescription?.substring(0, 150)}...
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>🔑 {entry.seoKeyword}</span>
                      <span>📂 {entry.seoCategory}</span>
                      <span>🖼️ 4 Images</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
