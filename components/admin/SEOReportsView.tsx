"use client";

import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import SEOReportModal from './SEOReportModal';

interface SEOReport {
  id: string;
  recipeId: string;
  recipeTitle: string;
  status: string;
  enhancementsCount: number;
  seoScore: number | null;
  processingTime: number | null;
  metadataGenerated: boolean;
  imagesProcessed: number;
  linksGenerated: number;
  schemaEnhanced: boolean;
  errorMessage: string | null;
  aiResponse: any | null;
  createdAt: string;
}

export default function SEOReportsView() {
  const [reports, setReports] = useState<SEOReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<SEOReport | null>(null);

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/seo/reports' 
        : `/api/seo/reports?status=${filter}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const data = await response.json();
      setReports(data.reports || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching SEO reports:', err);
      setError(err.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    if (status === 'success') return 'bg-green-100 text-green-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'failed') return 'bg-red-100 text-red-800';
    if (status === 'processing') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getFilterButtonClass = (filterValue: string) => {
    if (filter === filterValue) {
      if (filterValue === 'all') return 'bg-orange-600 text-white';
      if (filterValue === 'success') return 'bg-green-600 text-white';
      if (filterValue === 'pending') return 'bg-yellow-600 text-white';
      if (filterValue === 'failed') return 'bg-red-600 text-white';
    }
    return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const successCount = reports.filter(r => r.status === 'success').length;
  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const failedCount = reports.filter(r => r.status === 'failed').length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Loading SEO reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="mr-3">❌</div>
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Reports</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchReports}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Reports</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{reports.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-sm text-green-600">Success</div>
          <div className="text-2xl font-bold text-green-700 mt-1">{successCount}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <div className="text-sm text-yellow-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-700 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="text-sm text-red-600">Failed</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{failedCount}</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={getFilterButtonClass('all') + ' px-4 py-2 rounded-md text-sm font-medium'}>
            All Reports
          </button>
          <button onClick={() => setFilter('success')} className={getFilterButtonClass('success') + ' px-4 py-2 rounded-md text-sm font-medium'}>
            Success
          </button>
          <button onClick={() => setFilter('pending')} className={getFilterButtonClass('pending') + ' px-4 py-2 rounded-md text-sm font-medium'}>
            Pending
          </button>
          <button onClick={() => setFilter('failed')} className={getFilterButtonClass('failed') + ' px-4 py-2 rounded-md text-sm font-medium'}>
            Failed
          </button>
          <button onClick={fetchReports} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            Refresh
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No SEO Reports Yet</h3>
            <p className="text-gray-600">
              Create a new recipe to automatically generate SEO enhancements.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SEO Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enhancements</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processing Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{report.recipeTitle}</div>
                      <div className="text-sm text-gray-500">ID: {report.recipeId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusClass(report.status) + ' px-3 py-1 rounded-full text-xs font-medium'}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {report.seoScore !== null ? (
                        <div className="flex items-center">
                          <div className="text-lg font-bold text-gray-900">{report.seoScore}</div>
                          <div className="text-sm text-gray-500 ml-1">/100</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {report.enhancementsCount} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {report.processingTime !== null ? (
                        <span className="text-sm text-gray-900">{report.processingTime}s</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(report.createdAt)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="mr-3 text-xl">ℹ️</div>
          <div className="text-sm text-blue-800">
            <strong>About AI SEO Reports:</strong> These reports are automatically generated when you create or update a recipe. 
            The AI analyzes your content and suggests improvements for metadata, image alt text, internal links, and schema markup.
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <SEOReportModal 
        report={selectedReport} 
        onClose={() => setSelectedReport(null)} 
      />
    </div>
  );
}
