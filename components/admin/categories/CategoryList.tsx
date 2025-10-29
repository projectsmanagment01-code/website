/**
 * Category List Component
 * 
 * Displays paginated list of categories with actions
 */

"use client";

import React, { useState } from 'react';
import { Edit2, Trash2, ChevronLeft, ChevronRight, Tag, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { CategoryEntity } from '@/lib/category-service';
import { adminFetch } from '@/lib/admin-fetch';

interface CategoryListProps {
  categories: (CategoryEntity & { recipeCount: number; authorCount: number })[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (category: CategoryEntity) => void;
  onDelete: (categoryId: string) => void;
  onRefresh: () => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onRefresh
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Handle category deletion
  const handleDelete = async (categoryId: string) => {
    try {
      setDeletingId(categoryId);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await adminFetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      onDelete(categoryId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    const colors = {
      CUISINE: 'bg-blue-100 text-blue-800',
      DIET: 'bg-green-100 text-green-800',
      MEAL_TYPE: 'bg-purple-100 text-purple-800',
      COOKING_METHOD: 'bg-orange-100 text-orange-800',
      DIFFICULTY: 'bg-red-100 text-red-800',
      SEASON: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Format type display name
  const formatTypeName = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Categories</h2>
          <span className="text-sm text-gray-500">
            {categories.length} categories
          </span>
        </div>
      </div>

      {/* Category List */}
      <div className="divide-y divide-gray-200">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500">Get started by creating your first category.</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {category.name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(category.type)}`}>
                      {formatTypeName(category.type)}
                    </span>
                  </div>
                  
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      {category.recipeCount} recipes
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {category.authorCount} authors
                    </span>
                    <span>Slug: {category.slug}</span>
                    <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {/* View Link */}
                  <a
                    href={`/categories/${category.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  {/* Edit Button */}
                  <button
                    onClick={() => onEdit(category)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  {/* Delete Button */}
                  {deleteConfirm === category.id ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={deletingId === category.id}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {deletingId === category.id ? (
                          <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(category.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:ring-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;