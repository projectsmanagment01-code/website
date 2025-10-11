import React from 'react';
import { Trash2, Download, Link, Check, X, Grid3X3, List } from 'lucide-react';

interface MediaBulkOperationsProps {
  selectedFiles: string[];
  totalFiles: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkDownload: () => void;
  onBulkLink: () => void;
  isDeleting: boolean;
  isDownloading: boolean;
}

export const MediaBulkOperations: React.FC<MediaBulkOperationsProps> = ({
  selectedFiles,
  totalFiles,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkDownload,
  onBulkLink,
  isDeleting,
  isDownloading
}) => {
  const selectedCount = selectedFiles.length;
  const isAllSelected = selectedCount === totalFiles && totalFiles > 0;

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-200 rounded-lg p-4 shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-800">
              {selectedCount} file{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={isAllSelected ? onClearSelection : onSelectAll}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {isAllSelected ? 'Deselect All' : 'Select All Files'}
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={onClearSelection}
              className="text-xs text-gray-600 hover:text-gray-800 underline"
            >
              Clear Selection
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Download Button */}
          <button
            onClick={onBulkDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded transition-colors"
          >
            <Download className="w-3 h-3" />
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>

          {/* Link to Recipes Button */}
          <button
            onClick={onBulkLink}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            <Link className="w-3 h-3" />
            Link to Recipes
          </button>

          {/* Delete Button */}
          <button
            onClick={onBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>

          {/* Close Button */}
          <button
            onClick={onClearSelection}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      {(isDeleting || isDownloading) && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {isDeleting ? 'Deleting files...' : 'Preparing download...'}
          </p>
        </div>
      )}
    </div>
  );
};