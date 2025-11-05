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
        alert('✅ Schedule created successfully!');
        setShowCreateModal(false);
        setNewSchedule({ name: '', cronExpression: '0 */2 * * *', enabled: false });
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
      console.log('🔄 Toggling schedule:', { id, currentEnabled, newState: !currentEnabled });
      
      const response = await fetch('/api/admin/automation/pipeline/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled: !currentEnabled })
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok) {
        console.log('✅ Schedule toggled successfully');
        loadSchedules();
      } else {
        console.error('❌ Failed to toggle:', data);
        alert(`Failed to toggle schedule: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Failed to toggle schedule:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const response = await fetch(`/api/admin/automation/pipeline/schedule?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadSchedules();
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const runManualPipeline = async () => {
    if (!confirm('Generate 1 recipe from next pending spy data?')) return;

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
        alert(`✅ Recipe created: ${result.recipeUrl}`);
      } else {
        alert(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    }
  };

  const cronPresets = [
    { label: 'Every 2 hours', value: '0 */2 * * *' },
    { label: 'Every 4 hours', value: '0 */4 * * *' },
    { label: 'Every 6 hours', value: '0 */6 * * *' },
    { label: 'Daily at 9 AM', value: '0 9 * * *' },
    { label: 'Twice daily (9AM & 9PM)', value: '0 9,21 * * *' },
    { label: 'Every hour', value: '0 * * * *' },
  ];

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
                          {schedule.cronExpression || 'Custom Schedule'}
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
                  Schedule (Cron Expression)
                </label>
                <select
                  value={newSchedule.cronExpression}
                  onChange={(e) => setNewSchedule({ ...newSchedule, cronExpression: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {cronPresets.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label} ({preset.value})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={newSchedule.enabled}
                  onChange={(e) => setNewSchedule({ ...newSchedule, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="enabled" className="text-sm text-slate-700 dark:text-slate-300">
                  Start immediately
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
    </div>
  );
}
