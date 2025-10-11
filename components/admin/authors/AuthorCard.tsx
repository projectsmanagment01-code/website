'use client';

import React from 'react';
import { 
  User, 
  BookOpen, 
  Calendar,
  ExternalLink,
  Edit3,
  Eye
} from 'lucide-react';
import { AuthorEntity } from '@/outils/types';

interface AuthorWithCount extends AuthorEntity {
  recipeCount: number;
}

interface AuthorCardProps {
  author: AuthorWithCount;
  onEdit?: (author: AuthorWithCount) => void;
  onView?: (author: AuthorWithCount) => void;
  className?: string;
  showActions?: boolean;
}

export default function AuthorCard({ 
  author, 
  onEdit,
  onView,
  className = '',
  showActions = true
}: AuthorCardProps) {
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {author.img || author.avatar ? (
            <img
              src={author.img || author.avatar || ''}
              alt={author.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
            {author.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            @{author.slug}
          </p>
          {author.link && (
            <a
              href={author.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Profile
            </a>
          )}
        </div>
      </div>

      {/* Bio */}
      {author.bio && (
        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {author.bio}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          <span className="font-medium text-gray-700">{author.recipeCount}</span>
          <span>recipe{author.recipeCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>Added {formatDate(author.createdAt)}</span>
        </div>
      </div>

      {/* Images Info */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${author.img ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          Local Image: {author.img ? 'Yes' : 'No'}
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${author.avatar ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          External Avatar: {author.avatar ? 'Yes' : 'No'}
        </div>
      </div>

      {/* Actions */}
      {showActions && (onView || onEdit) && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          {onView && (
            <button
              onClick={() => onView(author)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(author)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Author
            </button>
          )}
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute top-3 right-3">
        <div className={`w-3 h-3 rounded-full ${author.recipeCount > 0 ? 'bg-green-500' : 'bg-yellow-500'}`} 
             title={author.recipeCount > 0 ? 'Author has recipes' : 'Author has no recipes'}>
        </div>
      </div>
    </div>
  );
}