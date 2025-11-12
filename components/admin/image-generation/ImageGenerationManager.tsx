// Main image generation management component
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Play, Pause, BarChart3, Calendar } from 'lucide-react';
import { CronJobList } from './CronJobList';
import { JobsList } from './JobsList';
import { CronJobForm } from './CronJobForm';
import { GenerationStats } from './GenerationStats';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  batchSize: number;
  aiProvider: string;
  aiModel: string;
  jobs: Array<{
    id: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    progress: number;
  }>;
  _count: {
    jobs: number;
  };
}

interface GenerationJob {
  id: string;
  status: string;
  step: string;
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  cronJob: {
    name: string;
    schedule: string;
  };
  spyData: {
    spyTitle: string;
    seoKeyword?: string;
  };
  stepLogs: Array<{
    id: string;
    stepName: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    durationMs?: number;
  }>;
}

interface Stats {
  overview: {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    processingJobs: number;
    successRate: number;
    avgDurationMs: number;
  };
  cronJobs: {
    total: number;
    active: number;
    inactive: number;
  };
  recentActivity: number;
}

export function ImageGenerationManager() {
  const [activeTab, setActiveTab] = useState('overview');
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [cronJobsRes, jobsRes, statsRes] = await Promise.all([
        fetch('/api/admin/image-generation/cron-jobs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }),
        fetch('/api/admin/image-generation/jobs?limit=50', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }),
        fetch('/api/admin/image-generation/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
      ]);

      if (cronJobsRes.ok) {
        const cronJobsData = await cronJobsRes.json();
        setCronJobs(cronJobsData.cronJobs);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCronJob = async (jobData: any) => {
    try {
      const response = await fetch('/api/admin/image-generation/cron-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        await loadData();
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        alert(`Error creating cron job: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating cron job:', error);
      alert('Failed to create cron job');
    }
  };

  const handleToggleCronJob = async (jobId: string, action: 'start' | 'stop' | 'run-now') => {
    try {
      const response = await fetch(`/api/admin/image-generation/cron-jobs/${jobId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        await loadData();
      } else {
        const error = await response.json();
        alert(`Error ${action}ing cron job: ${error.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing cron job:`, error);
      alert(`Failed to ${action} cron job`);
    }
  };

  const handleDeleteCronJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this cron job?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/image-generation/cron-jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        await loadData();
      } else {
        const error = await response.json();
        alert(`Error deleting cron job: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting cron job:', error);
      alert('Failed to delete cron job');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading image generation workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Image Generation Workflow</h2>
          <p className="text-gray-600">Automated image generation for Pinterest spy data</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Cron Job
        </Button>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Cron Jobs</p>
                  <p className="text-2xl font-bold text-green-600">{stats.cronJobs.active}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.overview.successRate}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.overview.processingJobs}</p>
                </div>
                <Settings className="w-8 h-8 text-yellow-600 animate-spin" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-700">{stats.overview.totalJobs}</p>
                </div>
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">#{stats.overview.totalJobs}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cron-jobs">Cron Jobs ({cronJobs.length})</TabsTrigger>
          <TabsTrigger value="jobs">Generation Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Cron Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Cron Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {cronJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{job.name}</p>
                      <p className="text-sm text-gray-600">{job.schedule}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={job.isActive ? 'default' : 'secondary'}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleCronJob(job.id, job.isActive ? 'stop' : 'start')}
                      >
                        {job.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                ))}
                {cronJobs.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No cron jobs configured</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Generation Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border-b last:border-0">
                    <div>
                      <p className="font-medium truncate">{job.spyData.spyTitle}</p>
                      <p className="text-sm text-gray-600">{job.cronJob.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'failed' ? 'destructive' :
                        job.status === 'processing' ? 'secondary' : 'outline'
                      }>
                        {job.status}
                      </Badge>
                      {job.status === 'processing' && (
                        <span className="text-sm text-gray-500">{job.progress}%</span>
                      )}
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No generation jobs yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cron-jobs">
          <CronJobList
            cronJobs={cronJobs}
            onToggle={handleToggleCronJob}
            onDelete={handleDeleteCronJob}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="jobs">
          <JobsList
            jobs={jobs}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="stats">
          {stats && <GenerationStats stats={stats} />}
        </TabsContent>
      </Tabs>

      {/* Create Cron Job Modal */}
      {showCreateForm && (
        <CronJobForm
          onSubmit={handleCreateCronJob}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}