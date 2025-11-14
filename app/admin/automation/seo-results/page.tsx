'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Trash2,
  RefreshCw,
  Brain
} from 'lucide-react';

interface SEOEntry {
  id: string;
  spyTitle: string;
  spyDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeyword?: string;
  seoCategory?: string;
  status: string;
  createdAt: string;
  seoExtractedAt?: string;
}

export default function SEOResultsPage() {
  const [entries, setEntries] = useState<SEOEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchSEOResults();
  }, []);

  const fetchSEOResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch('/api/admin/pinterest-spy/seo-data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch SEO results');

      const data = await response.json();
      setEntries(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load SEO results');
      console.error('Error fetching SEO results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Original Title', 'SEO Title', 'SEO Description', 'Keyword', 'Category', 'Status', 'Extracted Date'],
      ...filteredEntries.map(entry => [
        entry.id,
        entry.spyTitle || '',
        entry.seoTitle || '',
        entry.seoDescription || '',
        entry.seoKeyword || '',
        entry.seoCategory || '',
        entry.status,
        entry.seoExtractedAt || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} selected entries?`)) return;

    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch('/api/admin/pinterest-spy', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete entries');
      }

      console.log(`✅ Deleted ${ids.length} entries successfully`);
      await fetchSEOResults();
      setSelectedEntries([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete entries';
      setError(errorMessage);
      console.error('Delete error:', err);
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleExtractSEO = async () => {
    if (selectedEntries.length === 0) {
      alert('Please select entries to process');
      return;
    }

    if (!confirm(`Extract SEO data using AI for ${selectedEntries.length} selected entries?\n\nThis will use AI to analyze the Pinterest data and generate:\n• SEO Keyword\n• SEO Title\n• SEO Description\n• Category`)) return;

    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      
      console.log(`🧠 Starting SEO extraction for ${selectedEntries.length} entries...`);
      
      const response = await fetch('/api/admin/pinterest-spy/process-seo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          entryIds: selectedEntries,
          batchSize: 5 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process SEO');
      }

      const result = await response.json();
      console.log('✅ SEO Processing Result:', result);

      await fetchSEOResults();
      setSelectedEntries([]);
      
      alert(`🎉 SEO Extraction Complete!\n\n✅ Successfully Processed: ${result.processed}\n❌ Failed: ${result.failed}\n\nThe AI has generated SEO metadata for your selected entries.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process SEO';
      setError(errorMessage);
      console.error('SEO extraction error:', err);
      alert(`❌ SEO Extraction Failed\n\n${errorMessage}\n\nCheck the console for more details.`);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (entry: SEOEntry) => {
    if (entry.seoTitle && entry.seoDescription && entry.seoKeyword) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    }

    if (entry.status === 'SEO_PROCESSING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
          <Loader2 className="w-3 h-3 animate-spin" />
          Processing
        </span>
      );
    }

    if (entry.status === 'FAILED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700">
          <XCircle className="w-3 h-3" />
          Failed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.spyTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.seoTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.seoKeyword?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const hasCompleteSEO = entry.seoTitle && entry.seoDescription && entry.seoKeyword;
    const matchesStatus = statusFilter === 'all' ||
                          (statusFilter === 'completed' && hasCompleteSEO) ||
                          (statusFilter === 'pending' && !hasCompleteSEO) ||
                          (statusFilter === 'selected' && selectedEntries.includes(entry.id));
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const completedCount = entries.filter(e => e.seoTitle && e.seoDescription && e.seoKeyword).length;
  const pendingCount = entries.filter(e => !e.seoTitle || !e.seoDescription || !e.seoKeyword).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">🧠 SEO Results</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">View and manage SEO-processed Pinterest spy data</p>
        </div>
        <button
          onClick={() => fetchSEOResults()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 dark:bg-slate-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-500 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">Total Entries</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{entries.length}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-sm text-green-700 dark:text-green-400">Completed</div>
          <div className="text-2xl font-bold text-green-800 dark:text-green-300 mt-1">{completedCount}</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">Pending</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{pendingCount}</div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or keyword..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="selected">Selected Only</option>
            </select>
          </div>

          <div className="flex gap-2">
            {selectedEntries.length > 0 && (
              <>
                <button
                  onClick={handleExtractSEO}
                  disabled={processing}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Extract SEO ({selectedEntries.length})
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(selectedEntries)}
                  disabled={processing}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedEntries.length})
                </button>
              </>
            )}
            <button
              onClick={handleExport}
              disabled={filteredEntries.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 dark:bg-slate-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {selectedEntries.length > 0 && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setSelectedEntries([])}
              className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading SEO results...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-12 text-center">
          <Filter className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No SEO results found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={paginatedEntries.length > 0 && paginatedEntries.every(e => selectedEntries.includes(e.id))}
                      onChange={() => {
                        const allIds = paginatedEntries.map(e => e.id);
                        if (allIds.every(id => selectedEntries.includes(id))) {
                          setSelectedEntries(selectedEntries.filter(id => !allIds.includes(id)));
                        } else {
                          setSelectedEntries([...new Set([...selectedEntries, ...allIds])]);
                        }
                      }}
                      className="rounded border-slate-300 dark:border-slate-600 text-amber-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Original Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">SEO Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">SEO Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Keyword</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {paginatedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.id)}
                        onChange={() => {
                          if (selectedEntries.includes(entry.id)) {
                            setSelectedEntries(selectedEntries.filter(id => id !== entry.id));
                          } else {
                            setSelectedEntries([...selectedEntries, entry.id]);
                          }
                        }}
                        className="rounded border-slate-300 dark:border-slate-600 text-amber-600"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(entry)}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
                        {entry.spyTitle || 'No title'}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-sm text-green-700 dark:text-green-400 font-medium line-clamp-2">
                        {entry.seoTitle || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                        {entry.seoDescription || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        {entry.seoKeyword || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {entry.seoCategory || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, filteredEntries.length)} of {filteredEntries.length} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-slate-700 dark:text-slate-300">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
