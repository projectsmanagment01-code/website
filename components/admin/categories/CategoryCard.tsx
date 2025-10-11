/**
 * Category Card Component
 * 
 * Display component for individual category information
 */

"use client";

import React from 'react';
import { Tag, ExternalLink, Calendar, Users, FileText } from 'lucide-react';
import { CategoryEntity } from '@/lib/category-service';

interface CategoryCardProps {
  category: CategoryEntity & { 
    recipeCount?: number; 
    authorCount?: number;
    parent?: CategoryEntity;
    children?: CategoryEntity[];
  };
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  className = '' 
}) => {
  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    const colors = {
      CUISINE: 'bg-blue-100 text-blue-800 border-blue-200',
      DIET: 'bg-green-100 text-green-800 border-green-200',
      MEAL_TYPE: 'bg-purple-100 text-purple-800 border-purple-200',
      COOKING_METHOD: 'bg-orange-100 text-orange-800 border-orange-200',
      DIFFICULTY: 'bg-red-100 text-red-800 border-red-200',
      SEASON: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Format type display name
  const formatTypeName = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {category.name}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeColor(category.type)}`}>
                <Tag className="h-3 w-3 mr-1" />
                {formatTypeName(category.type)}
              </span>
            </div>
            
            {category.description && (
              <p className="text-sm text-gray-600 mb-3">
                {category.description}
              </p>
            )}
            
            <div className="text-xs text-gray-500">
              Slug: <code className="bg-gray-100 px-1 py-0.5 rounded">{category.slug}</code>
            </div>
          </div>
          
          <a
            href={`/categories/${category.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="View category page"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Statistics */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {category.recipeCount ?? 0}
            </div>
            <div className="text-xs text-gray-500">Recipes</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {category.authorCount ?? 0}
            </div>
            <div className="text-xs text-gray-500">Authors</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mx-auto mb-2">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {new Date(category.createdAt).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-xs text-gray-500">Created</div>
          </div>
        </div>
      </div>

      {/* Hierarchy Information */}
      {(category.parent || (category.children && category.children.length > 0)) && (
        <div className="p-6 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Hierarchy</h4>
          
          {category.parent && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Parent Category</div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getTypeBadgeColor(category.parent.type)}`}>
                  {category.parent.name}
                </span>
              </div>
            </div>
          )}
          
          {category.children && category.children.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-1">
                Child Categories ({category.children.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {category.children.slice(0, 3).map((child) => (
                  <span 
                    key={child.id}
                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${getTypeBadgeColor(child.type)}`}
                  >
                    {child.name}
                  </span>
                ))}
                {category.children.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                    +{category.children.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEO Information */}
      {(category.seoTitle || category.seoDescription) && (
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">SEO</h4>
          
          {category.seoTitle && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">SEO Title</div>
              <div className="text-sm text-gray-700">{category.seoTitle}</div>
            </div>
          )}
          
          {category.seoDescription && (
            <div>
              <div className="text-xs text-gray-500 mb-1">SEO Description</div>
              <div className="text-sm text-gray-700 line-clamp-2">{category.seoDescription}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryCard;