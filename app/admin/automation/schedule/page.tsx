'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronRight, 
  Calendar, 
  Clock,
  Save,
  AlertCircle
} from 'lucide-react';

interface ScheduleConfig {
  id: string;
  enabled: boolean;
  scheduleType: string;
  cronExpression?: string;
  timeOfDay?: string;
  dayOfWeek?: number;
  lastRun?: string;
  nextRun?: string;
}

export default function SchedulePage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(null);
  const [scheduleType, setScheduleType] = useState('manual');
  const [timeOfDay, setTimeOfDay] = useState('09:00');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [cronExpression, setCronExpression] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const response = await fetch('/api/admin/automation/schedule');
      if (response.ok) {
        const data = await response.json();
        setSchedule(data.schedule);
        setScheduleType(data.schedule.scheduleType || 'manual');
        setTimeOfDay(data.schedule.timeOfDay || '09:00');
        setDayOfWeek(data.schedule.dayOfWeek ?? 1);
        setCronExpression(data.schedule.cronExpression || '');
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/automation/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleType,
          timeOfDay: scheduleType === 'daily' ? timeOfDay : null,
          dayOfWeek: scheduleType === 'weekly' ? dayOfWeek : null,
          cronExpression: scheduleType === 'custom' ? cronExpression : null,
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSchedule(data.schedule);
        setMessage({ type: 'success', text: 'Schedule configuration saved successfully!' });
      } else {
        throw new Error(data.error || 'Failed to save schedule');
      }
    } catch (err: any) {
      console.error('Failed to save schedule:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save schedule configuration' });
    } finally {
      setIsSaving(false);
    }
  };

  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/automation"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Automation
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                Schedule Configuration
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {message && (
          <div className={`rounded-md p-4 flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`} />
            <div>
              <p className={`font-medium text-sm ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.type === 'success' ? 'Success' : 'Error'}
              </p>
              <p className={`text-sm mt-1 ${
                message.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Schedule Type Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-700" />
            <h2 className="text-base font-semibold text-gray-900">Schedule Type</h2>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="scheduleType"
                value="manual"
                checked={scheduleType === 'manual'}
                onChange={(e) => setScheduleType(e.target.value)}
                className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              />
              <div>
                <p className="font-medium text-sm text-gray-900">Manual Only</p>
                <p className="text-xs text-gray-500">Start automation manually from dashboard</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="scheduleType"
                value="hourly"
                checked={scheduleType === 'hourly'}
                onChange={(e) => setScheduleType(e.target.value)}
                className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              />
              <div>
                <p className="font-medium text-sm text-gray-900">Hourly</p>
                <p className="text-xs text-gray-500">Run automation every hour</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="scheduleType"
                value="daily"
                checked={scheduleType === 'daily'}
                onChange={(e) => setScheduleType(e.target.value)}
                className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              />
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">Daily</p>
                <p className="text-xs text-gray-500 mb-3">Run automation once per day</p>
                {scheduleType === 'daily' && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <input
                      type="time"
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    />
                  </div>
                )}
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="scheduleType"
                value="weekly"
                checked={scheduleType === 'weekly'}
                onChange={(e) => setScheduleType(e.target.value)}
                className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              />
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">Weekly</p>
                <p className="text-xs text-gray-500 mb-3">Run automation once per week</p>
                {scheduleType === 'weekly' && (
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <option key={day} value={day}>
                        {getDayName(day)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="scheduleType"
                value="custom"
                checked={scheduleType === 'custom'}
                onChange={(e) => setScheduleType(e.target.value)}
                className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              />
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">Custom Cron Expression</p>
                <p className="text-xs text-gray-500 mb-3">Advanced: Use custom cron syntax</p>
                {scheduleType === 'custom' && (
                  <div>
                    <input
                      type="text"
                      value={cronExpression}
                      onChange={(e) => setCronExpression(e.target.value)}
                      placeholder="0 9 * * *"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:border-gray-900 font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Example: <code className="bg-gray-100 px-1 py-0.5 rounded">0 9 * * *</code> = Every day at 9:00 AM
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Current Schedule Info */}
        {schedule && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Current Schedule</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                <p className="font-medium text-gray-900 mt-1">
                  {schedule.enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Type</p>
                <p className="font-medium text-gray-900 mt-1 capitalize">{schedule.scheduleType}</p>
              </div>
              {schedule.lastRun && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Last Run</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {new Date(schedule.lastRun).toLocaleString()}
                  </p>
                </div>
              )}
              {schedule.nextRun && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Next Run</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {new Date(schedule.nextRun).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Configuration
              </>
            )}
          </button>
          <Link
            href="/admin/automation"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
