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

  // Fetch categories from API
  useEffect(() => {
    console.log('Fetching categories...');
    adminFetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        console.log('Raw API response:', data);
        // API returns { value: [...], Count: 2 }
        const cats = data.value || data.categories || [];
        console.log('Extracted categories:', cats);
        setCategories(cats);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading categories:', err);
        setLoading(false);
      });
  }, []);

  // Filter categories
  const availableCategories = categories.filter(cat => {
    if (!cat || !cat.title) return false;
    const matchesSearch = searchQuery === '' || cat.title.toLowerCase().includes(searchQuery.toLowerCase());
    const notSelected = !selectedTags.includes(cat.title);
    return matchesSearch && notSelected;
  });

  console.log('Available categories to show:', availableCategories);

  const addTag = (categoryTitle: string) => {
    onChange([...selectedTags, categoryTitle]);
    setSearchQuery('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Categories (Specialties) - {loading ? 'Loading...' : `${categories.length} available`}
      </label>
      
      {/* Selected Tags */}
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
                onClick={() => removeTag(tag)}
                className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Click to see categories..."
          disabled={loading}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Dropdown - Show when focused */}
        {showDropdown && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {availableCategories.length > 0 ? (
              availableCategories.map((cat) => (
                <button
                  key={cat.id || cat.slug}
                  type="button"
                  onClick={() => addTag(cat.title)}
                  className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center justify-between"
                >
                  <span className="font-medium">{cat.title}</span>
                  <span className="text-xs text-gray-500">{cat.recipeCount || 0} recipes</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                {categories.length === 0 ? 'No categories found' : 'All categories selected'}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Click the input to see all categories. Type to search.
      </p>
    </div>
  );
}
