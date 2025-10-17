import React, { useState, useEffect, useRef } from 'react';
import { useMediaGallery } from '@/lib/hooks/useMediaGallery';
import { Eye, Trash2, Copy, Download, Link as LinkIcon, FileImage, Calendar, User } from 'lucide-react';
import { MediaBulkOperations } from './MediaBulkOperations';
import { MediaViewSwitcher, ViewMode } from './MediaViewSwitcher';
import { refreshAfterChange } from '@/lib/revalidation-utils';

interface EnhancedImageGalleryProps {
  category: string;
  refreshTrigger: number;
  onImageSelect?: (imageUrl: string) => void;
  allowSelection?: boolean;
}

interface FileInfo {
  name: string;
  url: string;
  size: number;
  lastModified: Date;
  type: string;
}

const ITEMS_PER_PAGE = 12;

export const EnhancedImageGallery: React.FC<EnhancedImageGalleryProps> = ({
  category,
  refreshTrigger,
  onImageSelect,
  allowSelection = false
}) => {
  const { files, loading, deleteFile, refreshFiles } = useMediaGallery();
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const prevRefreshTrigger = useRef(0);
  const refreshFilesRef = useRef(refreshFiles);

  // Update ref when refreshFiles changes
  useEffect(() => {
    refreshFilesRef.current = refreshFiles;
  }, [refreshFiles]);

  // Filter files by category
  const filteredFiles = files.filter((file: string) => {
    if (category === 'all') return true;
    return file.includes(`/${category}/`);
  });

  // Pagination
  const totalFiles = filteredFiles.length;
  const totalPages = Math.ceil(totalFiles / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentFiles = filteredFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedFiles([]);
  }, [category]);

  // Refresh files when trigger changes (only when it actually increases)
  useEffect(() => {
    if (refreshTrigger > prevRefreshTrigger.current) {
      prevRefreshTrigger.current = refreshTrigger;
      refreshFilesRef.current();
    }
  }, [refreshTrigger]); // Remove refreshFiles dependency

  // Selection handlers
  const handleSelectFile = (fileName: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileName) 
        ? prev.filter(f => f !== fileName)
        : [...prev, fileName]
    );
  };

  const handleSelectCurrentPage = () => {
    const currentFileNames = currentFiles;
    const allCurrentSelected = currentFileNames.every((file: string) => selectedFiles.includes(file));
    
    if (allCurrentSelected) {
      // Deselect all current page files
      setSelectedFiles(prev => prev.filter(file => !currentFileNames.includes(file)));
    } else {
      // Select all current page files
      setSelectedFiles(prev => {
        const newSelection = [...prev];
        currentFileNames.forEach((file: string) => {
          if (!newSelection.includes(file)) {
            newSelection.push(file);
          }
        });
        return newSelection;
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === totalFiles && totalFiles > 0) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...filteredFiles]);
    }
  };

  const handleClearSelection = () => {
    setSelectedFiles([]);
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      // Use bulk delete endpoint
      const response = await fetch('/api/upload/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fileNames: selectedFiles })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete files');
      }

      setSelectedFiles([]);
      
      // Force refresh the file list from server
      await refreshFilesRef.current();
      
      // Revalidate pages after bulk delete
      await refreshAfterChange(['recipes', 'home']);
      
      alert(result.message || `Successfully deleted ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}.`);
      
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Error deleting files. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsDownloading(true);
    try {
      // For now, download each file individually
      // In production, you might want to create a ZIP file
      for (const fileName of selectedFiles) {
        const link = document.createElement('a');
        link.href = `/uploads/${fileName}`;
        link.download = fileName.split('/').pop() || fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Small delay to prevent browser from blocking downloads
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      alert(`Started download of ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}.`);
      
    } catch (error) {
      console.error('Bulk download error:', error);
      alert('Error downloading files. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBulkLink = () => {
    if (selectedFiles.length === 0) return;
    alert(`Link to recipes feature will be implemented for ${selectedFiles.length} selected files.`);
  };

  // Individual file operations
  const handleDeleteFile = async (fileName: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const success = await deleteFile(fileName);
        
        if (success) {
          // Remove from selected files
          setSelectedFiles(prev => prev.filter(f => f !== fileName));
          
          // Force refresh the file list from server
          await refreshFilesRef.current();
          
          // Revalidate pages after single file delete
          await refreshAfterChange(['recipes', 'home']);
        } else {
          alert('Failed to delete file. Please try again.');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting file. Please try again.');
      }
    }
  };

  const handleCopyPath = (fileName: string) => {
    const fullPath = `/uploads/${fileName}`;
    navigator.clipboard.writeText(fullPath);
    alert('File path copied to clipboard!');
  };

  const handleViewFile = (fileName: string) => {
    window.open(`/uploads/${fileName}`, '_blank');
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading media files...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with view switcher and bulk operations */}
      <div className="flex items-center justify-between">
        <MediaViewSwitcher
          currentView={viewMode}
          onViewChange={setViewMode}
          itemCount={totalFiles}
        />
        
        {/* Page selection for current page */}
        {totalFiles > 0 && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={currentFiles.length > 0 && currentFiles.every((file: string) => selectedFiles.includes(file))}
                onChange={handleSelectCurrentPage}
                className="rounded border-gray-300"
              />
              Select page ({currentFiles.length} files)
            </label>
            
            {selectedFiles.length < totalFiles && (
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Select All Files ({totalFiles})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk Operations Bar */}
      <MediaBulkOperations
        selectedFiles={selectedFiles}
        totalFiles={totalFiles}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkDownload={handleBulkDownload}
        onBulkLink={handleBulkLink}
        isDeleting={isDeleting}
        isDownloading={isDownloading}
      />

      {/* Files Display */}
      {currentFiles.length === 0 ? (
        <div className="text-center py-12">
          <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No files found in this category.</p>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {currentFiles.map((fileName: string) => (
                <div
                  key={fileName}
                  className={`group relative bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
                    selectedFiles.includes(fileName) ? 'ring-2 ring-blue-500 border-blue-500' : ''
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(fileName)}
                      onChange={() => handleSelectFile(fileName)}
                      className="rounded border-gray-300 shadow-md"
                    />
                  </div>

                  {/* Image */}
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={`/uploads/${fileName}?w=400&q=50`}
                      alt={fileName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewFile(fileName)}
                          className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopyPath(fileName)}
                          className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Copy Path"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(fileName)}
                          className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="p-3">
                    <p className="text-xs font-medium text-gray-800 truncate" title={fileName}>
                      {fileName.split('/').pop()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {currentFiles.map((fileName: string) => (
                  <div
                    key={fileName}
                    className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${
                      selectedFiles.includes(fileName) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    {/* Selection */}
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(fileName)}
                      onChange={() => handleSelectFile(fileName)}
                      className="mr-4 rounded border-gray-300"
                    />

                    {/* Thumbnail */}
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 mr-4">
                      <img
                        src={`/uploads/${fileName}?w=100&q=50`}
                        alt={fileName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileName.split('/').pop()}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {fileName}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleViewFile(fileName)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyPath(fileName)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy Path"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(fileName)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, totalFiles)} of {totalFiles} files
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};