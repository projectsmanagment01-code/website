'use client';

import { useEffect, useState } from 'react';
import { 
  PlayCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  Settings,
  Activity,
  TrendingUp,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { AdminCard, AdminButton, AdminBadge } from '@/components/admin/AdminUI';

interface QueueStats {
  active: number;
  waiting: number;
  completed: number;
  failed: number;
}

interface RecentJob {
  id: string;
  recipeRowNumber: number;
  spyTitle?: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  startedAt: string;
  error?: string;
}

interface AutomationStats {
  totalRuns: number;
  successRate: number;
  averageTime: number;
  lastRun?: string;
}

interface ScheduleConfig {
  enabled: boolean;
  scheduleType: string;
  nextRun?: string;
  lastRun?: string;
}

export default function AutomationDashboard() {
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [automationStats, setAutomationStats] = useState<AutomationStats | null>(null);
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get authenticated headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/admin/automation/status', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to load status');
      
      const data = await response.json();
      setQueueStats(data.queueStats);
      setRecentJobs(data.recentJobs || []);
      setAutomationStats(data.automationStats || null);
    } catch (err) {
      console.error('Failed to load status:', err);
      setError('Failed to load automation status');
    }
  };

  const loadSchedule = async () => {
    try {
      const response = await fetch('/api/admin/automation/schedule', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setSchedule(data.schedule);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
    }
  };

  useEffect(() => {
    loadStatus();
    loadSchedule();
  }, []);

  const handleStartAutomation = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/automation/run', {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start automation');
      }

      await loadStatus();
    } catch (err: any) {
      console.error('Failed to start automation:', err);
      setError(err.message || 'Failed to start automation');
    } finally {
      setIsStarting(false);
    }
  };

  const toggleSchedule = async () => {
    if (!schedule) return;

    try {
      const response = await fetch('/api/admin/automation/schedule', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ enabled: !schedule.enabled })
      });

      if (response.ok) {
        const data = await response.json();
        setSchedule(data.schedule);
      }
    } catch (err) {
      console.error('Failed to toggle schedule:', err);
    }
  };

  const handleStopJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to stop this job?')) return;
    
    try {
      const response = await fetch(`/api/admin/automation/job/${jobId}/stop`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        await loadStatus();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to stop job');
      }
    } catch (err) {
      console.error('Failed to stop job:', err);
      setError('Failed to stop job');
    }
  };

  const handleCancelJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to cancel this job?')) return;
    
    try {
      const response = await fetch(`/api/admin/automation/job/${jobId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        await loadStatus();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to cancel job');
      }
    } catch (err) {
      console.error('Failed to cancel job:', err);
      setError('Failed to cancel job');
    }
  };

  const handleRetryJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to retry this job?')) return;
    
    try {
      const response = await fetch(`/api/admin/automation/job/${jobId}/retry`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        await loadStatus();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to retry job');
      }
    } catch (err) {
      console.error('Failed to retry job:', err);
      setError('Failed to retry job');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800';
      case 'FAILED':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30 border border-red-200 dark:border-red-800';
      case 'PROCESSING':
        return 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-700 border border-slate-200 dark:border-slate-600';
      case 'PENDING':
        return 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800';
      default:
        return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-700 border border-slate-200 dark:border-slate-600';
    }
  };

  const getProgressPercentage = (currentStep: number, totalSteps: number) => {
    return Math.round((currentStep / totalSteps) * 100);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-300 rounded p-3 flex items-start gap-2 shadow-md">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 font-semibold text-sm">Error</p>
            <p className="text-red-700 text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Active Jobs</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1.5">
                {queueStats?.active || 0}
              </p>
            </div>
            <div className="w-11 h-11 bg-slate-900 dark:bg-slate-700 rounded flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1.5">
                {queueStats?.completed || 0}
              </p>
            </div>
            <div className="w-11 h-11 bg-emerald-600 dark:bg-emerald-700 rounded flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">In Queue</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1.5">
                {queueStats?.waiting || 0}
              </p>
            </div>
            <div className="w-11 h-11 bg-slate-600 dark:bg-slate-500 rounded flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Failed</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1.5">
                {queueStats?.failed || 0}
              </p>
            </div>
            <div className="w-11 h-11 bg-red-600 dark:bg-red-700 rounded flex items-center justify-center shadow-sm">
              <XCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Control Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Manual Start Card */}
        <div className="bg-slate-800 dark:bg-slate-900 rounded border border-slate-700 dark:border-slate-600 p-4 text-white shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-base font-bold mb-1.5">Manual Start</h3>
              <p className="text-slate-300 dark:text-slate-400 text-xs leading-relaxed">
                Start automation immediately for the next eligible recipe
              </p>
            </div>
            <PlayCircle className="w-5 h-5 text-slate-400" />
          </div>
          <button
            onClick={handleStartAutomation}
            disabled={isStarting || (queueStats?.active || 0) > 0}
            className="w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold py-2 px-4 rounded hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                Start Now
              </>
            )}
          </button>
        </div>

        {/* Scheduler Card */}
        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">Automation Schedule</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                {schedule?.enabled 
                  ? `Running ${schedule.scheduleType} • Next: ${schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : 'N/A'}`
                  : 'Schedule automatic runs'}
              </p>
            </div>
            <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSchedule}
              className={`flex-1 font-semibold py-2 px-4 rounded transition-colors text-sm shadow-md ${
                schedule?.enabled
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300 border border-gray-300'
              }`}
            >
              {schedule?.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      {automationStats && (
        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
            <TrendingUp className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700 rounded p-3 border border-slate-200 dark:border-slate-600 shadow-sm">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Runs</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{automationStats.totalRuns}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded p-3 border border-slate-200 dark:border-slate-600 shadow-sm">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Success Rate</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{automationStats.successRate}%</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded p-3 border border-slate-200 dark:border-slate-600 shadow-sm">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Avg. Time</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{automationStats.averageTime}m</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            Recent Activity
          </h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {recentJobs.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              <Activity className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-sm">No recent activity</p>
              <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">Start your first automation to see activity here</p>
            </div>
          ) : (
            recentJobs.map((job) => (
              <div key={job.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Row {job.recipeRowNumber}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
                      {job.spyTitle || 'Untitled Recipe'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Started {new Date(job.startedAt).toLocaleString()}
                    </p>
                    {job.error && (
                      <p className="text-xs text-red-700 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/30 p-2 rounded border border-red-200 dark:border-red-800 shadow-sm">
                        {job.error}
                      </p>
                    )}
                  </div>
                  <div className="ml-3 flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Step {job.currentStep} / {job.totalSteps}
                      </p>
                      <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden border border-slate-300 dark:border-slate-600">
                        <div
                          className="h-full bg-slate-900 dark:bg-slate-400 transition-all duration-300"
                          style={{ width: `${getProgressPercentage(job.currentStep, job.totalSteps)}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Task Management Actions */}
                    <div className="flex flex-col gap-1.5">
                      {job.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleStopJob(job.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors shadow-sm"
                          title="Stop this job"
                        >
                          Stop
                        </button>
                      )}
                      {job.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelJob(job.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded transition-colors shadow-sm border border-slate-300 dark:border-slate-500"
                          title="Cancel this job"
                        >
                          Cancel
                        </button>
                      )}
                      {job.status === 'FAILED' && (
                        <button
                          onClick={() => handleRetryJob(job.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-600 hover:bg-slate-700 rounded transition-colors shadow-sm"
                          title="Retry this job"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
          <Settings className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          System Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50 dark:bg-slate-700 rounded p-2.5 border border-slate-200 dark:border-slate-600 shadow-sm">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Queue System</p>
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">BullMQ + Redis</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700 rounded p-2.5 border border-slate-200 dark:border-slate-600">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Steps</p>
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">12 Steps</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700 rounded p-2.5 border border-slate-200 dark:border-slate-600">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">AI Models</p>
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">Gemini</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700 rounded p-2.5 border border-slate-200 dark:border-slate-600">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</p>
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Online
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}