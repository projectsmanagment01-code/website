import React from 'react';
import { Grid3X3, List, LayoutGrid, LayoutList } from 'lucide-react';

export type ViewMode = 'grid' | 'list';

interface MediaViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  itemCount: number;
  className?: string;
}

export const MediaViewSwitcher: React.FC<MediaViewSwitcherProps> = ({
  currentView,
  onViewChange,
  itemCount,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm text-gray-600">
        {itemCount} file{itemCount !== 1 ? 's' : ''}
      </span>
      
      <div className="flex items-center border rounded-lg overflow-hidden">
        <button
          onClick={() => onViewChange('grid')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
            currentView === 'grid'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
          title="Grid View"
        >
          <LayoutGrid className="w-4 h-4" />
          Grid
        </button>
        
        <button
          onClick={() => onViewChange('list')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors border-l ${
            currentView === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
          title="List View"
        >
          <LayoutList className="w-4 h-4" />
          List
        </button>
      </div>
    </div>
  );
};