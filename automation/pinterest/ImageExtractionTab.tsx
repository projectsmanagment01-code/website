'use client';

import React, { useState } from 'react';
import { PinterestSpyData, ExtractionProgress } from './types';

interface ImageExtractionTabProps {
  spyData: PinterestSpyData[];
  selectedEntries: string[];
  onSelectionChange: (entries: string[]) => void;
  extractionStatus: Record<string, 'idle' | 'extracting' | 'success' | 'error'>;
  extractionResults: Record<string, {imageUrl: string, alt?: string, selector?: string}>;
  extractionProgress: ExtractionProgress;
  onExtractForSelected: () => void;
  onExtractForAll: () => void;
  onExtractSingle: (entry: PinterestSpyData) => void;
  onCancelExtraction: () => void;
  onUpdateImage: (entryId: string, imageUrl: string) => Promise<void>;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const ImageExtractionTab: React.FC<ImageExtractionTabProps> = ({
  spyData,
  selectedEntries,
  onSelectionChange,
  extractionStatus,
  extractionResults,
  extractionProgress,
  onExtractForSelected,
  onExtractForAll,
  onExtractSingle,
  onCancelExtraction,
  onUpdateImage,
  isPaused,
  onTogglePause
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterView, setFilterView] = useState<'all' | 'selected'>('selected');
  const [localSelection, setLocalSelection] = useState<string[]>([]);
  const [viewingImage, setViewingImage] = useState<{entryId: string, imageUrl: string, title: string} | null>(null);
  const [editingImage, setEditingImage] = useState<{entryId: string, currentUrl: string} | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const ITEMS_PER_PAGE = 20;

  // Show all entries that need extraction OR are selected
  const entriesWithUrls = spyData.filter(entry => entry.spyArticleUrl && !entry.spyImageUrl);
  const selectedWithUrls = spyData.filter(entry => 
    selectedEntries.includes(entry.id) && entry.spyArticleUrl && !entry.spyImageUrl
  );
  
  // Calculate skipped entries (selected but can't extract)
  const selectedButCantExtract = spyData.filter(entry => 
    selectedEntries.includes(entry.id) && (!entry.spyArticleUrl || entry.spyImageUrl)
  );

  // Display logic based on filter
  const displayEntries = filterView === 'selected' 
    ? selectedWithUrls 
    : entriesWithUrls;

  // Pagination
  const totalPages = Math.ceil(displayEntries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEntries = displayEntries.slice(startIndex, endIndex);

  // Selection handlers
  const handleSelectAll = () => {
    const allIds = displayEntries.map(entry => entry.id);
    const allSelected = allIds.every(id => localSelection.includes(id));
    
    if (allSelected) {
      setLocalSelection(localSelection.filter(id => !allIds.includes(id)));
    } else {
      const newSelection = [...new Set([...localSelection, ...allIds])];
      setLocalSelection(newSelection);
    }
  };

  const handleSelectEntry = (id: string) => {
    if (localSelection.includes(id)) {
      setLocalSelection(localSelection.filter(entryId => entryId !== id));
    } else {
      setLocalSelection([...localSelection, id]);
    }
  };

  const handleClearFromExtraction = () => {
    if (localSelection.length === 0) return;
    
    console.log('Before removal - selectedEntries:', selectedEntries.length);
    console.log('Removing:', localSelection.length);
    console.log('Current view:', filterView);
    
    // Remove locally selected entries from parent's selectedEntries
    const newSelectedEntries = selectedEntries.filter(id => !localSelection.includes(id));
    
    console.log('After removal - newSelectedEntries:', newSelectedEntries.length);
    
    onSelectionChange(newSelectedEntries);
    
    // Clear local selection
    setLocalSelection([]);
    
    // If we're in "selected only" view and just removed all selected items on this page,
    // go back to page 1 to avoid showing an empty page
    if (filterView === 'selected' && currentPage > 1) {
      const remainingSelected = spyData.filter(entry => 
        newSelectedEntries.includes(entry.id) && entry.spyArticleUrl && !entry.spyImageUrl
      );
      const newTotalPages = Math.ceil(remainingSelected.length / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages) {
        setCurrentPage(1);
      }
    }
    
    console.log('✅ Removed entries from queue. Check "Total Selected" stat above.');
  };

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
      'idle': 'bg-gray-50 text-gray-700 border-gray-200',
      'extracting': 'bg-blue-50 text-blue-700 border-blue-200',
      'success': 'bg-green-50 text-green-700 border-green-200',
      'error': 'bg-red-50 text-red-700 border-red-200'
    };

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${badgeClasses[status as keyof typeof badgeClasses] || badgeClasses.idle}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {/* Warning for skipped entries */}
      {selectedButCantExtract.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded p-3">
          <div className="flex items-start gap-2">
            <span className="text-orange-600 text-lg">⚠️</span>
            <div>
              <h3 className="text-sm font-semibold text-orange-900 mb-1">
                {selectedButCantExtract.length} entries skipped
              </h3>
              <p className="text-xs text-orange-700">
                You selected {selectedEntries.length} entries, but {selectedButCantExtract.length} cannot be extracted because they either:
                <br/>• Don't have an article URL ({spyData.filter(e => selectedEntries.includes(e.id) && !e.spyArticleUrl).length}), OR
                <br/>• Already have an image ({spyData.filter(e => selectedEntries.includes(e.id) && e.spyImageUrl).length})
                <br/><strong>Showing {selectedWithUrls.length} entries ready for extraction.</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
          <div className="text-xl font-bold text-slate-700">{selectedEntries.length}</div>
          <div className="text-xs text-gray-600">Total Selected</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
          <div className="text-xl font-bold text-blue-600">{selectedWithUrls.length}</div>
          <div className="text-xs text-gray-600">Can Extract (Has URL, No Image)</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
          <div className="text-xl font-bold text-slate-700">{entriesWithUrls.length}</div>
          <div className="text-xs text-gray-600">Total Need Extraction</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
          <div className="text-xl font-bold text-green-600">
            {Object.values(extractionStatus).filter(status => status === 'success').length}
          </div>
          <div className="text-xs text-gray-600">Successfully Extracted</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
          <div className="text-xl font-bold text-red-600">
            {Object.values(extractionStatus).filter(status => status === 'error').length}
          </div>
          <div className="text-xs text-gray-600">Extraction Errors</div>
        </div>
      </div>

      {/* Batch Operations */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">🖼️ Batch Image Extraction</h3>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const selectedData = spyData.filter(entry => 
                localSelection.includes(entry.id) && entry.spyArticleUrl && !entry.spyImageUrl
              );
              if (selectedData.length === 0) {
                return;
              }
              // Add to parent selection for extraction
              const newSelection = [...new Set([...selectedEntries, ...localSelection])];
              onSelectionChange(newSelection);
            }}
            disabled={localSelection.length === 0 || extractionProgress.total > 0}
            className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded hover:bg-slate-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            🎯 Extract Selected ({localSelection.length})
          </button>
          
          <button
            onClick={onExtractForAll}
            disabled={entriesWithUrls.length === 0 || extractionProgress.total > 0}
            className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            🌐 Extract All ({entriesWithUrls.length})
          </button>

          {extractionProgress.total > 0 && (
            <>
              <button
                onClick={onTogglePause}
                className={`px-3 py-1.5 text-sm text-white rounded transition-colors ${
                  isPaused 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button
                onClick={onCancelExtraction}
                className="px-3 py-1.5 text-sm bg-slate-800 text-white rounded hover:bg-slate-900 transition-colors"
              >
                ⏹️ Stop
              </button>
            </>
          )}

          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {displayEntries.length > 0 && displayEntries.every(entry => localSelection.includes(entry.id))
              ? `Deselect All (${displayEntries.length})`
              : `Select All (${displayEntries.length})`}
          </button>

          {selectedEntries.length > 0 && (
            <button
              onClick={() => {
                // Clear the entire extraction queue
                onSelectionChange([]);
                setLocalSelection([]);
              }}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              🗑️ Clear Queue ({selectedEntries.length})
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {extractionProgress.total > 0 && (
          <div className={`mt-3 p-3 rounded border ${isPaused ? 'bg-orange-50 border-orange-300' : 'bg-slate-50 border-slate-300'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${isPaused ? 'text-orange-800' : 'text-slate-800'}`}>
                {isPaused ? '⏸️ Paused' : '⏳ Extracting Images...'} ({extractionProgress.current}/{extractionProgress.total})
              </span>
              <span className={`text-xs ${isPaused ? 'text-orange-700' : 'text-slate-700'}`}>
                {Math.round((extractionProgress.current / extractionProgress.total) * 100)}%
              </span>
            </div>
            <div className={`w-full rounded h-2 ${isPaused ? 'bg-orange-200' : 'bg-slate-200'}`}>
              <div
                className={`h-2 rounded transition-all duration-300 ${isPaused ? 'bg-orange-600' : 'bg-emerald-600'}`}
                style={{ width: `${(extractionProgress.current / extractionProgress.total) * 100}%` }}
              />
            </div>
            <p className={`text-xs mt-2 font-medium ${isPaused ? 'text-orange-800' : 'text-slate-700'}`}>
              {isPaused 
                ? '⏸️ Extraction paused. Click Resume to continue.' 
                : '🚀 Processing 15 images in parallel for maximum speed!'}
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filterView}
            onChange={(e) => {
              setFilterView(e.target.value as 'all' | 'selected');
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
          >
            <option value="all">All Entries ({entriesWithUrls.length})</option>
            <option value="selected">Selected Only ({selectedWithUrls.length})</option>
          </select>

          <div className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 rounded border border-gray-200">
            Showing {displayEntries.length} entries
          </div>
        </div>
      </div>

      {/* Extraction Results Table */}
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">📊 Extraction Status & Results</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  <input
                    type="checkbox"
                    checked={paginatedEntries.length > 0 && paginatedEntries.every(entry => localSelection.includes(entry.id))}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Title</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Article URL</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Extracted Image</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedEntries.map((entry) => {
                const status = extractionStatus[entry.id] || 'idle';
                const result = extractionResults[entry.id];
                const isInQueue = selectedEntries.includes(entry.id);
                
                return (
                  <tr key={entry.id} className={`hover:bg-gray-50 transition-colors ${isInQueue ? 'bg-blue-50' : ''}`}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={localSelection.includes(entry.id)}
                        onChange={() => handleSelectEntry(entry.id)}
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {isInQueue && <span className="text-blue-600 font-bold">📋</span>}
                        {getExtractionStatusIcon(entry.id)}
                        {getStatusBadge(status)}
                      </div>
                    </td>
                    <td className="px-3 py-2 max-w-xs">
                      <div className="text-xs font-medium text-gray-900 line-clamp-2">
                        {entry.spyTitle || 'No title'}
                      </div>
                    </td>
                    <td className="px-3 py-2 max-w-xs">
                      <a
                        href={entry.spyArticleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 truncate block"
                      >
                        {entry.spyArticleUrl}
                      </a>
                    </td>
                    <td className="px-3 py-2">
                      <div 
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => {
                          const imageUrl = result?.imageUrl || entry.spyImageUrl || '';
                          console.log('Opening image viewer for:', imageUrl);
                          setViewingImage({
                            entryId: entry.id,
                            imageUrl: imageUrl,
                            title: entry.spyTitle || 'No title'
                          });
                        }}
                      >
                        {result?.imageUrl || entry.spyImageUrl ? (
                          <>
                            <img
                              src={result?.imageUrl || entry.spyImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3E✕%3C/text%3E%3C/svg%3E'}
                              alt={result?.alt || 'Extracted image'}
                              className="w-12 h-12 object-cover rounded border hover:opacity-80 transition-opacity"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3E✕%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {result?.imageUrl || entry.spyImageUrl}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-gray-400 hover:text-blue-600">
                            <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                              ➕
                            </div>
                            <span>Click to add image URL</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                        onClick={() => onExtractSingle(entry)}
                        disabled={status === 'extracting'}
                        className="px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Extract image"
                      >
                        {status === 'extracting' ? '⏳ Extracting...' : '🔍 Extract'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {displayEntries.length > 0 && totalPages > 1 && (
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, displayEntries.length)} of {displayEntries.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>
              <span className="px-3 py-1 text-xs bg-slate-700 text-white rounded">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}

        {displayEntries.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All entries have images!</h3>
            <p>There are no entries that need image extraction at this time.</p>
          </div>
        )}
      </div>

      {/* Image Viewer Popup */}
      {viewingImage && !editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setViewingImage(null)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{viewingImage.title}</h3>
              <button
                onClick={() => setViewingImage(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            {viewingImage.imageUrl ? (
              <div className="mb-4 flex justify-center bg-gray-100 rounded p-4">
                <img
                  src={viewingImage.imageUrl}
                  alt={viewingImage.title}
                  className="max-w-full max-h-[60vh] object-contain rounded shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-red-600 text-center p-8';
                    errorDiv.innerHTML = `
                      <div class="text-4xl mb-2">❌</div>
                      <div class="font-semibold">Failed to load image</div>
                      <div class="text-sm mt-2">The image URL might be broken or inaccessible</div>
                    `;
                    target.parentElement?.appendChild(errorDiv);
                  }}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.log('Image loaded successfully:', viewingImage.imageUrl);
                  }}
                />
              </div>
            ) : (
              <div className="mb-4 flex justify-center bg-gray-100 rounded p-16">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">🖼️</div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No Image URL</h4>
                  <p className="text-sm">This entry doesn't have an image URL yet.</p>
                  <p className="text-sm">Click "Add Image URL" below to add one manually.</p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={viewingImage.imageUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(viewingImage.imageUrl);
                  }}
                  className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                  title="Copy URL"
                >
                  📋 Copy
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingImage({
                    entryId: viewingImage.entryId,
                    currentUrl: viewingImage.imageUrl
                  });
                  setNewImageUrl(viewingImage.imageUrl);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {viewingImage.imageUrl ? '✏️ Edit URL' : '➕ Add Image URL'}
              </button>
              {viewingImage.imageUrl && (
                <>
                  <button
                    onClick={async () => {
                      if (confirm('Delete this image URL? The entry will need extraction again.')) {
                        await onUpdateImage(viewingImage.entryId, '');
                        setViewingImage(null);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    🗑️ Delete
                  </button>
                  <button
                    onClick={() => window.open(viewingImage.imageUrl, '_blank')}
                    className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    🔗 Open Original
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Image URL Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Image URL</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Image:
                </label>
                <img
                  src={editingImage.currentUrl}
                  alt="Current"
                  className="w-48 h-48 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="192" height="192"%3E%3Crect fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3E✕%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Image URL:
                </label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {newImageUrl && newImageUrl !== editingImage.currentUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview:
                  </label>
                  <img
                    src={newImageUrl}
                    alt="Preview"
                    className="w-48 h-48 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="192" height="192"%3E%3Crect fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3EInvalid%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={async () => {
                  if (newImageUrl.trim()) {
                    await onUpdateImage(editingImage.entryId, newImageUrl.trim());
                    setEditingImage(null);
                    setNewImageUrl('');
                    setViewingImage(null);
                  }
                }}
                disabled={!newImageUrl.trim() || newImageUrl === editingImage.currentUrl}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                💾 Save
              </button>
              <button
                onClick={() => {
                  setEditingImage(null);
                  setNewImageUrl('');
                }}
                className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};