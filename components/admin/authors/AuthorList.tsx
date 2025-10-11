'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { AuthorEntity } from '@/outils/types';

interface AuthorWithCount extends AuthorEntity {
  recipeCount: number;
}

interface AuthorListProps {
  className?: string;
  onCreateAuthor?: () => void;
  onEditAuthor?: (author: AuthorWithCount) => void;
  onViewAuthor?: (author: AuthorWithCount) => void;
}

export default function AuthorList({ 
  className = '',
  onCreateAuthor,
  onEditAuthor,
  onViewAuthor
}: AuthorListProps) {
  const [authors, setAuthors] = useState<AuthorWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch authors from API
  const fetchAuthors = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No admin token found');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/admin/authors?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setAuthors(data.authors || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);

    } catch (err) {
      console.error('❌ Error fetching authors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  // Delete author
  const handleDeleteAuthor = async (authorId: string, authorName: string) => {
    if (!confirm(`Are you sure you want to delete "${authorName}"? This will remove the author from all associated recipes.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No admin token found');
      }

      const response = await fetch(`/api/admin/authors/${authorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete author');
      }

      // Refresh the list
      await fetchAuthors(currentPage, searchQuery);
      
      alert(`Author "${authorName}" deleted successfully`);
    } catch (err) {
      console.error('❌ Error deleting author:', err);
      alert(`Error deleting author: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchAuthors(1, query);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAuthors(page, searchQuery);
  };

  // Load authors on mount
  useEffect(() => {
    fetchAuthors();
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Authors</h2>
              <p className="text-sm text-gray-600">
                Manage recipe authors ({total} total)
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search authors by name or bio..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading authors...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        ) : authors.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No authors found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first author'}
            </p>
            {onCreateAuthor && !searchQuery && (
              <button
                onClick={onCreateAuthor}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First Author
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Authors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {authors.map((author) => (
                <div
                  key={author.id}
                  className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
                >
                  {/* Author Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-md">
                        {author.img || author.avatar ? (
                          <img
                            src={author.img || author.avatar || ''}
                            alt={author.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <User className={`w-7 h-7 text-gray-500 ${(author.img || author.avatar) ? 'hidden' : ''}`} />
                      </div>
                      {/* Online Status Indicator */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                        {author.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        @{author.slug}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          <BookOpen className="w-3 h-3" />
                          {author.recipeCount} {author.recipeCount === 1 ? 'recipe' : 'recipes'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {author.bio && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                        {author.bio}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      Joined {new Date(author.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    {author.link && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Eye className="w-3 h-3" />
                        <a href={author.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          View Profile
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {onViewAuthor && (
                      <button
                        onClick={() => onViewAuthor(author)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
                        title="View author details"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    )}
                    {onEditAuthor && (
                      <button
                        onClick={() => onEditAuthor(author)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:scale-105"
                        title="Edit author information"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAuthor(author.id, author.name)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Delete author"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} authors
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 text-sm rounded transition-colors ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}