'use client';

import React, { useState } from 'react';
import { PinterestSpyData, SEOResult } from './types';

interface SEOResultsTabProps {
  spyData: PinterestSpyData[];
  selectedEntries: string[];
  onSelectionChange: (entries: string[]) => void;
  seoResults: Record<string, SEOResult>;
  seoProgress: { current: number; total: number };
  onProcessSEO: (entries: PinterestSpyData[], prompt: string) => void;
  onExportResults: () => void;
  onDeleteEntries: (ids: string[]) => Promise<boolean>;
  getAuthHeaders: () => Record<string, string>;
  isPaused: boolean;
  onTogglePause: () => void;
  onStop: () => void;
}

export const SEOResultsTab: React.FC<SEOResultsTabProps> = ({
  spyData,
  selectedEntries,
  onSelectionChange,
  seoResults,
  seoProgress,
  onProcessSEO,
  onExportResults,
  onDeleteEntries,
  getAuthHeaders,
  isPaused,
  onTogglePause,
  onStop
}) => {
  const [seoFilter, setSeoFilter] = useState('all');
  const [seoPage, setSeoPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(`Extract comprehensive SEO data from this recipe content and return a JSON object with the following structure:

{
  "title": "SEO-optimized recipe title (60 chars max)",
  "description": "Compelling meta description (150-160 chars)",
  "keywords": "comma-separated relevant keywords",
  "category": "main recipe category"
}

Focus on making the title and description compelling for search engines while maintaining accuracy.`);

  const ITEMS_PER_PAGE = 20;

  // Filter data for SEO processing
  const seoReadyData = spyData.filter(entry => {
    const hasContent = entry.spyTitle || entry.spyDescription || entry.spyIngredients;
    const matchesFilter = seoFilter === 'all' || 
      (seoFilter === 'processed' && seoResults[entry.id]) ||
      (seoFilter === 'pending' && !seoResults[entry.id]) ||
      (seoFilter === 'selected' && selectedEntries.includes(entry.id));
    return hasContent && matchesFilter;
  });

  const totalPages = Math.ceil(seoReadyData.length / ITEMS_PER_PAGE);
  const startIndex = (seoPage - 1) * ITEMS_PER_PAGE;
  const paginatedSeoData = seoReadyData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // All selected entries with content (for display/count)
  const selectedSeoData = spyData.filter(entry => 
    selectedEntries.includes(entry.id) && (entry.spyTitle || entry.spyDescription || entry.spyIngredients)
  );

  // Only selected entries that NEED processing (no existing SEO data)
  const selectedNeedingProcessing = selectedSeoData.filter(entry => 
    !entry.seoKeyword && !entry.seoTitle && !entry.seoDescription
  );

  const processedCount = Object.keys(seoResults).length;
  const successCount = Object.values(seoResults).filter(r => r.status === 'completed').length;
  const errorCount = Object.values(seoResults).filter(r => r.status === 'error').length;

  const handleProcessSelected = async () => {
    if (selectedNeedingProcessing.length === 0) {
      if (selectedSeoData.length > 0) {
        alert(`All ${selectedSeoData.length} selected entries already have SEO data. Nothing to process.`);
      } else {
        alert('Please select entries with content to process for SEO.');
      }
      return;
    }

    const alreadyProcessed = selectedSeoData.length - selectedNeedingProcessing.length;
    const message = alreadyProcessed > 0
      ? `Process SEO for ${selectedNeedingProcessing.length} entries?\n\n(${alreadyProcessed} selected entries already have SEO data and will be skipped)`
      : `Process SEO for ${selectedNeedingProcessing.length} selected entries?`;

    if (!confirm(message)) {
      return;
    }

    setProcessing(true);
    try {
      // Only process entries that need processing
      await onProcessSEO(selectedNeedingProcessing, customPrompt);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedEntries.length === 0) return;
    
    if (confirm(`Delete ${selectedEntries.length} selected entries?`)) {
      const success = await onDeleteEntries(selectedEntries);
      if (success) {
        onSelectionChange([]);
      }
    }
  };

  const handleSelectAll = () => {
    const allIds = seoReadyData.map(entry => entry.id);
    const allSelected = allIds.every(id => selectedEntries.includes(id));
    
    if (allSelected) {
      onSelectionChange(selectedEntries.filter(id => !allIds.includes(id)));
    } else {
      const newSelection = [...new Set([...selectedEntries, ...allIds])];
      onSelectionChange(newSelection);
    }
  };

  const handleSelectEntry = (id: string) => {
    if (selectedEntries.includes(id)) {
      onSelectionChange(selectedEntries.filter(entryId => entryId !== id));
    } else {
      onSelectionChange([...selectedEntries, id]);
    }
  };

  const getStatusIcon = (entryId: string) => {
    const result = seoResults[entryId];
    if (!result) return <span className="text-gray-400">⏸️</span>;
    
    switch (result.status) {
      case 'processing':
        return <span className="text-blue-500 animate-spin">⏳</span>;
      case 'completed':
        return <span className="text-green-500">✅</span>;
      case 'error':
        return <span className="text-red-500">❌</span>;
      default:
        return <span className="text-gray-400">⏸️</span>;
    }
  };

  const getStatusBadge = (status?: string) => {
    const badgeClasses = {
      'processing': 'bg-blue-50 text-blue-700 border-blue-200',
      'completed': 'bg-green-50 text-green-700 border-green-200',
      'error': 'bg-red-50 text-red-700 border-red-200'
    };

    if (!status) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200">
          Pending
        </span>
      );
    }

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${badgeClasses[status as keyof typeof badgeClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {/* Info Message for Loaded Results */}
      {successCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-3 flex items-center space-x-2">
          <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-emerald-800">
            <strong>{successCount} entries</strong> with existing SEO data loaded from database (persisted across page refreshes)
          </span>
        </div>
      )}

      {/* SEO Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
          <div className="text-xl font-bold text-slate-700">{seoReadyData.length}</div>
          <div className="text-xs text-gray-600">Ready for SEO Processing</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
          <div className="text-xl font-bold text-green-600">{successCount}</div>
          <div className="text-xs text-gray-600">✅ Processed & Saved</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
          <div className="text-xl font-bold text-red-600">{errorCount}</div>
          <div className="text-xs text-gray-600">Processing Errors</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
          <div className="text-xl font-bold text-slate-700">
            {selectedNeedingProcessing.length}
            {selectedSeoData.length > selectedNeedingProcessing.length && (
              <span className="text-sm text-gray-500 ml-1">
                / {selectedSeoData.length}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-600">
            Need Processing
            {selectedSeoData.length > selectedNeedingProcessing.length && (
              <span className="text-gray-400"> (of selected)</span>
            )}
          </div>
        </div>
      </div>

      {/* SEO Processing Controls */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleProcessSelected}
            disabled={selectedNeedingProcessing.length === 0 || processing}
            className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded hover:bg-slate-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            <span>🚀</span>
            <span>
              {processing 
                ? 'Processing...' 
                : selectedNeedingProcessing.length === 0 
                  ? `All Selected Processed (${selectedSeoData.length})`
                  : `Process Selected (${selectedNeedingProcessing.length})`
              }
            </span>
          </button>

          {/* Pause/Resume Button */}
          {processing && (
            <button
              onClick={onTogglePause}
              className={`px-3 py-1.5 text-sm text-white rounded transition-colors duration-200 flex items-center space-x-2 ${
                isPaused ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              <span>{isPaused ? '▶️' : '⏸️'}</span>
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          )}

          {/* Stop Button */}
          {processing && (
            <button
              onClick={onStop}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>⏹️</span>
              <span>Stop</span>
            </button>
          )}

          <button
            onClick={onExportResults}
            disabled={processedCount === 0}
            className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Export Results ({processedCount})</span>
          </button>
        </div>

        {/* Progress Bar with Status */}
        {seoProgress.total > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-700">
                Processing: {seoProgress.current} / {seoProgress.total}
                {isPaused && <span className="ml-2 text-orange-600">⏸️ PAUSED</span>}
              </span>
              <span className="text-xs text-gray-600">
                {Math.round((seoProgress.current / seoProgress.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isPaused ? 'bg-orange-600' : 'bg-emerald-600'
                }`}
                style={{ width: `${(seoProgress.current / seoProgress.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ⏳ 30-second delay between requests to avoid rate limiting
              {isPaused && " • Countdown paused"}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          {selectedEntries.length > 0 && (
            <>
              <button
                onClick={() => onSelectionChange([])}
                className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                🗑️ Delete ({selectedEntries.length})
              </button>
            </>
          )}

          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {seoReadyData.every(entry => selectedEntries.includes(entry.id)) && seoReadyData.length > 0
              ? `Deselect All (${seoReadyData.length})`
              : `Select All (${seoReadyData.length})`}
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={seoFilter}
            onChange={(e) => setSeoFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Entries</option>
            <option value="pending">Pending Processing</option>
            <option value="processed">Already Processed</option>
            <option value="selected">Selected Only</option>
          </select>

          <div className="text-xs text-gray-600">
            Showing {paginatedSeoData.length} of {seoReadyData.length} entries
          </div>
        </div>
      </div>

      {/* SEO Results Table */}
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">📈 SEO Processing Results</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  <input
                    type="checkbox"
                    checked={paginatedSeoData.length > 0 && paginatedSeoData.every(entry => selectedEntries.includes(entry.id))}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Original Title</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">SEO Title</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">SEO Description</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Keywords</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedSeoData.map((entry) => {
                const result = seoResults[entry.id];
                
                return (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.id)}
                        onChange={() => handleSelectEntry(entry.id)}
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(entry.id)}
                        {getStatusBadge(result?.status)}
                      </div>
                    </td>
                    <td className="px-3 py-2 max-w-xs">
                      <div className="text-xs font-medium text-gray-900 line-clamp-2">
                        {entry.spyTitle || 'No title'}
                      </div>
                    </td>
                    <td className="px-3 py-2 max-w-xs">
                      <div className="text-xs text-emerald-700 font-medium line-clamp-2">
                        {result?.title || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-2 max-w-sm">
                      <div className="text-xs text-gray-600 line-clamp-3">
                        {result?.description || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-2 max-w-xs">
                      <div className="text-xs text-blue-600">
                        {result?.keywords || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {result && (
                        <div className="text-xs text-gray-500">
                          <div><strong>Category:</strong> {result.category || '-'}</div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-3 py-2 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setSeoPage(1)}
                disabled={seoPage === 1}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => setSeoPage(Math.max(1, seoPage - 1))}
                disabled={seoPage === 1}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>
              <span className="text-xs text-gray-700 font-medium">
                {seoPage} / {totalPages}
              </span>
              <button
                onClick={() => setSeoPage(Math.min(totalPages, seoPage + 1))}
                disabled={seoPage === totalPages}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
              <button
                onClick={() => setSeoPage(totalPages)}
                disabled={seoPage === totalPages}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}

        {seoReadyData.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No entries ready for SEO processing</h3>
            <p className="text-xs">Make sure your entries have titles, descriptions, or ingredients to process.</p>
          </div>
        )}
      </div>

    </div>
  );
};