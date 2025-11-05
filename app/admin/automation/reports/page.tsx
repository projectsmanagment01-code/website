'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  step?: number;
  total?: number;
  message: string;
}

interface PipelineLog {
  id: string;
  scheduleId: string | null;
  schedule?: {
    id: string;
    name: string;
    cronExpression: string;
  } | null;
  spyDataId: string | null;
  spyTitle: string | null;
  authorId: string | null;
  status: string;
  stage: string | null;
  progress: number;
  logs: LogEntry[];
  recipeId: string | null;
  recipeUrl: string | null;
  error: string | null;
  errorStage: string | null;
  triggeredBy: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  createdAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export default function PipelineReportsPage() {
  const [logs, setLogs] = useState<PipelineLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [triggeredByFilter, setTriggeredByFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (statusFilter) params.append('status', statusFilter);
      if (triggeredByFilter) params.append('triggeredBy', triggeredByFilter);

      const response = await fetch(`/api/admin/automation/pipeline/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch logs');

      const result = await response.json();
      setLogs(result.data.logs);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [statusFilter, triggeredByFilter]);

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      RUNNING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      SUCCESS: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
      FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700'
    };

    const icons = {
      RUNNING: <Loader2 className="w-4 h-4 animate-spin" />,
      SUCCESS: <CheckCircle2 className="w-4 h-4" />,
      FAILED: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Pipeline Execution Reports</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">View detailed logs and history of all pipeline executions</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Statuses</option>
                <option value="RUNNING">Running</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Triggered By</label>
              <select
                value={triggeredByFilter}
                onChange={(e) => setTriggeredByFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Types</option>
                <option value="schedule">Schedule</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setTriggeredByFilter('');
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">Total Executions</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{pagination.total}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-sm text-green-700 dark:text-green-400">Successful</div>
          <div className="text-2xl font-bold text-green-800 dark:text-green-300 mt-1">
            {logs.filter(l => l.status === 'SUCCESS').length}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-sm text-red-700 dark:text-red-400">Failed</div>
          <div className="text-2xl font-bold text-red-800 dark:text-red-300 mt-1">
            {logs.filter(l => l.status === 'FAILED').length}
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="text-sm text-blue-700 dark:text-blue-400">Running</div>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-300 mt-1">
            {logs.filter(l => l.status === 'RUNNING').length}
          </div>
        </div>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">No execution logs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const isExpanded = expandedLogs.has(log.id);
            
            return (
              <div key={log.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                {/* Log Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  onClick={() => toggleLogExpansion(log.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(log.status)}
                        <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                          {log.triggeredBy}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        {log.spyTitle || 'Untitled Recipe'}
                      </h3>
                      {log.schedule && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Schedule: {log.schedule.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        {formatTimestamp(log.startedAt)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        {formatDuration(log.durationMs)}
                      </div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Progress: {log.progress}%
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 dark:text-slate-500 ml-4" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500 ml-4" />
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        log.status === 'SUCCESS' ? 'bg-green-500 dark:bg-green-400' :
                        log.status === 'FAILED' ? 'bg-red-500 dark:bg-red-400' :
                        'bg-blue-500 dark:bg-blue-400'
                      }`}
                      style={{ width: `${log.progress}%` }}
                    />
                  </div>

                  {log.stage && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Stage: <span className="font-medium">{log.stage}</span>
                    </p>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                    {/* Error Display */}
                    {log.error && (
                      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Error Details</h4>
                        <p className="text-sm text-red-700 dark:text-red-400">{log.error}</p>
                        {log.errorStage && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            Failed at: <span className="font-medium">{log.errorStage}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Recipe Link */}
                    {log.recipeUrl && (
                      <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Generated Recipe</h4>
                        <a
                          href={log.recipeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline"
                        >
                          {log.recipeUrl}
                        </a>
                      </div>
                    )}

                    {/* Detailed Logs */}
                    {log.logs && log.logs.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Execution Logs</h4>
                        <div className="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-xs space-y-1">
                          {log.logs.map((entry, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="text-slate-400 dark:text-slate-500">
                                {new Date(entry.timestamp).toLocaleTimeString()}
                              </span>
                              {entry.step && entry.total && (
                                <span className="text-amber-400 dark:text-amber-300">
                                  [{entry.step}/{entry.total}]
                                </span>
                              )}
                              <span className="text-slate-200 dark:text-slate-300">{entry.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => fetchLogs(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-slate-600 dark:text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchLogs(pagination.page + 1)}
            disabled={!pagination.hasMore}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
