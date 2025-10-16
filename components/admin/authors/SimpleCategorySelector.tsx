'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface CategoryTagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export default function CategoryTagSelector({ selectedTags, onChange }: CategoryTagSelectorProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    console.log('🚀 Starting to fetch categories...');
    
    // Try to fetch categories
    fetch('/api/categories')
      .then(res => {
        console.log('📡 Response status:', res.status);
        console.log('📡 Response ok:', res.ok);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('📦 Full API response:', data);
        
        // API now returns array directly, not wrapped in object
        let categoryList = [];
        
        if (Array.isArray(data)) {
          // Direct array response (new API)
          categoryList = data;
          console.log('✅ Using direct array response');
        } else if (data.value) {
          // Wrapped in value property (old API)
          categoryList = data.value;
          console.log('✅ Using data.value response');
        } else if (data.categories) {
          // Wrapped in categories property
          categoryList = data.categories;
          console.log('✅ Using data.categories response');
        }
        
        // Extract category names
        const categoryNames = categoryList.map((cat: any) => {
          console.log('🏷️ Processing category:', cat);
          return cat.title || cat.name;
        });
        
        console.log('✅ Final category names:', categoryNames);
        setCategories(categoryNames);
      })
      .catch(err => {
        console.error('❌ Error fetching categories:', err);
        
        // Try alternative approach - direct fetch to port 3002
        console.log('🔄 Trying alternative URL...');
        fetch('http://localhost:3002/api/categories')
          .then(res => res.json())
          .then(data => {
            console.log('🆘 Alternative fetch result:', data);
            const categoryNames = (data.value || []).map((cat: any) => cat.title);
            setCategories(categoryNames);
          })
          .catch(err2 => console.error('❌ Alternative fetch also failed:', err2));
      });
  }, []);

  const handleAddCategory = () => {
    if (selectedCategory && !selectedTags.includes(selectedCategory)) {
      onChange([...selectedTags, selectedCategory]);
      setSelectedCategory('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Categories (Specialties)
      </label>

      {/* Selected Categories Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="p-0.5 hover:bg-blue-200 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Simple Dropdown + Add Button */}
      <div className="flex gap-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a category...</option>
          {categories
            .filter(cat => !selectedTags.includes(cat))
            .map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
        </select>
        
        <button
          type="button"
          onClick={handleAddCategory}
          disabled={!selectedCategory}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Available categories: {categories.length > 0 ? categories.join(', ') : 'No categories loaded'}
      </p>
      
      {/* Manual Test Button */}
      <button
        type="button"
        onClick={() => {
          console.log('🔄 Manual fetch triggered...');
          fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
              console.log('🔄 Manual fetch result:', data);
              const categories = Array.isArray(data) ? data : (data.value || data.categories || []);
              const categoryNames = categories.map((c: any) => c.title || c.name);
              alert(`Got ${categories.length} categories: ${categoryNames.join(', ')}`);
            })
            .catch(err => {
              console.error('🔄 Manual fetch error:', err);
              alert('Manual fetch failed: ' + err.message);
            });
        }}
        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        🔄 Test Fetch Categories
      </button>
    </div>
  );
}