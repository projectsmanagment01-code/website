// Cron Jobs List Component
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Play, Pause, Settings, Trash2, RefreshCw, Calendar, Clock } from 'lucide-react';

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

interface CronJobListProps {
  cronJobs: CronJob[];
  onToggle: (jobId: string, action: 'start' | 'stop' | 'run-now') => void;
  onDelete: (jobId: string) => void;
  onRefresh: () => void;
}

export function CronJobList({ cronJobs, onToggle, onDelete, onRefresh }: CronJobListProps) {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getSuccessRate = (job: CronJob) => {
    if (job.totalRuns === 0) return 0;
    return Math.round((job.successfulRuns / job.totalRuns) * 100);
  };

  const getJobStatusCounts = (job: CronJob) => {
    const counts = {
      completed: 0,
      processing: 0,
      failed: 0,
      pending: 0
    };

    job.jobs.forEach(j => {
      if (counts.hasOwnProperty(j.status)) {
        counts[j.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cron Jobs ({cronJobs.length})</h3>
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {cronJobs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Cron Jobs Configured</h3>
            <p className="text-gray-500 mb-4">
              Create your first automated image generation schedule to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {cronJobs.map((job) => {
            const statusCounts = getJobStatusCounts(job);
            const successRate = getSuccessRate(job);

            return (
              <Card key={job.id} className={selectedJob === job.id ? 'border-blue-500' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{job.name}</h4>
                        <Badge variant={job.isActive ? 'default' : 'secondary'}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {job.aiProvider}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{job.schedule}</span>
                        </div>
                        <div>
                          <span className="font-medium">Batch Size:</span> {job.batchSize}
                        </div>
                        <div>
                          <span className="font-medium">Total Runs:</span> {job.totalRuns}
                        </div>
                        <div>
                          <span className="font-medium">Success Rate:</span> {successRate}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onToggle(job.id, 'run-now')}
                        title="Run Now"
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onToggle(job.id, job.isActive ? 'stop' : 'start')}
                        title={job.isActive ? 'Stop' : 'Start'}
                      >
                        {job.isActive ? 
                          <Pause className="w-3 h-3" /> : 
                          <Play className="w-3 h-3" />
                        }
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                        title="View Details"
                      >
                        <Settings className="w-3 h-3" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(job.id)}
                        title="Delete"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Job Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
                      <div className="text-sm text-green-700">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{statusCounts.processing}</div>
                      <div className="text-sm text-yellow-700">Processing</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{statusCounts.failed}</div>
                      <div className="text-sm text-red-700">Failed</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">{statusCounts.pending}</div>
                      <div className="text-sm text-gray-700">Pending</div>
                    </div>
                  </div>

                  {/* Schedule Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Last Run:</span>
                      <div className="text-gray-600">{formatDate(job.lastRun)}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Next Run:</span>
                      <div className="text-gray-600">{formatDate(job.nextRun)}</div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedJob === job.id && (
                    <div className="mt-6 pt-4 border-t">
                      <h5 className="font-semibold mb-3">Configuration Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">AI Model:</span>
                          <div className="text-gray-600">{job.aiModel}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Total Jobs:</span>
                          <div className="text-gray-600">{job._count.jobs}</div>
                        </div>
                      </div>

                      {job.jobs.length > 0 && (
                        <div className="mt-4">
                          <h6 className="font-medium mb-2">Recent Jobs</h6>
                          <div className="space-y-2">
                            {job.jobs.slice(0, 3).map((jobItem) => (
                              <div key={jobItem.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="text-sm">
                                  Job {jobItem.id.slice(-8)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={
                                    jobItem.status === 'completed' ? 'default' :
                                    jobItem.status === 'failed' ? 'destructive' :
                                    jobItem.status === 'processing' ? 'secondary' : 'outline'
                                  }>
                                    {jobItem.status}
                                  </Badge>
                                  {jobItem.status === 'processing' && (
                                    <span className="text-xs text-gray-500">{jobItem.progress}%</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}