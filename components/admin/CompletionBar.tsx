import React from 'react';

interface CompletionBarProps {
  percentage: number;
  showLabel?: boolean;
  className?: string;
}

export const CompletionBar: React.FC<CompletionBarProps> = ({ 
  percentage, 
  showLabel = true, 
  className = '' 
}) => {
  const getBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-blue-600'; // Excellent - Blue
    if (percentage >= 70) return 'bg-[#303740]'; // Good - Dark Blue-Gray
    if (percentage >= 50) return 'bg-orange-600'; // Needs Work - Orange
    return 'bg-red-600'; // Poor - Red
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getBarColor(percentage)}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {showLabel && (
          <span className="text-xs text-gray-600 font-medium min-w-[35px]">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
};