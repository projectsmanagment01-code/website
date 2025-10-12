/**
 * SEO Enhancement Reports Dashboard
 * Displays detailed table of all auto-generated SEO enhancements
 */

'use client';

import { useState, useEffect } from 'react';

interface EnhancementReport {
  id: string;
  recipeId: string;
  recipeTitle: string;
  status: 'success' | 'partial' | 'failed';
  enhancementsCount: number;
  metadata: { status: string; confidence: number };
  images: { status: string; count: number };
  internalLinks: { status: string; count: number };
  schema: { status: string; confidence: number };
  seoScore: number;
  errors: string[];
  processingTime: number;
  createdAt: string;
}

export default function SEOEnhancementReports() {
  const [reports, setReports] = useState<EnhancementReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'partial' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'enhancements'>('date');
  const [selectedReport, setSelectedReport] = useState<EnhancementReport | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    partial: 0,
    failed: 0,
    avgScore: 0,
    avgEnhancements: 0
  });

  useEffect(() => {
    loadReports();
  }, [filter, sortBy]);

  const loadReports = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      const response = await fetch(`/api/seo/reports?filter=${filter}&sortBy=${sortBy}`);
      const data = await response.json();
      
      // Mock data for demonstration
      const mockReports: EnhancementReport[] = [
        {
          id: '1',
          recipeId: 'recipe-1',
          recipeTitle: 'Chocolate Chip Cookies',
          status: 'success',
          enhancementsCount: 12,
          metadata: { status: 'success', confidence: 0.92 },
          images: { status: 'success', count: 3 },
          internalLinks: { status: 'success', count: 5 },
          schema: { status: 'success', confidence: 0.90 },
          seoScore: 95,
          errors: [],
          processingTime: 45000,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          recipeId: 'recipe-2',
          recipeTitle: 'Homemade Pizza Dough',
          status: 'partial',
          enhancementsCount: 8,
          metadata: { status: 'success', confidence: 0.88 },
          images: { status: 'failed', count: 0 },
          internalLinks: { status: 'success', count: 4 },
          schema: { status: 'success', confidence: 0.85 },
          seoScore: 75,
          errors: ['Image enhancement timeout'],
          processingTime: 60000,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          recipeId: 'recipe-3',
          recipeTitle: 'Classic Tiramisu',
          status: 'success',
          enhancementsCount: 15,
          metadata: { status: 'success', confidence: 0.95 },
          images: { status: 'success', count: 4 },
          internalLinks: { status: 'success', count: 6 },
          schema: { status: 'success', confidence: 0.93 },
          seoScore: 98,
          errors: [],
          processingTime: 42000,
          createdAt: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      setReports(mockReports);
      calculateStats(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reports: EnhancementReport[]) => {
    const total = reports.length;
    const success = reports.filter(r => r.status === 'success').length;
    const partial = reports.filter(r => r.status === 'partial').length;
    const failed = reports.filter(r => r.status === 'failed').length;
    const avgScore = reports.reduce((sum, r) => sum + r.seoScore, 0) / total || 0;
    const avgEnhancements = reports.reduce((sum, r) => sum + r.enhancementsCount, 0) / total || 0;

    setStats({ total, success, partial, failed, avgScore, avgEnhancements });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 font-bold';
    if (score >= 70) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredReports = reports.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SEO Enhancement Reports</h1>
          <p className="text-gray-600 mt-1">Detailed history of automatic SEO enhancements</p>
        </div>
        <button 
          onClick={loadReports}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Reports</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-sm text-green-600">Success</div>
          <div className="text-2xl font-bold text-green-700">{stats.success}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <div className="text-sm text-yellow-600">Partial</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.partial}</div>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="text-sm text-red-600">Failed</div>
          <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="text-sm text-blue-600">Avg Score</div>
          <div className="text-2xl font-bold text-blue-700">{stats.avgScore.toFixed(0)}</div>
        </div>
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <div className="text-sm text-purple-600">Avg Enhancements</div>
          <div className="text-2xl font-bold text-purple-700">{stats.avgEnhancements.toFixed(1)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Reports</option>
              <option value="success">Success Only</option>
              <option value="partial">Partial</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date (Newest)</option>
              <option value="score">SEO Score</option>
              <option value="enhancements">Enhancements Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SEO Score
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enhancements
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metadata
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Images
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Links
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schema
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-gray-600">Loading reports...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                    No reports found
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {report.recipeTitle}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {report.recipeId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {report.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`text-2xl ${getScoreColor(report.seoScore)}`}>
                        {report.seoScore}
                      </div>
                      <div className="text-xs text-gray-500">/ 100</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {report.enhancementsCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <StatusIcon status={report.metadata.status} />
                        <div className="text-xs text-gray-500 mt-1">
                          {(report.metadata.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <StatusIcon status={report.images.status} />
                        <div className="text-xs text-gray-500 mt-1">
                          {report.images.count} imgs
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <StatusIcon status={report.internalLinks.status} />
                        <div className="text-xs text-gray-500 mt-1">
                          {report.internalLinks.count} links
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <StatusIcon status={report.schema.status} />
                        <div className="text-xs text-gray-500 mt-1">
                          {(report.schema.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {formatTime(report.processingTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatDate(report.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <ReportDetailModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'success') {
    return (
      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  }
  if (status === 'failed') {
    return (
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );
}

function ReportDetailModal({ report, onClose }: { report: EnhancementReport; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{report.recipeTitle}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">SEO Score</div>
              <div className="text-3xl font-bold text-blue-600">{report.seoScore}/100</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Enhancements</div>
              <div className="text-3xl font-bold text-green-600">{report.enhancementsCount}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Metadata Enhancement</h3>
              <div className="text-sm">Status: <span className="font-medium">{report.metadata.status}</span></div>
              <div className="text-sm">Confidence: <span className="font-medium">{(report.metadata.confidence * 100).toFixed(0)}%</span></div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Image Optimization</h3>
              <div className="text-sm">Status: <span className="font-medium">{report.images.status}</span></div>
              <div className="text-sm">Images Processed: <span className="font-medium">{report.images.count}</span></div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Internal Links</h3>
              <div className="text-sm">Status: <span className="font-medium">{report.internalLinks.status}</span></div>
              <div className="text-sm">Links Generated: <span className="font-medium">{report.internalLinks.count}</span></div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Schema Enhancement</h3>
              <div className="text-sm">Status: <span className="font-medium">{report.schema.status}</span></div>
              <div className="text-sm">Confidence: <span className="font-medium">{(report.schema.confidence * 100).toFixed(0)}%</span></div>
            </div>
          </div>

          {report.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">Errors</h3>
              <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                {report.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              View Recipe
            </button>
            <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              View Enhancements
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}