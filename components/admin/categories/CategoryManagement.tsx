/**
 * Category Management Component
 * 
 * Main category management interface for admin dashboard
 * Integrates CategoryList, CategoryForm, and CategoryCard components
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, FolderOpen, FileText, Calendar, AlertCircle, X, ChevronDown, ChevronUp, Copy, Tag, Users } from 'lucide-react';
import CategoryList from './CategoryList';
import CategoryForm from './CategoryForm';
import { CategoryEntity } from '@/lib/category-service';

interface CategoryStats {
  totalCategories: number;
  categoriesByType: Record<string, number>;
  categoriesWithRecipes: number;
  categoriesWithAuthors: number;
  averageRecipesPerCategory: number;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<(CategoryEntity & { recipeCount: number; authorCount: number })[]>([]);
  const [stats, setStats] = useState<CategoryStats>({
    totalCategories: 0,
    categoriesByType: {},
    categoriesWithRecipes: 0,
    categoriesWithAuthors: 0,
    averageRecipesPerCategory: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryEntity | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showIdList, setShowIdList] = useState(false);
  const [filterType, setFilterType] = useState<string>('');

  // Load categories and stats
  const loadCategories = async (page = 1, search = '', type = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      
      if (search) params.append('search', search);
      if (type) params.append('type', type);

      const response = await fetch(`/api/admin/categories?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      setCategories(data.categories || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Load category statistics
  const loadStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) return;

      const response = await fetch('/api/admin/categories/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error loading category stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    loadCategories(1, searchQuery, filterType);
    loadStats();
  }, []);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        loadCategories(1, searchQuery, filterType);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterType]);

  // Handle category creation
  const handleCategoryCreated = (newCategory: CategoryEntity) => {
    setCategories(prev => [newCategory as any, ...prev]);
    setStats(prev => ({ ...prev, totalCategories: prev.totalCategories + 1 }));
    setShowCreateForm(false);
    loadStats(); // Refresh stats
  };

  // Handle category update
  const handleCategoryUpdated = (updatedCategory: CategoryEntity) => {
    setCategories(prev => 
      prev.map(cat => cat.id === updatedCategory.id ? { ...cat, ...updatedCategory } : cat)
    );
    setEditingCategory(null);
    loadStats(); // Refresh stats
  };

  // Handle category deletion
  const handleCategoryDeleted = (deletedId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== deletedId));
    setStats(prev => ({ ...prev, totalCategories: prev.totalCategories - 1 }));
    loadStats(); // Refresh stats
  };

  // Copy category IDs to clipboard
  const copyAllIds = () => {
    const ids = categories.map(cat => cat.id).join('\\n');
    navigator.clipboard.writeText(ids);
  };

  return (
    <div className="category-management p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Management</h1>
        <p className="text-gray-600">Manage recipe categories, cuisines, dietary restrictions, and more</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FolderOpen className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">With Recipes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.categoriesWithRecipes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">With Authors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.categoriesWithAuthors}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Recipes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRecipesPerCategory}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="CUISINE">Cuisine</option>
              <option value="DIET">Diet</option>
              <option value="MEAL_TYPE">Meal Type</option>
              <option value="COOKING_METHOD">Cooking Method</option>
              <option value="DIFFICULTY">Difficulty</option>
              <option value="SEASON">Season</option>
            </select>
          </div>

          <div className="flex gap-2">
            {/* ID List Toggle */}
            <button
              onClick={() => setShowIdList(!showIdList)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-blue-500"
            >
              <Copy className="h-4 w-4 mr-2" />
              IDs
              {showIdList ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </button>

            {/* Create Category Button */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </button>
          </div>
        </div>

        {/* Category ID List */}
        {showIdList && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">Category IDs</h3>
              <button
                onClick={copyAllIds}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy All
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {categories.map(cat => `${cat.id} - ${cat.name} (${cat.type})`).join('\\n')}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingCategory) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingCategory(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <CategoryForm
              category={editingCategory}
              onSuccess={editingCategory ? handleCategoryUpdated : handleCategoryCreated}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingCategory(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Category List */}
      <CategoryList
        categories={categories}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => loadCategories(page, searchQuery, filterType)}
        onEdit={setEditingCategory}
        onDelete={handleCategoryDeleted}
        onRefresh={() => loadCategories(currentPage, searchQuery, filterType)}
      />
    </div>
  );
};

export default CategoryManagement;