'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/admin-fetch';
import { CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

interface Author {
  id: string;
  name: string;
  slug: string;
  avatar?: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  defaultAuthorId?: string | null;
}

interface SystemSettings {
  globalFallbackAuthorId?: string | null;
  autoAssignAuthors: boolean;
  autoReassignOnDelete: boolean;
}

export default function AuthorFallbackSettings() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    autoAssignAuthors: true,
    autoReassignOnDelete: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [authorsRes, categoriesRes, settingsRes] = await Promise.all([
        adminFetch('/api/admin/authors'),
        adminFetch('/api/admin/categories'),
        adminFetch('/api/admin/author-fallback-settings')
      ]);

      setAuthors(authorsRes.authors || []);
      setCategories(categoriesRes.categories || []);
      setSettings(settingsRes.settings || {
        autoAssignAuthors: true,
        autoReassignOnDelete: true
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGlobalSettings = async () => {
    try {
      setSaving(true);
      await adminFetch('/api/admin/author-fallback-settings', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
      setMessage({ type: 'success', text: 'Global settings saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCategoryDefault = async (categoryId: string, authorId: string | null) => {
    try {
      await adminFetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        body: JSON.stringify({ defaultAuthorId: authorId })
      });
      
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId ? { ...cat, defaultAuthorId: authorId } : cat
        )
      );
      
      setMessage({ type: 'success', text: 'Category default author updated' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update category:', error);
      setMessage({ type: 'error', text: 'Failed to update category' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Author Fallback Settings</h1>
        
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">How Author Fallback Works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Recipe uses its assigned author (if set)</li>
              <li>Falls back to category's default author (if set)</li>
              <li>Falls back to global fallback author (if set)</li>
              <li>Auto-assigns based on category specialization</li>
            </ol>
          </div>
        </div>

        {/* Global Settings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Global Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Global Fallback Author
              </label>
              <select
                value={settings.globalFallbackAuthorId || ''}
                onChange={(e) => setSettings({ ...settings, globalFallbackAuthorId: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No global fallback (use specialization)</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                This author will be used as last resort for all orphaned recipes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoAssign"
                checked={settings.autoAssignAuthors}
                onChange={(e) => setSettings({ ...settings, autoAssignAuthors: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="autoAssign" className="text-sm font-medium text-gray-700">
                Auto-assign authors to new recipes based on category
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoReassign"
                checked={settings.autoReassignOnDelete}
                onChange={(e) => setSettings({ ...settings, autoReassignOnDelete: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="autoReassign" className="text-sm font-medium text-gray-700">
                Auto-reassign recipes when author is deleted
              </label>
            </div>

            <button
              onClick={handleSaveGlobalSettings}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Global Settings
            </button>
          </div>
        </div>

        {/* Category Defaults */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Default Authors</h2>
          <p className="text-sm text-gray-600 mb-4">
            Set a default author for each category. Recipes in this category without an author will use this default.
          </p>
          
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <span className="ml-2 text-sm text-gray-500">({category.slug})</span>
                </div>
                <select
                  value={category.defaultAuthorId || ''}
                  onChange={(e) => handleUpdateCategoryDefault(category.id, e.target.value || null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No default (use global)</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
