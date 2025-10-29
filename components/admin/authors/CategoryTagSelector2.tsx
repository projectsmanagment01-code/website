'use client';

import { useEffect, useState } from 'react';
import { X, Tag } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';

interface CategoryTagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export default function CategoryTagSelector({ selectedTags, onChange }: CategoryTagSelectorProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('🔍 Fetching categories from API...');
    
    adminFetch('/api/categories')
      .then(response => {
        console.log('📡 API Response Status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('📦 Raw API Data:', data);
        
        // Extract categories from API response
        const categoryList = data.value || data.categories || [];
        console.log('✅ Extracted Categories:', categoryList);
        
        setCategories(categoryList);
        setLoading(false);
      })
      .catch(error => {
        console.error('❌ Error fetching categories:', error);
        setLoading(false);
      });
  }, []);

  // Filter available categories
  const availableCategories = categories.filter(cat => {
    if (!cat || !cat.title) return false;
    
    const matchesSearch = searchQuery === '' || 
      cat.title.toLowerCase().includes(searchQuery.toLowerCase());
    const notSelected = !selectedTags.includes(cat.title);
    
    return matchesSearch && notSelected;
  });

  console.log('🎯 Available categories for dropdown:', availableCategories);

  const handleAddTag = (categoryTitle: string) => {
    console.log('➕ Adding tag:', categoryTitle);
    onChange([...selectedTags, categoryTitle]);
    setSearchQuery('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    console.log('➖ Removing tag:', tagToRemove);
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Categories (Specialties) {loading ? '- Loading...' : `- ${categories.length} available`}
      </label>
      
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              <Tag className="w-3.5 h-3.5" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input with Dropdown */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={loading ? "Loading categories..." : "Click to see categories"}
          disabled={loading}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Dropdown Menu */}
        {showDropdown && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {availableCategories.length > 0 ? (
              availableCategories.map((cat) => (
                <button
                  key={cat.id || cat.slug || cat.title}
                  type="button"
                  onClick={() => handleAddTag(cat.title)}
                  className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center justify-between group"
                >
                  <span className="font-medium text-gray-900">{cat.title}</span>
                  <span className="text-xs text-gray-500 group-hover:text-blue-600">
                    {cat.recipeCount || 0} recipes
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                {categories.length === 0 
                  ? "No categories available. Create categories first."
                  : searchQuery 
                    ? `No categories found matching "${searchQuery}"`
                    : "All categories already selected"
                }
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Click the input to see all categories. Type to search and filter.
      </p>
    </div>
  );
}