import React from 'react';
import { Trash2, Edit, Eye, EyeOff, Check, X } from 'lucide-react';

interface BulkOperationsProps {
  selectedRecipes: string[];
  totalRecipes: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: 'published' | 'draft') => void;
  isDeleting: boolean;
  isUpdatingStatus: boolean;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedRecipes,
  totalRecipes,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkStatusChange,
  isDeleting,
  isUpdatingStatus
}) => {
  const selectedCount = selectedRecipes.length;
  const isAllSelected = selectedCount === totalRecipes && totalRecipes > 0;

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
              {selectedCount} recipe{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={isAllSelected ? onClearSelection : onSelectAll}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
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
          {/* Status Change Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBulkStatusChange('published')}
              disabled={isUpdatingStatus}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded transition-colors"
            >
              <Eye className="w-3 h-3" />
              {isUpdatingStatus ? 'Publishing...' : 'Publish'}
            </button>
            <button
              onClick={() => onBulkStatusChange('draft')}
              disabled={isUpdatingStatus}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 rounded transition-colors"
            >
              <EyeOff className="w-3 h-3" />
              {isUpdatingStatus ? 'Drafting...' : 'Draft'}
            </button>
          </div>

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
      {(isDeleting || isUpdatingStatus) && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {isDeleting ? 'Deleting recipes...' : 'Updating status...'}
          </p>
        </div>
      )}
    </div>
  );
};