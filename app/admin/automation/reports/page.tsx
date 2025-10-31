'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronRight,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  FileText,
  ExternalLink,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface AutomationRun {
  id: string;
  recipeRowNumber: number;
  spyTitle?: string;
  postLink?: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  recipeId?: string;
}

export default function AutomationReportsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get('status') || 'ALL';
  
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = statusFilter === 'ALL' 
        ? '/api/admin/automation/reports'
        : `/api/admin/automation/reports?status=${statusFilter}`;
        
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load reports');
      
      const data = await response.json();
      setRuns(data.runs || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Failed to load automation reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    setSelectedJobs(new Set()); // Clear selection when filter changes
  }, [statusFilter]);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/automation/job/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadReports();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete job');
      }
    } catch (err) {
      console.error('Failed to delete job:', err);
      setError('Failed to delete job');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobs.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedJobs.size} selected job(s)?`)) return;
    
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/automation/jobs/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobIds: Array.from(selectedJobs) }),
      });

      if (response.ok) {
        setSelectedJobs(new Set());
        await loadReports();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete jobs');
      }
    } catch (err) {
      console.error('Failed to delete jobs:', err);
      setError('Failed to delete jobs');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleJobSelection = (jobId: string) => {
    const newSelection = new Set(selectedJobs);
    if (newSelection.has(jobId)) {
      newSelection.delete(jobId);
    } else {
      newSelection.add(jobId);
    }
    setSelectedJobs(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedJobs.size === runs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(runs.map(run => run.id)));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded">
            <Activity className="w-3 h-3" />
            Processing
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 rounded">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 rounded">
            {status}
          </span>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'PROCESSING':
        return <Activity className="w-5 h-5 text-blue-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-gray-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'Completed Automations';
      case 'FAILED':
        return 'Failed Automations';
      case 'PROCESSING':
        return 'Active Automations';
      case 'PENDING':
        return 'Pending Automations';
      default:
        return 'All Automations';
    }
  };

  const formatDuration = (start: string, end?: string) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const duration = endDate.getTime() - startDate.getTime();
    
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/automation"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Dashboard
              </Link>
              <div className="h-5 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                {getStatusIcon(statusFilter)}
                <h1 className="text-lg font-semibold text-gray-900">
                  {getStatusTitle(statusFilter)}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {statusFilter === 'FAILED' && selectedJobs.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-red-300 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  {isDeleting ? 'Deleting...' : `Delete ${selectedJobs.size} Selected`}
                </button>
              )}
              <button
                onClick={loadReports}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {error && (
          <div className="bg-red-50 border border-red-300 rounded p-3 flex items-start gap-2 shadow-md mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-semibold text-sm">Error</p>
              <p className="text-red-700 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Loading reports...</p>
            </div>
          </div>
        ) : runs.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 shadow-md p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Automation Runs Found</h3>
            <p className="text-sm text-gray-600">
              {statusFilter === 'ALL' 
                ? 'No automation runs have been recorded yet.'
                : `No ${statusFilter.toLowerCase()} automation runs found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Summary Card */}
            <div className="bg-white rounded border border-gray-200 shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusFilter === 'FAILED' && runs.length > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedJobs.size === runs.length && runs.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-1 focus:ring-red-600"
                      />
                      <span className="text-xs text-gray-600">Select All</span>
                    </label>
                  )}
                  <FileText className="w-5 h-5 text-gray-900" />
                  <span className="text-sm font-bold text-gray-900">
                    Showing {runs.length} {runs.length === 1 ? 'record' : 'records'}
                  </span>
                </div>
                {statusFilter !== 'ALL' && (
                  <button
                    onClick={() => router.push('/admin/automation/reports')}
                    className="text-xs text-gray-600 hover:text-gray-900 underline"
                  >
                    View all statuses
                  </button>
                )}
              </div>
            </div>

            {/* Runs List */}
            {runs.map((run) => (
              <div
                key={run.id}
                className="bg-white rounded border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4"
              >
                <div className="flex items-start gap-3">
                  {statusFilter === 'FAILED' && (
                    <label className="flex items-center pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedJobs.has(run.id)}
                        onChange={() => toggleJobSelection(run.id)}
                        className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-1 focus:ring-red-600"
                      />
                    </label>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(run.status)}
                      <span className="text-xs text-gray-500">
                        Row #{run.recipeRowNumber}
                      </span>
                    </div>
                    
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                      {run.spyTitle || 'Untitled Recipe'}
                    </h3>
                    
                    {run.postLink && (
                      <a
                        href={run.postLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 mb-2"
                      >
                        View published recipe
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {run.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs text-red-700 font-mono">{run.error}</p>
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(run.startedAt).toLocaleString()}</span>
                    </div>
                    
                    {run.status.toUpperCase() !== 'PENDING' && (
                      <div className="text-xs text-gray-600 mb-2">
                        Duration: {formatDuration(run.startedAt, run.completedAt)}
                      </div>
                    )}

                    {run.recipeId && (
                      <Link
                        href={`/recipes/${run.recipeId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 mb-2 text-xs text-gray-900 hover:underline"
                      >
                        View Recipe
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}

                    {statusFilter === 'FAILED' && (
                      <button
                        onClick={() => handleDeleteJob(run.id)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
                      >
                        <XCircle className="w-3 h-3" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {run.status.toUpperCase() === 'PROCESSING' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">
                        Step {run.currentStep} of {run.totalSteps}
                      </span>
                      <span className="text-xs font-semibold text-gray-900">
                        {Math.round((run.currentStep / run.totalSteps) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(run.currentStep / run.totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
