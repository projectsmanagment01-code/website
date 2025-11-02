'use client';

import React, { useState, useEffect } from 'react';
import { PinterestSpyData, Stats } from './types';

interface DataManagementTabProps {
  spyData: PinterestSpyData[];
  stats: Stats;
  loading: boolean;
  selectedEntries: string[];
  onSelectionChange: (entries: string[]) => void;
  onRefresh: () => void;
  onBulkImport: () => void;
  onUpdateEntry: (id: string, updates: Partial<PinterestSpyData>) => Promise<boolean>;
  onDeleteEntries: (ids: string[]) => Promise<boolean>;
  onSendToImageExtraction: () => void;
}

export const DataManagementTab: React.FC<DataManagementTabProps> = ({
  spyData,
  stats,
  loading,
  selectedEntries,
  onSelectionChange,
  onRefresh,
  onBulkImport,
  onUpdateEntry,
  onDeleteEntries,
  onSendToImageExtraction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [imageFilter, setImageFilter] = useState<string>('all');
  const [hasArticleUrl, setHasArticleUrl] = useState<string>('all');
  const [hasAnnotation, setHasAnnotation] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string, author?: string, entryId?: string} | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState<{entryId: string, currentUrl: string} | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  const ITEMS_PER_PAGE = 20;

  // Filter and paginate data
  const filteredData = spyData.filter(entry => {
    const matchesSearch = (entry.spyTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (entry.spyDescription?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (entry.spyKeywords?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || entry.spyStatus === statusFilter;
    
    const matchesImage = imageFilter === 'all' || 
                        (imageFilter === 'with-image' && entry.spyImageUrl) ||
                        (imageFilter === 'no-image' && !entry.spyImageUrl);
    
    const matchesArticleUrl = hasArticleUrl === 'all' ||
                             (hasArticleUrl === 'with-url' && entry.spyArticleUrl) ||
                             (hasArticleUrl === 'no-url' && !entry.spyArticleUrl);
    
    const matchesAnnotation = hasAnnotation === 'all' ||
                             (hasAnnotation === 'with-annotation' && entry.annotation) ||
                             (hasAnnotation === 'no-annotation' && !entry.annotation);
    
    return matchesSearch && matchesStatus && matchesImage && matchesArticleUrl && matchesAnnotation;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, imageFilter, hasArticleUrl, hasAnnotation]);

  const handleSelectAll = () => {
    const allFilteredIds = filteredData.map(entry => entry.id);
    const allSelected = allFilteredIds.every(id => selectedEntries.includes(id));
    
    if (allSelected) {
      // Deselect all filtered entries
      onSelectionChange(selectedEntries.filter(id => !allFilteredIds.includes(id)));
    } else {
      // Select all filtered entries
      const newSelection = [...new Set([...selectedEntries, ...allFilteredIds])];
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

  const handleDeleteSelected = async () => {
    if (selectedEntries.length === 0) return;
    
    if (confirm(`Delete ${selectedEntries.length} selected entries?`)) {
      const success = await onDeleteEntries(selectedEntries);
      if (success) {
        onSelectionChange([]);
      }
    }
  };

  const handleExportData = () => {
    const dataToExport = selectedEntries.length > 0 
      ? spyData.filter(entry => selectedEntries.includes(entry.id))
      : filteredData;

    if (dataToExport.length === 0) {
      alert('No data to export.');
      return;
    }

    const csvContent = [
      'Title,Description,Image URL,Article URL,Author,Status,Category,Keywords',
      ...dataToExport.map(entry => 
        `"${(entry.spyTitle || '').replace(/"/g, '""')}","${(entry.spyDescription || '').replace(/"/g, '""')}","${entry.spyImageUrl || ''}","${entry.spyArticleUrl || ''}","${entry.spyAuthor || ''}","${entry.spyStatus || ''}","${entry.spyCategory || ''}","${(entry.spyKeywords || '').replace(/"/g, '""')}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pinterest-spy-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status?: string) => {
    const colors = {
      'PENDING': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'PROCESSING': 'bg-blue-50 text-blue-700 border-blue-200',
      'SEO_COMPLETED': 'bg-green-50 text-green-700 border-green-200',
      'COMPLETED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'ERROR': 'bg-red-50 text-red-700 border-red-200'
    };

    const colorClass = colors[status as keyof typeof colors] || colors.PENDING;

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}>
        {status?.replace('_', ' ') || 'PENDING'}
      </span>
    );
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
          <div className="text-xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600">Total Entries</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
          <div className="text-xl font-bold text-green-600">
            {stats.byStatus['SEO_COMPLETED'] || 0}
          </div>
          <div className="text-xs text-gray-600">SEO Processed</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
          <div className="text-xl font-bold text-slate-700">
            {stats.markedForGeneration}
          </div>
          <div className="text-xs text-gray-600">Ready to Generate</div>
        </div>
        <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
          <div className="text-xl font-bold text-slate-700">
            {stats.byStatus['COMPLETED'] || 0}
          </div>
          <div className="text-xs text-gray-600">Recipes Generated</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search and Dropdowns */}
          <input
            type="text"
            placeholder="Search title, description, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px] px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SEO_COMPLETED">SEO Completed</option>
            <option value="COMPLETED">Completed</option>
            <option value="ERROR">Error</option>
          </select>

          <select
            value={imageFilter}
            onChange={(e) => setImageFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
          >
            <option value="all">All Images</option>
            <option value="with-image">With Image</option>
            <option value="no-image">No Image</option>
          </select>

          <select
            value={hasArticleUrl}
            onChange={(e) => setHasArticleUrl(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
          >
            <option value="all">All Articles</option>
            <option value="with-url">Has Article URL</option>
            <option value="no-url">No Article URL</option>
          </select>

          <select
            value={hasAnnotation}
            onChange={(e) => setHasAnnotation(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
          >
            <option value="all">All Annotations</option>
            <option value="with-annotation">Has Annotation</option>
            <option value="no-annotation">No Annotation</option>
          </select>

          <div className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 rounded border border-gray-200">
            Showing {filteredData.length} of {stats.total} entries
          </div>

          {/* Action Buttons */}
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 text-sm bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
          >
            🔄 Refresh
          </button>

          <button
            onClick={onBulkImport}
            className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded hover:bg-slate-800 transition-colors"
          >
            📋 Bulk Import
          </button>

          <button
            onClick={handleExportData}
            disabled={filteredData.length === 0}
            className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            📥 Export {selectedEntries.length > 0 ? `(${selectedEntries.length})` : `(${filteredData.length})`}
          </button>

          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {filteredData.length > 0 && filteredData.every(entry => selectedEntries.includes(entry.id))
              ? `Deselect All (${stats.total})`
              : `Select All (${stats.total})`}
          </button>

          {selectedEntries.length > 0 && (
            <>
              <button
                onClick={() => {
                  onSendToImageExtraction();
                  alert(`Sent ${selectedEntries.length} entries to Image Extraction tab. Switch to the Image Extract tab to process them.`);
                }}
                className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
              >
                🖼️ Send to Image Extract ({selectedEntries.length})
              </button>
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
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && paginatedData.every(entry => selectedEntries.includes(entry.id))}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">SPY Title</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">SPY Description</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">SPY Image URL</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">SPY Article URL</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">SPY PIN Image</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Annotation</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedData.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEntries.includes(entry.id)}
                      onChange={() => handleSelectEntry(entry.id)}
                      className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                    />
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="text-xs font-medium text-gray-900 line-clamp-2">
                      {entry.spyTitle || 'No title'}
                    </div>
                  </td>
                  <td className="px-3 py-2 max-w-sm">
                    <div className="text-xs text-gray-600 line-clamp-2">
                      {entry.spyDescription || 'No description'}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {entry.spyImageUrl ? (
                      <img 
                        src={entry.spyImageUrl} 
                        alt=""
                        onClick={() => setSelectedImage({url: entry.spyImageUrl!, title: entry.spyTitle || 'Image', entryId: entry.id})}
                        className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23ddd" width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo img%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">-</div>
                    )}
                  </td>
                  <td className="px-3 py-2 max-w-[150px]">
                    {entry.spyArticleUrl ? (
                      <a href={entry.spyArticleUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 truncate block">
                        {entry.spyArticleUrl}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 max-w-[100px]">
                    {entry.spyPinImage ? (
                      <a href={entry.spyPinImage} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 truncate block">
                        {entry.spyPinImage}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="text-xs text-gray-600 line-clamp-2">
                      {entry.annotation || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {getStatusColor(entry.spyStatus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
            </div>
            {totalPages > 1 && (
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
            )}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedImage.title}</h3>
                {selectedImage.author && (
                  <p className="text-sm text-gray-600 mt-1">By {selectedImage.author}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full h-auto rounded-lg"
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingImageUrl({
                      entryId: selectedImage.entryId!,
                      currentUrl: selectedImage.url
                    });
                    setNewImageUrl(selectedImage.url);
                    setSelectedImage(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  ✏️ Edit URL
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Delete this image URL?')) {
                      await onUpdateEntry(selectedImage.entryId!, { spyImageUrl: '' });
                      setSelectedImage(null);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  🗑️ Delete
                </button>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedImage.url);
                }}
                className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                📋 Copy URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Image URL Modal */}
      {editingImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Image URL</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Image:
                </label>
                <img
                  src={editingImageUrl.currentUrl}
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

              {newImageUrl && newImageUrl !== editingImageUrl.currentUrl && (
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
                    await onUpdateEntry(editingImageUrl.entryId, { spyImageUrl: newImageUrl.trim() });
                    setEditingImageUrl(null);
                    setNewImageUrl('');
                  }
                }}
                disabled={!newImageUrl.trim() || newImageUrl === editingImageUrl.currentUrl}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                💾 Save
              </button>
              <button
                onClick={() => {
                  setEditingImageUrl(null);
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