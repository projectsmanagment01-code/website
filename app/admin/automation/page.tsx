"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  RotateCcw,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Settings as SettingsIcon,
  TrendingUp,
} from "lucide-react";

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
}

interface RecentJob {
  id: string;
  name: string;
  state: string;
  progress: number;
  data: {
    automationId: string;
    recipeRowNumber: number;
    title?: string;
  };
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
}

export default function AutomationDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [rowNumber, setRowNumber] = useState("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.ok) {
          setIsAuthenticated(true);
          loadStats();
        } else {
          router.push("/admin/login");
        }
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/automation/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentJobs(data.recentJobs || []);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleStartAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rowNumber) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/automation/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rowNumber: parseInt(rowNumber),
          title: title || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Automation started! Job ID: ${data.jobId}`);
        setRowNumber("");
        setTitle("");
        loadStats();
      } else {
        const error = await response.json();
        alert(`Failed to start automation: ${error.message}`);
      }
    } catch (error) {
      alert("Failed to start automation");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "failed":
        return "text-red-600 bg-red-50";
      case "active":
        return "text-blue-600 bg-blue-50";
      case "waiting":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "active":
        return <Activity className="w-4 h-4 animate-pulse" />;
      case "waiting":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Recipe Automation
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Automated recipe generation from Google Sheets
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/admin/automation/settings")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm font-medium"
              >
                <SettingsIcon className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={() => router.push("/admin/automation/logs")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                Logs
              </button>
              <button
                onClick={() => router.push("/admin")}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium"
              >
                Back to Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Waiting</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.waiting || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.active || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.completed || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.failed || 0}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delayed</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.delayed || 0}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.total || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-gray-900" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Start Automation Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Start New Automation
              </h2>
              <form onSubmit={handleStartAutomation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Row Number *
                  </label>
                  <input
                    type="number"
                    value={rowNumber}
                    onChange={(e) => setRowNumber(e.target.value)}
                    placeholder="e.g., 5"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Row number in Google Sheets (1-indexed)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipe Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Chocolate Cake"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For logging purposes only
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !rowNumber}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-md font-medium"
                >
                  <Play className="w-4 h-4" />
                  {submitting ? "Starting..." : "Start Automation"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={loadStats}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refresh Stats
                </button>
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Jobs
                </h2>
              </div>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {recentJobs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No jobs yet. Start your first automation above!</p>
                  </div>
                ) : (
                  recentJobs.map((job) => (
                    <div key={job.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStateColor(
                                job.state
                              )}`}
                            >
                              {getStateIcon(job.state)}
                              {job.state.toUpperCase()}
                            </span>
                            {job.state === "active" && (
                              <span className="text-xs text-gray-500">
                                {job.progress}%
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {job.data.title || `Row ${job.data.recipeRowNumber}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Job ID: {job.id}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(job.timestamp)}
                          </p>
                          {job.failedReason && (
                            <p className="text-xs text-red-600 mt-1">
                              Error: {job.failedReason}
                            </p>
                          )}
                        </div>
                        {job.state === "active" && (
                          <div className="ml-4">
                            <div className="w-16 h-16">
                              <svg className="transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="3"
                                />
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#ea580c"
                                  strokeWidth="3"
                                  strokeDasharray={`${job.progress}, 100`}
                                />
                              </svg>
                              <p className="text-center text-xs font-medium text-gray-700 -mt-12">
                                {job.progress}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
