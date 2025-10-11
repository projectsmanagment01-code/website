/**
 * Author Management Component
 * 
 * Main author management interface for admin dashboard
 * Integrates AuthorList, AuthorForm, and AuthorCard components
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, FileText, Calendar, AlertCircle, X, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import AuthorList from './AuthorList';
import AuthorForm from './AuthorForm';
import { AuthorEntity } from '@/outils/types';

interface AuthorStats {
  totalAuthors: number;
  authorsWithRecipes: number;
  authorsWithoutRecipes: number;
  averageRecipesPerAuthor: number;
}

const AuthorManagement: React.FC = () => {
  const [authors, setAuthors] = useState<(AuthorEntity & { recipeCount: number })[]>([]);
  const [stats, setStats] = useState<AuthorStats>({
    totalAuthors: 0,
    authorsWithRecipes: 0,
    authorsWithoutRecipes: 0,
    averageRecipesPerAuthor: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<AuthorEntity | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showIdList, setShowIdList] = useState(false);

  // Load authors and stats
  const loadAuthors = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const url = new URL('/api/admin/authors', window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', '20');
      if (search) {
        url.searchParams.set('search', search);
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load authors');
      }

      const data = await response.json();
      setAuthors(data.authors || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  // Load author statistics
  const loadStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!token) return;

      const response = await fetch('/api/admin/authors/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Handle author creation
  const handleCreateAuthor = async (authorData: any) => {
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch('/api/admin/authors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create author');
      }

      setShowCreateForm(false);
      await loadAuthors(currentPage, searchQuery);
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create author');
    }
  };

  // Handle author update
  const handleUpdateAuthor = async (id: string, authorData: any) => {
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`/api/admin/authors/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update author');
      }

      setEditingAuthor(null);
      await loadAuthors(currentPage, searchQuery);
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update author');
    }
  };

  // Handle author deletion
  const handleDeleteAuthor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this author? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`/api/admin/authors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete author');
      }

      await loadAuthors(currentPage, searchQuery);
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete author');
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    loadAuthors(1, query);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadAuthors(page, searchQuery);
  };

  // Copy author IDs to clipboard
  const copyIdsToClipboard = () => {
    const ids = authors.map(author => author.id).join('\n');
    navigator.clipboard.writeText(ids);
  };

  // Initial load
  useEffect(() => {
    loadAuthors();
    loadStats();
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading && authors.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authors</h1>
          <p className="text-gray-600">Manage recipe authors and contributors</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading authors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Authors</h1>
        <p className="text-gray-600">Manage recipe authors and contributors</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Authors</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalAuthors}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">With Recipes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.authorsWithRecipes}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Without Recipes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.authorsWithoutRecipes}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Recipes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageRecipesPerAuthor}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Author IDs List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Author IDs</h3>
              <p className="text-sm text-gray-500">List of all author identifiers ({authors.length} total)</p>
            </div>
            <div className="flex items-center gap-2">
              {showIdList && authors.length > 0 && (
                <button
                  onClick={copyIdsToClipboard}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center gap-1"
                  title="Copy all IDs to clipboard"
                >
                  <Copy className="w-4 h-4" />
                  Copy All
                </button>
              )}
              <button
                onClick={() => setShowIdList(!showIdList)}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors flex items-center gap-1"
              >
                {showIdList ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide IDs
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show IDs
                  </>
                )}
              </button>
            </div>
          </div>

          {showIdList && (
            <div className="border-t border-gray-200 pt-4">
              {authors.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No authors found</p>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {authors.map((author) => (
                      <div
                        key={author.id}
                        className="bg-white rounded-lg px-4 py-3 text-sm font-mono text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer group shadow-sm"
                        onClick={() => navigator.clipboard.writeText(author.id)}
                        title={`Click to copy: ${author.id}\nAuthor: ${author.name}`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Author Image */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                            {(author.img || author.avatar) ? (
                              <img
                                src={author.img || author.avatar}
                                alt={author.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {author.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          
                          {/* Author Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="truncate text-xs text-gray-600 font-mono">{author.id}</span>
                              <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
                            </div>
                            <div className="text-sm font-medium text-gray-900 truncate mt-1">{author.name}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search authors..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Add Author Button */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            showCreateForm 
              ? 'bg-gray-600 hover:bg-gray-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {showCreateForm ? (
            <>
              <X className="w-5 h-5" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add Author
            </>
          )}
        </button>
      </div>

      {/* Author Form - Integrated into dashboard */}
      {(showCreateForm || editingAuthor) && (
        <div className="mb-8">
          <div className="max-w-5xl mx-auto">
            <AuthorForm
              author={editingAuthor || undefined}
              onSave={editingAuthor ? 
                (author) => handleUpdateAuthor(editingAuthor.id, author) :
                handleCreateAuthor
              }
              onCancel={() => {
                setShowCreateForm(false);
                setEditingAuthor(null);
              }}
              className="shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Authors List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <AuthorList
          onCreateAuthor={() => setShowCreateForm(true)}
          onEditAuthor={(author) => {
            setEditingAuthor(author);
            setShowCreateForm(false); // Hide create form when editing
          }}
        />
      </div>
    </div>
  );
};

export default AuthorManagement;