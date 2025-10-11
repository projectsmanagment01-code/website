import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SEOScoreIndicatorProps {
  score: number;
  showIcon?: boolean;
  className?: string;
}

export const SEOScoreIndicator: React.FC<SEOScoreIndicatorProps> = ({ 
  score, 
  showIcon = true, 
  className = '' 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-blue-700'; // Excellent - Blue
    if (score >= 70) return 'text-[#303740]'; // Good - Dark Blue-Gray
    if (score >= 50) return 'text-orange-700'; // Needs Work - Orange
    return 'text-red-700'; // Poor - Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Work';
    return 'Poor';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-3 h-3" />;
    if (score >= 70) return <TrendingUp className="w-3 h-3" />;
    if (score >= 50) return <AlertTriangle className="w-3 h-3" />;
    return <XCircle className="w-3 h-3" />;
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {showIcon && (
        <span className={getScoreColor(score)}>
          {getScoreIcon(score)}
        </span>
      )}
      <span className={`text-xs font-medium ${getScoreColor(score)}`}>
        {score}/100
      </span>
      <span className="text-xs text-gray-600 ml-1">
        ({getScoreLabel(score)})
      </span>
    </div>
  );
};