'use client';

import React, { useState } from 'react';
import { PinterestSpyData, SEOResult } from './types';

interface SEOResultsTabProps {
  spyData: PinterestSpyData[];
  selectedEntries: string[];
  seoResults: Record<string, SEOResult>;
  onProcessSEO: (entries: PinterestSpyData[], prompt: string) => void;
  onExportResults: () => void;
  getAuthHeaders: () => Record<string, string>;
}

export const SEOResultsTab: React.FC<SEOResultsTabProps> = ({
  spyData,
  selectedEntries,
  seoResults,
  onProcessSEO,
  onExportResults,
  getAuthHeaders
}) => {
  const [seoFilter, setSeoFilter] = useState('all');
  const [seoPage, setSeoPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(`Extract comprehensive SEO data from this recipe content and return a JSON object with the following structure:

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

  const selectedSeoData = spyData.filter(entry => 
    selectedEntries.includes(entry.id) && (entry.spyTitle || entry.spyDescription || entry.spyIngredients)
  );

  const processedCount = Object.keys(seoResults).length;
  const successCount = Object.values(seoResults).filter(r => r.status === 'completed').length;
  const errorCount = Object.values(seoResults).filter(r => r.status === 'error').length;

  const handleProcessSelected = async () => {
    if (selectedSeoData.length === 0) {
      alert('Please select entries with content to process for SEO.');
      return;
    }

    if (!confirm(`Process SEO for ${selectedSeoData.length} selected entries?`)) {
      return;
    }

    setProcessing(true);
    try {
      await onProcessSEO(selectedSeoData, customPrompt);
    } finally {
      setProcessing(false);
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
      'processing': 'bg-blue-100 text-blue-600 border-blue-200',
      'completed': 'bg-green-100 text-green-600 border-green-200',
      'error': 'bg-red-100 text-red-600 border-red-200'
    };

    if (!status) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium border bg-gray-100 text-gray-600 border-gray-200">
          Pending
        </span>
      );
    }

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${badgeClasses[status as keyof typeof badgeClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* SEO Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">{seoReadyData.length}</div>
          <div className="text-sm text-gray-600">Ready for SEO</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">{successCount}</div>
          <div className="text-sm text-gray-600">Successfully Processed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-sm text-gray-600">Processing Errors</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-purple-600">{selectedSeoData.length}</div>
          <div className="text-sm text-gray-600">Selected for Processing</div>
        </div>
      </div>

      {/* SEO Processing Controls */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 AI SEO Processing</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom SEO Extraction Prompt:
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="Enter your custom prompt for SEO extraction..."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleProcessSelected}
              disabled={selectedSeoData.length === 0 || processing}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            >
              <span>🚀</span>
              <span>
                {processing ? 'Processing...' : `Process Selected (${selectedSeoData.length})`}
              </span>
            </button>

            <button
              onClick={onExportResults}
              disabled={processedCount === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            >
              <span>📊</span>
              <span>Export Results ({processedCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={seoFilter}
            onChange={(e) => setSeoFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Entries</option>
            <option value="pending">Pending Processing</option>
            <option value="processed">Already Processed</option>
            <option value="selected">Selected Only</option>
          </select>

          <div className="text-sm text-gray-600">
            Showing {paginatedSeoData.length} of {seoReadyData.length} entries
          </div>
        </div>
      </div>

      {/* SEO Results Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">📈 SEO Processing Results</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Original Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SEO Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SEO Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Keywords</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSeoData.map((entry) => {
                const result = seoResults[entry.id];
                
                return (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(entry.id)}
                        {getStatusBadge(result?.status)}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {entry.spyTitle || 'No title'}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <div className="text-sm text-emerald-700 font-medium line-clamp-2">
                        {result?.title || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-sm">
                      <div className="text-sm text-gray-600 line-clamp-3">
                        {result?.description || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <div className="text-xs text-blue-600">
                        {result?.keywords || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {result && (
                        <div className="text-xs text-gray-500 space-y-1">
                          <div><strong>Category:</strong> {result.category}</div>
                          <div><strong>Cook Time:</strong> {result.cookingTime}</div>
                          <div><strong>Servings:</strong> {result.servings}</div>
                          <div><strong>Difficulty:</strong> {result.difficulty}</div>
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
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setSeoPage(Math.max(1, seoPage - 1))}
                  disabled={seoPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setSeoPage(Math.min(totalPages, seoPage + 1))}
                  disabled={seoPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, seoReadyData.length)}</span> of{' '}
                    <span className="font-medium">{seoReadyData.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setSeoPage(Math.max(1, seoPage - 1))}
                      disabled={seoPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setSeoPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          seoPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setSeoPage(Math.min(totalPages, seoPage + 1))}
                      disabled={seoPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}

        {seoReadyData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No entries ready for SEO processing</h3>
            <p>Make sure your entries have titles, descriptions, or ingredients to process.</p>
          </div>
        )}
      </div>

      {/* Processing Tips */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-lg border border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-800 mb-3">💡 SEO Processing Tips</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-emerald-700 mb-2">Best Practices:</h4>
            <ul className="text-sm text-emerald-600 space-y-1">
              <li>• Process entries with rich content first</li>
              <li>• Review and customize the AI prompt</li>
              <li>• Check results for accuracy before use</li>
              <li>• Export results for external tools</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-emerald-700 mb-2">What Gets Processed:</h4>
            <ul className="text-sm text-emerald-600 space-y-1">
              <li>• Recipe titles and descriptions</li>
              <li>• Ingredient lists and instructions</li>
              <li>• Cooking times and difficulty levels</li>
              <li>• Categories and relevant tags</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};