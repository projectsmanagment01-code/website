import React, { useState, useEffect } from "react";
import { Author } from "@/outils/types";
import { ChevronDown, User, UserPlus, X } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

interface AuthorEntity {
  id: string;
  name: string;
  bio?: string;
  img?: string;
  avatar?: string;
  slug: string;
  link?: string;
}

interface AuthorFormProps {
  img: string;
  author: Author;
  authorId?: string; // Add authorId prop to fetch data automatically
  onChange: (author: Author, authorId?: string) => void;
  errors?: Record<string, string>;
}

export const AuthorForm: React.FC<AuthorFormProps> = ({
  img,
  author,
  authorId,
  onChange,
  errors = {},
}) => {
  const [authors, setAuthors] = useState<AuthorEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>(authorId || "");

  // Load authors on component mount
  useEffect(() => {
    loadAuthors();
  }, []);

  // Auto-populate author data when authorId is provided or changed
  useEffect(() => {
    if (authorId && authors.length > 0) {
      const authorEntity = authors.find(a => a.id === authorId);
      if (authorEntity) {
        setSelectedAuthorId(authorId);
        // Auto-populate all fields
        const authorData = {
          name: authorEntity.name,
          bio: authorEntity.bio || "",
          avatar: authorEntity.img || authorEntity.avatar || "",
          link: authorEntity.link || `/authors/${authorEntity.slug}`
        };
        onChange(authorData, authorId);
      }
    }
  }, [authorId, authors]);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await adminFetch('/api/admin/authors?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAuthors(data.authors || []);
      } else {
        console.error('Failed to load authors:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to load authors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const authorId = e.target.value;
    setSelectedAuthorId(authorId);
    
    if (authorId) {
      const selectedAuthor = authors.find(a => a.id === authorId);
      if (selectedAuthor) {
        // Populate all fields with selected author data
        const authorData = {
          name: selectedAuthor.name,
          bio: selectedAuthor.bio || "",
          avatar: selectedAuthor.img || selectedAuthor.avatar || "",
          link: selectedAuthor.link || `/authors/${selectedAuthor.slug}`
        };
        
        onChange(authorData, authorId);
      }
    }
  };

  const handleClearFields = () => {
    setSelectedAuthorId("");
    onChange({
      name: "",
      bio: "",
      avatar: "",
      link: ""
    });
  };

  const handleManualChange = (field: keyof Author, value: string) => {
    onChange({
      ...author,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Simple Author Selection */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            Quick Select Author ({authors.length} available)
          </label>
          {selectedAuthorId && (
            <button
              type="button"
              onClick={handleClearFields}
              className="inline-flex items-center px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 rounded transition-colors"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedAuthorId}
              onChange={handleAuthorSelect}
              className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              disabled={loading}
            >
              <option value="">Choose an author...</option>
              {authors.map((authorEntity) => (
                <option key={authorEntity.id} value={authorEntity.id}>
                  {authorEntity.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
          
          {selectedAuthorId && (
            <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded border">
              {authorId ? "Auto-loaded" : "Selected"}
            </div>
          )}
        </div>
      </div>

      {/* Manual Author Creation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-base font-medium text-gray-900 flex items-center">
            <UserPlus className="w-4 h-4 mr-2 text-blue-600" />
            Create New Author
          </h3>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Author Name */}
          <div>
            <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              id="authorName"
              type="text"
              value={author.name || ''}
              onChange={(e) => onChange({ ...author, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Author's full name"
              disabled={!!selectedAuthorId}
            />
            {errors?.authorName && (
              <p className="text-red-500 text-sm mt-1">{errors.authorName}</p>
            )}
          </div>

          {/* Author Bio */}
          <div>
            <label htmlFor="authorBio" className="block text-sm font-medium text-gray-700 mb-1">
              Biography
            </label>
            <textarea
              id="authorBio"
              value={author.bio || ''}
              onChange={(e) => onChange({ ...author, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Brief biography..."
              disabled={!!selectedAuthorId}
            />
          </div>

          {/* Author Avatar URL */}
          <div>
            <label htmlFor="authorAvatar" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <div className="flex items-center gap-3">
              {/* Image Preview */}
              {author.avatar && (
                <img
                  src={author.avatar}
                  alt={author.name || "Author"}
                  className="w-12 h-12 rounded-full object-cover border border-gray-300"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              
              {/* URL Input */}
              <div className="flex-1">
                <input
                  id="authorAvatar"
                  type="url"
                  value={author.avatar || ''}
                  onChange={(e) => onChange({ ...author, avatar: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/avatar.jpg"
                  disabled={!!selectedAuthorId}
                />
              </div>
            </div>
          </div>

          {/* Author Link */}
          <div>
            <label htmlFor="authorLink" className="block text-sm font-medium text-gray-700 mb-1">
              Profile Link
            </label>
            <input
              id="authorLink"
              type="url"
              value={author.link || ''}
              onChange={(e) => onChange({ ...author, link: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="/authors/author-name or https://..."
              disabled={!!selectedAuthorId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
