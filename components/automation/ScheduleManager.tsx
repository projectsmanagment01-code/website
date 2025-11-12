/**
 * Schedule Manager Component
 * Manage automated recipe generation schedules
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Trash2, Plus, Check, X, Calendar, Zap } from 'lucide-react';

interface Schedule {
  id: string;
  enabled: boolean;
  scheduleType: string;
  cronExpression: string | null;
  timeOfDay: string | null;
  dayOfWeek: number | null;
  lastRun: string | null;
  nextRun: string | null;
  runCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ActiveJob {
  id: string;
  key: string;
  pattern: string;
  next: number;
}

export default function ScheduleManager() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    cronExpression: '0 */2 * * *',
    enabled: false
  });
  const [intervalMinutes, setIntervalMinutes] = useState(120); // Default 2 hours
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadSchedules();
    const interval = setInterval(loadSchedules, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSchedules = async () => {
    try {
      const response = await fetch('/api/admin/automation/pipeline/schedule');
      const data = await response.json();
      
      if (data.success) {
        setSchedules(data.schedules || []);
        setActiveJobs(data.activeJobs || []);
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async () => {
    try {
      console.log('➕ Creating schedule:', newSchedule);
      
      const response = await fetch('/api/admin/automation/pipeline/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule)
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok) {
        console.log('✅ Schedule created successfully');
        setShowCreateModal(false);
        setNewSchedule({ name: '', cronExpression: '0 */2 * * *', enabled: false });
        setIntervalMinutes(120); // Reset to 2 hours
        loadSchedules();
      } else {
        console.error('❌ Failed to create schedule:', data);
        alert(`Failed to create schedule: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Failed to create schedule:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleSchedule = async (id: string, currentEnabled: boolean) => {
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch('/api/admin/automation/pipeline/schedule', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, enabled: !currentEnabled })
      });

      if (response.ok) {
        showToast(currentEnabled ? 'Schedule paused' : 'Schedule started', 'success');
        loadSchedules();
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to toggle schedule', 'error');
      }
    } catch (error) {
      showToast('Error toggling schedule', 'error');
      console.error('Toggle schedule error:', error);
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Delete this schedule?')) return;

    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`/api/admin/automation/pipeline/schedule?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showToast('Schedule deleted', 'success');
        loadSchedules();
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to delete', 'error');
      }
    } catch (error) {
      showToast('Error deleting schedule', 'error');
      console.error('Delete schedule error:', error);
    }
  };

  const runManualPipeline = async () => {
    if (!confirm('Generate 1 recipe now?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/automation/pipeline/run', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ autoSelect: true })
      });

      const result = await response.json();
      if (result.success) {
        showToast('Recipe created!', 'success');
        setTimeout(loadSchedules, 2000);
      } else {
        showToast(result.error || 'Failed', 'error');
      }
    } catch (error) {
      showToast('Error starting pipeline', 'error');
    }
  };

  /**
   * Convert minutes to cron expression
   * Examples: 
   * - 60 min = every hour
   * - 120 min = every 2 hours
   * - 30 min = every 30 minutes
   */
  const minutesToCron = (minutes: number): string => {
    if (minutes < 60) {
      // Less than 1 hour - use minute intervals
      return `*/${minutes} * * * *`;
    } else {
      // 1 hour or more - use hour intervals
      const hours = minutes / 60;
      if (hours >= 24) {
        // Daily or more
        const days = Math.floor(hours / 24);
        return `0 0 */${days} * *`;
      }
      return `0 */${hours} * * *`;
    }
  };

  /**
   * Update cron expression when minutes change
   */
  const handleMinutesChange = (minutes: number) => {
    setIntervalMinutes(minutes);
    const cronExpression = minutesToCron(minutes);
    setNewSchedule({ ...newSchedule, cronExpression });
  };

  /**
   * Get human-readable schedule description
   */
  const getScheduleDescription = (minutes: number): string => {
    if (minutes < 60) {
      return `Every ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes < 1440) {
      const hours = minutes / 60;
      return `Every ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const days = minutes / 1440;
      return `Every ${days} day${days !== 1 ? 's' : ''}`;
    }
  };

  /**
   * Convert cron expression to human-readable text
   */
  const cronToHumanReadable = (cron: string | null): string => {
    if (!cron) return 'Custom Schedule';
    
    // Parse cron: */30 * * * * = every 30 minutes
    // Parse cron: 0 */2 * * * = every 2 hours
    // Parse cron: 0 0 */1 * * = every 1 day
    
    const parts = cron.split(' ');
    
    // Every X minutes: */X * * * *
    if (parts[0].startsWith('*/') && parts[1] === '*') {
      const minutes = parseInt(parts[0].substring(2));
      return `Every ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    // Every X hours: 0 */X * * *
    if (parts[0] === '0' && parts[1].startsWith('*/')) {
      const hours = parseInt(parts[1].substring(2));
      return `Every ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    // Every X days: 0 0 */X * *
    if (parts[0] === '0' && parts[1] === '0' && parts[2].startsWith('*/')) {
      const days = parseInt(parts[2].substring(2));
      return `Every ${days} day${days !== 1 ? 's' : ''}`;
    }
    
    return cron; // Fallback to showing cron expression
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Recipe Pipeline Schedules
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Automate recipe generation from Pinterest spy data
        </p>
      </div>

      {/* Manual Run Button */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Manual Pipeline Run
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Generate 1 recipe immediately from next pending spy data entry
            </p>
          </div>
          <button
            onClick={runManualPipeline}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Zap className="w-4 h-4" />
            Run Now
          </button>
        </div>
      </div>

      {/* Active Schedules */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Active Schedules ({schedules.filter(s => s.enabled).length})
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <Calendar className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No schedules yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Create your first schedule to automate recipe generation
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => {
            const activeJob = activeJobs.find(job => job.id === `schedule-${schedule.id}`);
            const nextRun = activeJob ? new Date(activeJob.next).toLocaleString() : 'Not scheduled';
            const lastRun = schedule.lastRun ? new Date(schedule.lastRun).toLocaleString() : 'Never';

            return (
              <div
                key={schedule.id}
                className={`p-6 border rounded-lg transition-all ${
                  schedule.enabled
                    ? 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-800'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        schedule.enabled 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {cronToHumanReadable(schedule.cronExpression)}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {schedule.enabled ? 'Active' : 'Paused'} • Generates 1 recipe per run
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Next Run:</span>
                        <p className="font-medium text-slate-900 dark:text-white">{nextRun}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Last Run:</span>
                        <p className="font-medium text-slate-900 dark:text-white">{lastRun}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Total Runs:</span>
                        <p className="font-medium text-slate-900 dark:text-white">{schedule.runCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleSchedule(schedule.id, schedule.enabled)}
                      className={`p-2 rounded-lg transition-colors ${
                        schedule.enabled
                          ? 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400'
                          : 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400'
                      }`}
                      title={schedule.enabled ? 'Pause' : 'Start'}
                    >
                      {schedule.enabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Create Schedule
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Schedule Name (optional)
                </label>
                <input
                  type="text"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  placeholder="My Recipe Schedule"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Run Every (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10080"
                  value={intervalMinutes}
                  onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 1)}
                  placeholder="120"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {getScheduleDescription(intervalMinutes)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[30, 60, 120, 180, 360, 720, 1440].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleMinutesChange(mins)}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        intervalMinutes === mins
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {mins < 60 ? `${mins}m` : mins < 1440 ? `${mins / 60}h` : `${mins / 1440}d`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={newSchedule.enabled}
                  onChange={(e) => setNewSchedule({ ...newSchedule, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  ✅ Run first recipe now, then continue on schedule
                </label>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Note:</strong> Each scheduled run generates exactly <strong>1 recipe</strong> from the next pending spy data entry.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSchedule}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100]">
          <div className={`px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 ${
            toast.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {toast.type === 'success' ? '✅' : '❌'}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
