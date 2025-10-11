import React from 'react';

interface StatusBadgeProps {
  status: 'draft' | 'published';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'published':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'draft':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'published':
        return 'Published';
      case 'draft':
        return 'Draft';
      default:
        return 'Unknown';
    }
  };

  return (
    <span 
      className={`px-2 py-1 rounded text-xs font-medium border ${getStatusStyles()} ${className}`}
    >
      {getStatusText()}
    </span>
  );
};