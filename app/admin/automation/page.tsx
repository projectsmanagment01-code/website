'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlayCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  Settings,
  Activity,
  Zap,
  TrendingUp,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

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
  const router = useRouter();
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [automationStats, setAutomationStats] = useState<AutomationStats | null>(null);
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/admin/automation/status');
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
      const response = await fetch('/api/admin/automation/schedule');
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
    // Auto-refresh removed to reduce DB load
    // Dashboard will refresh when you click buttons (Start, Stop, Cancel, Retry)
  }, []);

  const handleStartAutomation = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/automation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start automation');
      }

      // Refresh status
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
        headers: { 'Content-Type': 'application/json' },
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

  // Task Management Functions
  const handleStopJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to stop this job?')) return;
    
    try {
      const response = await fetch(`/api/admin/automation/job/${jobId}/stop`, {
        method: 'POST'
      });

      if (response.ok) {
        // Refresh data
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
        method: 'POST'
      });

      if (response.ok) {
        // Refresh data
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
        method: 'POST'
      });

      if (response.ok) {
        // Refresh data
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
        return 'text-green-700 bg-green-50 border border-green-200';
      case 'FAILED':
        return 'text-red-700 bg-red-50 border border-red-200';
      case 'PROCESSING':
        return 'text-blue-700 bg-blue-50 border border-blue-200';
      case 'PENDING':
        return 'text-gray-700 bg-gray-50 border border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  const getProgressPercentage = (currentStep: number, totalSteps: number) => {
    return Math.round((currentStep / totalSteps) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Admin
              </Link>
              <div className="h-5 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">
                Recipe Automation
              </h1>
            </div>
            <Link
              href="/admin/automation/settings"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-4">

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => router.push('/admin/automation/reports?status=PROCESSING')}
            className="bg-white rounded border border-gray-200 p-4 shadow-md hover:shadow-lg transition-all hover:border-gray-900 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1.5">
                  {queueStats?.active || 0}
                </p>
              </div>
              <div className="w-11 h-11 bg-gray-900 rounded flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/automation/reports?status=COMPLETED')}
            className="bg-white rounded border border-gray-200 p-4 shadow-md hover:shadow-lg transition-all hover:border-green-600 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1.5">
                  {queueStats?.completed || 0}
                </p>
              </div>
              <div className="w-11 h-11 bg-green-600 rounded flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/automation/reports?status=PENDING')}
            className="bg-white rounded border border-gray-200 p-4 shadow-md hover:shadow-lg transition-all hover:border-blue-600 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">In Queue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1.5">
                  {queueStats?.waiting || 0}
                </p>
              </div>
              <div className="w-11 h-11 bg-blue-600 rounded flex items-center justify-center shadow-sm">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/automation/reports?status=FAILED')}
            className="bg-white rounded border border-gray-200 p-4 shadow-md hover:shadow-lg transition-all hover:border-red-600 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Failed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1.5">
                  {queueStats?.failed || 0}
                </p>
              </div>
              <div className="w-11 h-11 bg-red-600 rounded flex items-center justify-center shadow-sm">
                <XCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </button>
        </div>

        {/* Control Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Manual Start Card */}
          <div className="bg-gray-900 rounded border border-gray-700 p-4 text-white shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-bold mb-1.5">Manual Start</h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Start automation immediately for the next eligible recipe
                </p>
              </div>
              <PlayCircle className="w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={handleStartAutomation}
              disabled={isStarting || (queueStats?.active || 0) > 0}
              className="w-full bg-white text-gray-900 font-semibold py-2 px-4 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
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
          <div className="bg-white rounded border border-gray-200 p-4 shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">Automation Schedule</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {schedule?.enabled 
                    ? `Running ${schedule.scheduleType} • Next: ${schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : 'N/A'}`
                    : 'Schedule automatic runs'}
                </p>
              </div>
              <Calendar className="w-5 h-5 text-gray-500" />
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
              <Link
                href="/admin/automation/schedule"
                className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-50 transition-colors text-sm shadow-md"
              >
                Configure
              </Link>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        {automationStats && (
          <div className="bg-white rounded border border-gray-200 p-4 shadow-md">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 pb-2 border-b border-gray-200">
              <TrendingUp className="w-4 h-4 text-gray-700" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded p-3 border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Runs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{automationStats.totalRuns}</p>
              </div>
              <div className="bg-gray-50 rounded p-3 border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{automationStats.successRate}%</p>
              </div>
              <div className="bg-gray-50 rounded p-3 border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Avg. Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{automationStats.averageTime}m</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded border border-gray-200 shadow-md">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-700" />
              Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentJobs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Activity className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-sm">No recent activity</p>
                <p className="text-xs mt-1 text-gray-400">Start your first automation to see activity here</p>
              </div>
            ) : (
              recentJobs.map((job) => (
                <div key={job.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          Row {job.recipeRowNumber}
                        </span>
                      </div>
                      <p className="font-semibold text-sm text-gray-900 mb-1">
                        {job.spyTitle || 'Untitled Recipe'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Started {new Date(job.startedAt).toLocaleString()}
                      </p>
                      {job.error && (
                        <p className="text-xs text-red-700 mt-2 bg-red-50 p-2 rounded border border-red-200 shadow-sm">
                          {job.error}
                        </p>
                      )}
                    </div>
                    <div className="ml-3 flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-900">
                          Step {job.currentStep} / {job.totalSteps}
                        </p>
                        <div className="w-20 h-2 bg-gray-200 rounded-full mt-1.5 overflow-hidden border border-gray-300">
                          <div
                            className="h-full bg-gray-900 transition-all duration-300"
                            style={{ width: `${getProgressPercentage(job.currentStep, job.totalSteps)}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Task Management Actions */}
                      <div className="flex flex-col gap-1.5">
                        {job.status === 'PROCESSING' && (
                          <button
                            onClick={() => handleStopJob(job.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors shadow-md hover:shadow-lg"
                            title="Stop this job"
                          >
                            Stop
                          </button>
                        )}
                        {job.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelJob(job.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-colors shadow-md hover:shadow-lg border border-gray-300"
                            title="Cancel this job"
                          >
                            Cancel
                          </button>
                        )}
                        {job.status === 'FAILED' && (
                          <button
                            onClick={() => handleRetryJob(job.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-md hover:shadow-lg"
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
        <div className="bg-white rounded border border-gray-200 p-4 shadow-md">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 pb-2 border-b border-gray-200">
            <Settings className="w-4 h-4 text-gray-700" />
            System Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded p-2.5 border border-gray-200 shadow-sm">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Queue System</p>
              <p className="font-bold text-sm text-gray-900 mt-1">BullMQ + Redis</p>
            </div>
            <div className="bg-gray-50 rounded p-2.5 border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Steps</p>
              <p className="font-bold text-sm text-gray-900 mt-1">12 Steps</p>
            </div>
            <div className="bg-gray-50 rounded p-2.5 border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">AI Models</p>
              <p className="font-bold text-sm text-gray-900 mt-1">Gemini</p>
            </div>
            <div className="bg-gray-50 rounded p-2.5 border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</p>
              <div className="font-bold text-sm text-gray-900 mt-1 flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Online
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
