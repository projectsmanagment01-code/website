"use client";
import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Plus, 
  Eye, 
  EyeOff, 
  Trash2, 
  Copy, 
  Calendar, 
  Shield, 
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { refreshAfterChange } from '@/lib/revalidation-utils';

interface ApiToken {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdBy: string;
  description: string | null;
}

interface NewTokenData {
  name: string;
  duration: string;
  description: string;
}

const DURATION_OPTIONS = [
  { value: '7days', label: '7 Days' },
  { value: '1month', label: '1 Month' },
  { value: '6months', label: '6 Months' },
  { value: '1year', label: '1 Year' },
];

export default function ApiTokenManager() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newToken, setNewToken] = useState<NewTokenData>({
    name: '',
    duration: '1month',
    description: ''
  });
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/admin/tokens', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens);
      } else {
        console.error('Failed to fetch tokens');
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const createToken = async () => {
    if (!newToken.name.trim()) {
      alert('Please enter a token name');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(newToken),
      });

      if (response.ok) {
        const data = await response.json();
        const fullToken = data.token.token;
        setCreatedToken(fullToken);
        
        // Store full token in localStorage for later viewing
        const storedTokens = JSON.parse(localStorage.getItem('api_tokens_full') || '{}');
        storedTokens[data.token.id] = fullToken;
        localStorage.setItem('api_tokens_full', JSON.stringify(storedTokens));
        
        setNewToken({ name: '', duration: '1month', description: '' });
        fetchTokens();
      } else {
        const error = await response.json();
        alert(`Failed to create token: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Failed to create token');
    } finally {
      setCreating(false);
    }
  };

  const deleteToken = async (tokenId: string) => {
    if (!confirm('Are you sure you want to revoke this token? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tokens?id=${tokenId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        // Remove from localStorage as well
        const storedTokens = JSON.parse(localStorage.getItem('api_tokens_full') || '{}');
        delete storedTokens[tokenId];
        localStorage.setItem('api_tokens_full', JSON.stringify(storedTokens));
        
        fetchTokens();
        
        // Note: API token deletion doesn't affect frontend pages, no revalidation needed
      } else {
        const error = await response.json();
        alert(`Failed to revoke token: ${error.error}`);
      }
    } catch (error) {
      console.error('Error revoking token:', error);
      alert('Failed to revoke token');
    }
  };

  const toggleTokenStatus = async (tokenId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/tokens', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ id: tokenId, isActive: !isActive }),
      });

      if (response.ok) {
        fetchTokens();
      } else {
        const error = await response.json();
        alert(`Failed to update token: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating token:', error);
      alert('Failed to update token');
    }
  };

  const toggleTokenVisibility = (tokenId: string) => {
    const newVisible = new Set(visibleTokens);
    if (newVisible.has(tokenId)) {
      newVisible.delete(tokenId);
    } else {
      newVisible.add(tokenId);
    }
    setVisibleTokens(newVisible);
  };

  const getFullToken = (tokenId: string, maskedToken: string): string => {
    // Try to get full token from localStorage
    const storedTokens = JSON.parse(localStorage.getItem('api_tokens_full') || '{}');
    return storedTokens[tokenId] || maskedToken;
  };

  const copyToClipboard = async (text: string, tokenId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(tokenId);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getStatusColor = (token: ApiToken) => {
    if (isExpired(token.expiresAt)) return 'text-red-600 bg-red-50';
    if (!token.isActive) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusText = (token: ApiToken) => {
    if (isExpired(token.expiresAt)) return 'Expired';
    if (!token.isActive) return 'Inactive';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading API tokens...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Token Management</h1>
          <p className="text-gray-600">
            Generate and manage API tokens for accessing your website's API endpoints
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Token
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Key className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Total Tokens</p>
              <p className="text-2xl font-bold text-gray-900">{tokens.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {tokens.filter(t => t.isActive && !isExpired(t.expiresAt)).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-2xl font-bold text-gray-900">
                {tokens.filter(t => isExpired(t.expiresAt)).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {tokens.filter(t => !t.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tokens Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">API Tokens</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tokens.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No API tokens yet</p>
                    <p>Create your first API token to get started</p>
                  </td>
                </tr>
              ) : (
                tokens.map((token) => (
                  <tr key={token.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{token.name}</div>
                        {token.description && (
                          <div className="text-sm text-gray-500">{token.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {visibleTokens.has(token.id) ? getFullToken(token.id, token.token) : token.token}
                        </code>
                        <button
                          onClick={() => toggleTokenVisibility(token.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title={visibleTokens.has(token.id) ? "Hide token" : "Show full token"}
                        >
                          {visibleTokens.has(token.id) ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(getFullToken(token.id, token.token), token.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Copy token"
                        >
                          {copiedToken === token.id ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(token)}`}>
                        {getStatusText(token)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(token.expiresAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!isExpired(token.expiresAt) && (
                          <button
                            onClick={() => toggleTokenStatus(token.id, token.isActive)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              token.isActive
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {token.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        <button
                          onClick={() => deleteToken(token.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Token Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New API Token</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token Name *
                </label>
                <input
                  type="text"
                  value={newToken.name}
                  onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                  placeholder="e.g., Mobile App Token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <select
                  value={newToken.duration}
                  onChange={(e) => setNewToken({ ...newToken, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DURATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newToken.description}
                  onChange={(e) => setNewToken({ ...newToken, description: e.target.value })}
                  placeholder="Optional description for this token"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewToken({ name: '', duration: '1month', description: '' });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createToken}
                disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {creating && <RefreshCw className="w-4 h-4 animate-spin" />}
                Create Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token Created Modal */}
      {createdToken && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Token Created Successfully!</h3>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Token Created!</p>
                  <p className="text-sm text-blue-700">
                    Copy your token now. You can also view it later by clicking the eye icon in the token list.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your API Token:
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded border font-mono text-sm break-all">
                  {createdToken}
                </code>
                <button
                  onClick={() => copyToClipboard(createdToken, 'created')}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                >
                  {copiedToken === 'created' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  Copy
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setCreatedToken(null);
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}