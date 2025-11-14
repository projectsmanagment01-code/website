'use client';

import React, { useState, useEffect, memo } from 'react';
import { PinterestSpyData, Stats } from './types';

// Fast thumbnail component - optimized for speed, no lazy loading
const FastThumbnail = memo(({ 
  src, 
  alt, 
  onClick, 
  title 
}: {
  src: string;
  alt: string;
  onClick: () => void;
  title?: string;
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23f3f4f6" width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="10"%3E❌%3C/text%3E%3C/svg%3E');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;
    
    // Generate optimized image URL with aggressive compression
    let optimizedSrc = src;
    
    try {
      const url = new URL(src);
      // Add optimization parameters for common image services
      if (url.hostname.includes('pinterest') || url.hostname.includes('pinimg')) {
        optimizedSrc = src.replace(/\/\d+x\//, '/75x75/'); // Pinterest small thumbnails
      } else if (url.hostname.includes('unsplash')) {
        optimizedSrc = `${src}?w=48&h=48&q=20&fm=webp&fit=crop`;
      } else if (url.hostname.includes('cloudinary')) {
        optimizedSrc = src.replace(/\/upload\//, '/upload/w_48,h_48,c_fill,q_20,f_webp/');
      } else if (url.hostname.includes('imgur')) {
        optimizedSrc = src.replace(/\.(jpg|jpeg|png|gif)$/i, 's.$1'); // Imgur small
      } else {
        // Generic optimization with very low quality for speed
        optimizedSrc = `${src}${src.includes('?') ? '&' : '?'}w=48&h=48&q=20`;
      }
    } catch {
      optimizedSrc = src;
    }

    setImgSrc(optimizedSrc);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (imgSrc !== src) {
        setImgSrc(src); // Try original
      } else {
        // Final fallback
        setImgSrc('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23f3f4f6" width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="10"%3E❌%3C/text%3E%3C/svg%3E');
      }
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      title={title}
      onClick={onClick}
      className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity bg-gray-100"
      style={{ 
        imageRendering: 'pixelated',
        transform: 'translateZ(0)',
        minHeight: '48px',
        minWidth: '48px'
      }}
      onError={handleError}
    />
  );
});

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
  onAutoImageExtraction: (entry: PinterestSpyData) => Promise<boolean>;
  backgroundExtractionActive: boolean;
  onBackgroundExtractionStart: () => void;
  onBackgroundExtractionEnd: () => void;
}

FastThumbnail.displayName = 'FastThumbnail';

// Image preloader service for better performance
class ImagePreloader {
  private cache = new Map<string, Promise<string>>();
  private maxCacheSize = 200;

  preload(src: string): Promise<string> {
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    const promise = new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
      // Set small size for preloading
      img.width = 48;
      img.height = 48;
    });

    // Manage cache size
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(src, promise);
    return promise;
  }
}

const imagePreloader = new ImagePreloader();

// Helper function to check if URL is invalid
const isInvalidUrl = (url: string): boolean => {
  if (!url || !url.trim()) return false;
  try {
    new URL(url);
    return false;
  } catch {
    return true;
  }
};

// Helper function to check if entry has invalid URLs (from annotation flags or direct URL validation)
const hasInvalidUrls = (entry: PinterestSpyData): { hasInvalidArticle: boolean; hasInvalidImage: boolean } => {
  const annotation = entry.annotation || '';
  return {
    hasInvalidArticle: annotation.includes('INVALID_ARTICLE_URL') || isInvalidUrl(entry.spyArticleUrl || ''),
    hasInvalidImage: annotation.includes('INVALID_IMAGE_URL') || isInvalidUrl(entry.spyImageUrl || '')
  };
};

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
  onAutoImageExtraction,
  backgroundExtractionActive,
  onBackgroundExtractionStart,
  onBackgroundExtractionEnd
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [imageFilter, setImageFilter] = useState<string>('all');
  const [hasArticleUrl, setHasArticleUrl] = useState<string>('all');
  const [hasAnnotation, setHasAnnotation] = useState<string>('all');
  const [invalidUrlFilter, setInvalidUrlFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string, author?: string, entryId?: string} | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState<{entryId: string, currentUrl: string} | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshActive, setAutoRefreshActive] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PinterestSpyData | null;
    direction: 'asc' | 'desc';
  }>({ key: 'id', direction: 'asc' }); // Default sort by ID to ensure consistent order

  const ITEMS_PER_PAGE = 50; // Increased for better performance with optimized images

  // Sorting function
  const handleSort = (key: keyof PinterestSpyData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Sort indicator component
  const SortIndicator = ({ column }: { column: keyof PinterestSpyData }) => {
    if (sortConfig.key !== column) {
      return <span className="text-gray-400 ml-1">↕️</span>;
    }
    return (
      <span className="text-blue-600 ml-1">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // Filter, sort, and paginate data
  const filteredAndSortedData = spyData
    .filter(entry => {
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

      const invalidUrls = hasInvalidUrls(entry);
      const matchesInvalidUrl = invalidUrlFilter === 'all' ||
                               (invalidUrlFilter === 'invalid-urls' && (invalidUrls.hasInvalidArticle || invalidUrls.hasInvalidImage)) ||
                               (invalidUrlFilter === 'valid-urls' && !invalidUrls.hasInvalidArticle && !invalidUrls.hasInvalidImage);
      
      return matchesSearch && matchesStatus && matchesImage && matchesArticleUrl && matchesAnnotation && matchesInvalidUrl;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      // Handle null/undefined values
      if (aVal === null || aVal === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bVal === null || bVal === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
      
      // String comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      
      // Date comparison
      if (aVal instanceof Date && bVal instanceof Date) {
        const comparison = aVal.getTime() - bVal.getTime();
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      
      // Number comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        const comparison = aVal - bVal;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      
      // Default string comparison
      const comparison = String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase());
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);  // Reset to page 1 when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, imageFilter, hasArticleUrl, hasAnnotation, invalidUrlFilter, sortConfig]);

  // Auto-refresh stats during background image extraction
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let lastImageCount = spyData.filter(entry => entry.spyImageUrl && entry.spyImageUrl.trim()).length;
    let stableCount = 0;
    
    if (backgroundExtractionActive) {
      console.log('🔄 Background extraction active - starting auto-refresh');
      setAutoRefreshActive(true);
      intervalId = setInterval(async () => {
        console.log('📊 Auto-refreshing stats during background extraction...');
        await onRefresh();
        
        // Check if image count has stabilized (no new images for 2 intervals = 10 seconds)
        const currentImageCount = spyData.filter(entry => entry.spyImageUrl && entry.spyImageUrl.trim()).length;
        if (currentImageCount === lastImageCount) {
          stableCount++;
          if (stableCount >= 2) {
            console.log('✅ No new images extracted for 10+ seconds - assuming background extraction completed');
            onBackgroundExtractionEnd();
          }
        } else {
          stableCount = 0;
          lastImageCount = currentImageCount;
        }
      }, 5000); // Refresh every 5 seconds during background extraction
    } else {
      setAutoRefreshActive(false);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [backgroundExtractionActive, spyData, onRefresh, onBackgroundExtractionEnd]);

  const handleSelectAll = () => {
    const allFilteredIds = filteredAndSortedData.map(entry => entry.id);
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
      : filteredAndSortedData;

    if (dataToExport.length === 0) {
      alert('No data to export.');
      return;
    }

    const csvContent = [
      'Title,Description,Image URL,Article URL,Author,Status,Category,Keywords',
      ...dataToExport.map((entry: PinterestSpyData) => 
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
      {/* Performance CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .fast-table img {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
            will-change: opacity;
          }
          .fast-table tbody tr {
            contain: layout style paint;
            will-change: transform;
          }
        `
      }} />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Entries</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {stats.byStatus['SEO_COMPLETED'] || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">SEO Processed</div>
        </div>
        <div className={`bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-gray-200 dark:border-gray-700 ${autoRefreshActive ? 'ring-2 ring-emerald-300 dark:ring-emerald-700 ring-opacity-50' : ''}`}>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {spyData.filter(entry => entry.spyImageUrl && entry.spyImageUrl.trim()).length}
            {autoRefreshActive && <span className="text-sm ml-1 animate-pulse">🔄</span>}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Images Extracted
            {autoRefreshActive && <span className="text-emerald-600 dark:text-emerald-400 ml-1">(live)</span>}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            {spyData.filter(entry => entry.spyArticleUrl && !entry.spyImageUrl).length} pending
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xl font-bold text-slate-700 dark:text-slate-300">
            {stats.byStatus['COMPLETED'] || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Recipes Generated</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search and Dropdowns */}
          <input
            type="text"
            placeholder="Search title, description, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px] px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-slate-500 dark:focus:border-slate-400"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-slate-500 dark:focus:border-slate-400"
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
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-slate-500 dark:focus:border-slate-400"
          >
            <option value="all">All Images</option>
            <option value="with-image">With Image</option>
            <option value="no-image">No Image</option>
          </select>

          <select
            value={hasArticleUrl}
            onChange={(e) => setHasArticleUrl(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-slate-500 dark:focus:border-slate-400"
          >
            <option value="all">All Articles</option>
            <option value="with-url">Has Article URL</option>
            <option value="no-url">No Article URL</option>
          </select>

          <select
            value={hasAnnotation}
            onChange={(e) => setHasAnnotation(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-slate-500 dark:focus:border-slate-400"
          >
            <option value="all">All Annotations</option>
            <option value="with-annotation">Has Annotation</option>
            <option value="no-annotation">No Annotation</option>
          </select>

          <select
            value={invalidUrlFilter}
            onChange={(e) => setInvalidUrlFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-slate-500 dark:focus:border-slate-400"
          >
            <option value="all">All URLs</option>
            <option value="invalid-urls">🚨 Invalid URLs</option>
            <option value="valid-urls">✅ Valid URLs</option>
          </select>

          <div className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700">
            Showing {filteredAndSortedData.length} of {stats.total} entries
            {sortConfig.key && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                • Sorted by {sortConfig.key} {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <button
            onClick={async () => {
              setRefreshing(true);
              try {
                // Clear all filters
                setSearchTerm('');
                setStatusFilter('all');
                setImageFilter('all');
                setHasArticleUrl('all');
                setHasAnnotation('all');
                setInvalidUrlFilter('all');
                setCurrentPage(1);
                setSortConfig({ key: 'id', direction: 'asc' }); // Reset to consistent default
                
                // Refresh data
                await onRefresh();
              } finally {
                setRefreshing(false);
              }
            }}
            disabled={refreshing}
            className="px-3 py-1.5 text-sm bg-slate-600 dark:bg-slate-700 text-white rounded hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh & Clear Filters'}
          </button>

          <button
            onClick={onBulkImport}
            className="px-3 py-1.5 text-sm bg-slate-700 dark:bg-slate-600 text-white rounded hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            📋 Bulk Import
          </button>

          <button
            onClick={handleExportData}
            disabled={filteredAndSortedData.length === 0}
            className="px-3 py-1.5 text-sm bg-gray-700 dark:bg-gray-600 text-white rounded hover:bg-gray-800 dark:hover:bg-gray-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            📥 Export {selectedEntries.length > 0 ? `(${selectedEntries.length})` : `(${filteredAndSortedData.length})`}
          </button>

          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            {filteredAndSortedData.length > 0 && filteredAndSortedData.every(entry => selectedEntries.includes(entry.id))
              ? `Deselect All (${stats.total})`
              : `Select All (${stats.total})`}
          </button>

          {selectedEntries.length > 0 && (
            <>
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 text-sm bg-red-600 dark:bg-red-700 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                🗑️ Delete ({selectedEntries.length})
              </button>
              <button
                onClick={async () => {
                  // Get selected data in the same order as displayed in the table
                  const selectedData = filteredAndSortedData.filter(entry => 
                    selectedEntries.includes(entry.id) && entry.spyArticleUrl && !entry.spyImageUrl
                  );
                  
                  if (selectedData.length === 0) {
                    alert('No selected entries need image extraction (they must have article URLs and no existing image).');
                    return;
                  }

                  if (!confirm(`Auto-extract images for ${selectedData.length} selected entries in table order?`)) {
                    return;
                  }

                  // Log the extraction order for tracking
                  console.log(`🔍 Manual extraction order (current table display order):`, 
                    selectedData.map((e, i) => `${i + 1}. ${e.spyTitle} (ID: ${e.id})`).join(', '));

                  // Notify parent that extraction is starting
                  onBackgroundExtractionStart();
                  
                  let successCount = 0;
                  let currentIndex = 0;
                  
                  try {
                    for (const entry of selectedData) {
                      currentIndex++;
                      console.log(`🖼️ [MANUAL] Extracting image ${currentIndex}/${selectedData.length}: ${entry.spyTitle}`);
                      
                      const success = await onAutoImageExtraction(entry);
                      if (success) successCount++;
                      
                      // Small delay between extractions
                      await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                    
                    alert(`Successfully extracted images for ${successCount} out of ${selectedData.length} entries.`);
                  } finally {
                    // Notify parent that extraction has ended
                    onBackgroundExtractionEnd();
                    await onRefresh();
                  }
                }}
                className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
              >
                🖼️ Auto Extract Images ({selectedEntries.length})
              </button>
              <button
                onClick={() => onSelectionChange([])}
                className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Clear Selection
              </button>
            </>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto" 
             style={{ 
               willChange: 'scroll-position',
               contain: 'layout style paint',
               transform: 'translateZ(0)' // Hardware acceleration
             }}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 fast-table"
                 style={{ 
                   tableLayout: 'fixed',
                   backfaceVisibility: 'hidden'
                 }}>
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && paginatedData.every(entry => selectedEntries.includes(entry.id))}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 dark:border-gray-600 text-slate-600 dark:text-slate-400 focus:ring-slate-500 dark:focus:ring-slate-400"
                  />
                </th>
                <th 
                  className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('spyTitle')}
                >
                  SPY Title <SortIndicator column="spyTitle" />
                </th>
                <th 
                  className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('spyDescription')}
                >
                  SPY Description <SortIndicator column="spyDescription" />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">SPY Image URL</th>
                <th 
                  className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('spyArticleUrl')}
                >
                  SPY Article URL <SortIndicator column="spyArticleUrl" />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">SPY PIN Image</th>
                <th 
                  className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('annotation')}
                >
                  Annotation <SortIndicator column="annotation" />
                </th>
                <th 
                  className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('spyStatus')}
                >
                  Status <SortIndicator column="spyStatus" />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedData.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEntries.includes(entry.id)}
                      onChange={() => handleSelectEntry(entry.id)}
                      className="rounded border-gray-300 dark:border-gray-600 text-slate-600 dark:text-slate-400 focus:ring-slate-500 dark:focus:ring-slate-400"
                    />
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                      {entry.spyTitle || 'No title'}
                    </div>
                  </td>
                  <td className="px-3 py-2 max-w-sm">
                    <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {entry.spyDescription || 'No description'}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {entry.spyImageUrl ? (
                      hasInvalidUrls(entry).hasInvalidImage ? (
                        <div className="w-12 h-12 bg-red-100 border-2 border-red-300 rounded flex items-center justify-center text-xs text-red-600 cursor-not-allowed" title={`Invalid image URL: ${entry.spyImageUrl}`}>
                          ⚠️
                        </div>
                      ) : (
                        <FastThumbnail
                          src={entry.spyImageUrl}
                          alt=""
                          title={entry.spyTitle || 'Image'}
                          onClick={() => setSelectedImage({url: entry.spyImageUrl!, title: entry.spyTitle || 'Image', entryId: entry.id})}
                        />
                      )
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">-</div>
                    )}
                  </td>
                  <td className="px-3 py-2 max-w-[150px]">
                    {entry.spyArticleUrl ? (
                      hasInvalidUrls(entry).hasInvalidArticle ? (
                        <span className="text-xs text-red-600 truncate block cursor-not-allowed" title="Invalid URL - cannot open">
                          {entry.spyArticleUrl} ⚠️
                        </span>
                      ) : (
                        <a href={entry.spyArticleUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 truncate block">
                          {entry.spyArticleUrl}
                        </a>
                      )
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
        {filteredAndSortedData.length > 0 && (
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length}
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