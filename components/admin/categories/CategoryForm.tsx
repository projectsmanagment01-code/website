/**
 * Category Form Component
 * 
 * Form for creating and editing categories
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import { CategoryEntity } from '@/lib/category-service';

interface CategoryFormProps {
  category?: CategoryEntity | null;
  onSuccess: (category: CategoryEntity) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'CUISINE' as const,
    seoTitle: '',
    seoDescription: '',
    parentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parentCategories, setParentCategories] = useState<CategoryEntity[]>([]);

  // Initialize form with category data if editing
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        type: category.type,
        seoTitle: category.seoTitle || '',
        seoDescription: category.seoDescription || '',
        parentId: category.parentId || ''
      });
    }
  }, [category]);

  // Load parent categories for hierarchy
  useEffect(() => {
    const loadParentCategories = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;

        const response = await fetch('/api/admin/categories?limit=100', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Filter out current category to prevent circular reference
          const filteredCategories = data.categories.filter((cat: CategoryEntity) => 
            !category || cat.id !== category.id
          );
          setParentCategories(filteredCategories);
        }
      } catch (error) {
        console.error('Error loading parent categories:', error);
      }
    };

    loadParentCategories();
  }, [category]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        parentId: formData.parentId || null,
        seoTitle: formData.seoTitle || null,
        seoDescription: formData.seoDescription || null,
        description: formData.description || null
      };

      const url = category 
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories';
      
      const method = category ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${category ? 'update' : 'create'} category`);
      }

      const result = await response.json();
      onSuccess(result.category);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Italian, Vegetarian, Breakfast"
          />
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Category Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="CUISINE">Cuisine (Italian, Mexican, etc.)</option>
            <option value="DIET">Diet (Vegetarian, Vegan, etc.)</option>
            <option value="MEAL_TYPE">Meal Type (Breakfast, Dinner, etc.)</option>
            <option value="COOKING_METHOD">Cooking Method (Baking, Grilling, etc.)</option>
            <option value="DIFFICULTY">Difficulty (Easy, Intermediate, etc.)</option>
            <option value="SEASON">Season (Summer, Holiday, etc.)</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Brief description of this category..."
        />
      </div>

      {/* Parent Category */}
      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
          Parent Category (Optional)
        </label>
        <select
          id="parentId"
          name="parentId"
          value={formData.parentId}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">No parent category</option>
          {parentCategories.map((parentCat) => (
            <option key={parentCat.id} value={parentCat.id}>
              {parentCat.name} ({parentCat.type})
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Create hierarchical relationships between categories
        </p>
      </div>

      {/* SEO Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Options</h3>
        
        <div className="grid grid-cols-1 gap-6">
          {/* SEO Title */}
          <div>
            <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-2">
              SEO Title
            </label>
            <input
              type="text"
              id="seoTitle"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Custom title for search engines..."
            />
          </div>

          {/* SEO Description */}
          <div>
            <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-2">
              SEO Description
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              value={formData.seoDescription}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Meta description for search engines..."
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={loading || !formData.name.trim()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {category ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;