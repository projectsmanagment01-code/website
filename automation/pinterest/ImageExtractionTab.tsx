'use client';

import React from 'react';
import { PinterestSpyData, ExtractionProgress } from './types';

interface ImageExtractionTabProps {
  spyData: PinterestSpyData[];
  selectedEntries: string[];
  extractionStatus: Record<string, 'idle' | 'extracting' | 'success' | 'error'>;
  extractionResults: Record<string, {imageUrl: string, alt?: string, selector?: string}>;
  extractionProgress: ExtractionProgress;
  onExtractForSelected: () => void;
  onExtractForAll: () => void;
  onExtractSingle: (entry: PinterestSpyData) => void;
}

export const ImageExtractionTab: React.FC<ImageExtractionTabProps> = ({
  spyData,
  selectedEntries,
  extractionStatus,
  extractionResults,
  extractionProgress,
  onExtractForSelected,
  onExtractForAll,
  onExtractSingle
}) => {
  const entriesWithUrls = spyData.filter(entry => entry.spyArticleUrl && !entry.spyImageUrl);
  const selectedWithUrls = spyData.filter(entry => 
    selectedEntries.includes(entry.id) && entry.spyArticleUrl && !entry.spyImageUrl
  );

  const getExtractionStatusIcon = (entryId: string) => {
    const status = extractionStatus[entryId] || 'idle';
    switch (status) {
      case 'extracting':
        return <span className="text-blue-500 animate-spin">⏳</span>;
      case 'success':
        return <span className="text-green-500">✅</span>;
      case 'error':
        return <span className="text-red-500">❌</span>;
      default:
        return <span className="text-gray-400">⭕</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    const badgeClasses = {
      'idle': 'bg-gray-100 text-gray-600 border-gray-200',
      'extracting': 'bg-blue-100 text-blue-600 border-blue-200',
      'success': 'bg-green-100 text-green-600 border-green-200',
      'error': 'bg-red-100 text-red-600 border-red-200'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${badgeClasses[status as keyof typeof badgeClasses] || badgeClasses.idle}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">{entriesWithUrls.length}</div>
          <div className="text-sm text-gray-600">Need Image Extraction</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-purple-600">{selectedWithUrls.length}</div>
          <div className="text-sm text-gray-600">Selected for Extraction</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {Object.values(extractionStatus).filter(status => status === 'success').length}
          </div>
          <div className="text-sm text-gray-600">Successfully Extracted</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-red-600">
            {Object.values(extractionStatus).filter(status => status === 'error').length}
          </div>
          <div className="text-sm text-gray-600">Extraction Errors</div>
        </div>
      </div>

      {/* Batch Operations */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🖼️ Batch Image Extraction</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <button
              onClick={onExtractForSelected}
              disabled={selectedWithUrls.length === 0 || extractionProgress.total > 0}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>🎯</span>
              <span>Extract Images for Selected ({selectedWithUrls.length})</span>
            </button>
            
            <button
              onClick={onExtractForAll}
              disabled={entriesWithUrls.length === 0 || extractionProgress.total > 0}
              className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>🌐</span>
              <span>Extract Images for All ({entriesWithUrls.length})</span>
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-700 mb-2">How it works:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Navigates to each article URL</li>
              <li>• Uses 25+ intelligent selectors</li>
              <li>• Finds the best featured image</li>
              <li>• Validates image quality & size</li>
              <li>• 3-second delay between requests</li>
            </ul>
          </div>
        </div>

        {/* Progress Bar */}
        {extractionProgress.total > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">
                Extracting Images... ({extractionProgress.current}/{extractionProgress.total})
              </span>
              <span className="text-sm text-blue-600">
                {Math.round((extractionProgress.current / extractionProgress.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(extractionProgress.current / extractionProgress.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Please wait... This process may take several minutes depending on the number of entries.
            </p>
          </div>
        )}
      </div>

      {/* Extraction Results Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">📊 Extraction Status & Results</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Article URL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Extracted Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entriesWithUrls.map((entry) => {
                const status = extractionStatus[entry.id] || 'idle';
                const result = extractionResults[entry.id];
                
                return (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getExtractionStatusIcon(entry.id)}
                        {getStatusBadge(status)}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {entry.spyTitle || 'No title'}
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <a
                        href={entry.spyArticleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 truncate block"
                      >
                        {entry.spyArticleUrl}
                      </a>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {result?.imageUrl ? (
                        <div className="flex items-center space-x-2">
                          <img
                            src={result.imageUrl}
                            alt={result.alt || 'Extracted image'}
                            className="w-12 h-12 object-cover rounded border"
                          />
                          <div className="text-xs text-gray-500">
                            <div>Selector: {result.selector}</div>
                            {result.alt && <div>Alt: {result.alt}</div>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No image extracted</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onExtractSingle(entry)}
                        disabled={status === 'extracting'}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {status === 'extracting' ? 'Extracting...' : 'Extract'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {entriesWithUrls.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All entries have images!</h3>
            <p>There are no entries that need image extraction at this time.</p>
          </div>
        )}
      </div>

      {/* Technical Information */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">🔧 Technical Details</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Image Detection Methods:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Recipe-specific selectors (25+ patterns)</li>
              <li>• JSON-LD structured data parsing</li>
              <li>• Meta property extraction</li>
              <li>• Image size and quality validation</li>
              <li>• Fallback to largest relevant image</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Processing Features:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Smart rate limiting (3s delays)</li>
              <li>• Error handling and retries</li>
              <li>• Progress tracking and status updates</li>
              <li>• Image quality scoring</li>
              <li>• Automatic database updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};