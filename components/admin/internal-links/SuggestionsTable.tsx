'use client';

import { useState, useEffect } from 'react';
import { LinkSuggestion } from './types';

interface SuggestionsTableProps {
  recipeId?: string;
  onApply?: () => void;
}

export default function SuggestionsTable({ recipeId, onApply }: SuggestionsTableProps) {
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'pending' | 'applied'>('pending');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, [recipeId, filter]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (recipeId) params.append('recipeId', recipeId);
      if (filter !== 'all') params.append('status', filter);
      
      const response = await fetch(`/api/admin/internal-links/suggestions?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selected.size === suggestions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(suggestions.map(s => s.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleApprove = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await fetch('/api/admin/internal-links/suggestions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ suggestionId: id, status: 'approved' })
        });
      }
      fetchSuggestions();
      setSelected(new Set());
    } catch (error) {
      console.error('Error approving suggestions:', error);
    }
  };

  const handleReject = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await fetch('/api/admin/internal-links/suggestions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ suggestionId: id, status: 'rejected' })
        });
      }
      fetchSuggestions();
      setSelected(new Set());
    } catch (error) {
      console.error('Error rejecting suggestions:', error);
    }
  };

  const handleApplyLinks = async () => {
    const selectedIds = Array.from(selected);
    
    if (selectedIds.length === 0) {
      alert('Please select suggestions to apply');
      return;
    }

    setApplying(true);
    try {
      const response = await fetch('/api/admin/internal-links/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionIds: selectedIds })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Applied ${data.totalLinksApplied} links to ${data.recipesUpdated} recipes`);
        fetchSuggestions();
        setSelected(new Set());
        onApply?.();
      }
    } catch (error) {
      console.error('Error applying links:', error);
      alert('Failed to apply links');
    } finally {
      setApplying(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this suggestion?')) return;
    
    try {
      await fetch(`/api/admin/internal-links/suggestions/${id}`, {
        method: 'DELETE'
      });
      fetchSuggestions();
    } catch (error) {
      console.error('Error deleting suggestion:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading suggestions...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'pending', 'applied'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded text-sm ${
                filter === status
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="text-sm text-gray-600">
          {suggestions.length} suggestions
        </div>
      </div>

      {/* Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button
            onClick={handleApplyLinks}
            disabled={applying}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
          >
            {applying ? 'Applying...' : 'Apply Selected'}
          </button>
          <button
            onClick={() => handleReject(Array.from(selected))}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === suggestions.length && suggestions.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-2 text-left text-sm font-medium">Source Recipe</th>
              <th className="p-2 text-left text-sm font-medium">Target Recipe</th>
              <th className="p-2 text-left text-sm font-medium">Anchor Text</th>
              <th className="p-2 text-left text-sm font-medium">Field</th>
              <th className="p-2 text-left text-sm font-medium">Score</th>
              <th className="p-2 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map(suggestion => (
              <tr key={suggestion.id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selected.has(suggestion.id)}
                    onChange={() => handleSelect(suggestion.id)}
                  />
                </td>
                <td className="p-2 text-sm">
                  <div className="font-medium">{suggestion.sourceRecipe.title}</div>
                  <div className="text-xs text-gray-500">{suggestion.sourceRecipe.slug}</div>
                </td>
                <td className="p-2 text-sm">
                  <div className="font-medium">{suggestion.targetRecipe.title}</div>
                  <div className="text-xs text-gray-500">{suggestion.targetRecipe.slug}</div>
                </td>
                <td className="p-2 text-sm">
                  <span className="text-orange-600 font-medium">{suggestion.anchorText}</span>
                  <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                    {suggestion.sentenceContext}
                  </div>
                </td>
                <td className="p-2 text-sm">{suggestion.fieldName}</td>
                <td className="p-2 text-sm">
                  <span className={`font-medium ${
                    suggestion.relevanceScore >= 80 ? 'text-green-600' :
                    suggestion.relevanceScore >= 60 ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {suggestion.relevanceScore}
                  </span>
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(suggestion.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {suggestions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No suggestions found. Run a scan to generate suggestions.
        </div>
      )}
    </div>
  );
}
