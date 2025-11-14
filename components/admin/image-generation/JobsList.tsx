// Generation Jobs List Component
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search, Eye, RotateCcw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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

interface JobsListProps {
  jobs: GenerationJob[];
  onRefresh: () => void;
}

export function JobsList({ jobs, onRefresh }: JobsListProps) {
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  // Update filtered jobs when jobs or filters change
  useState(() => {
    let filtered = jobs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.spyData.spyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.cronJob.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.spyData.seoKeyword && job.spyData.seoKeyword.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const duration = end.getTime() - start.getTime();
    
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStepProgress = (job: GenerationJob) => {
    const stepOrder = [
      'prompt_generation',
      'image_download', 
      'image_preprocessing',
      'image_generation',
      'upload',
      'completed'
    ];
    
    const currentStepIndex = stepOrder.indexOf(job.step);
    return Math.max(0, (currentStepIndex / (stepOrder.length - 1)) * 100);
  };

  const handleRetry = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/image-generation/jobs/${jobId}/retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        onRefresh();
      } else {
        const error = await response.json();
        alert(`Error retrying job: ${error.error}`);
      }
    } catch (error) {
      console.error('Error retrying job:', error);
      alert('Failed to retry job');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Generation Jobs ({filteredJobs.length})</h3>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Jobs Found</h3>
            <p className="text-gray-500">
              {jobs.length === 0 
                ? 'No generation jobs have been created yet.'
                : 'No jobs match your current filters.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className={selectedJob === job.id ? 'border-blue-500' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(job.status)}
                      <h4 className="text-lg font-semibold truncate">{job.spyData.spyTitle}</h4>
                      <Badge variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'failed' ? 'destructive' :
                        job.status === 'processing' ? 'secondary' : 'outline'
                      }>
                        {job.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Cron Job:</span> {job.cronJob.name}
                      {job.spyData.seoKeyword && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="font-medium">Keyword:</span> {job.spyData.seoKeyword}
                        </>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {job.status === 'processing' && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Step: {job.step.replace('_', ' ')}</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}

                    {/* Error Message */}
                    {job.error && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                        <p className="text-sm text-red-700 font-medium">Error:</p>
                        <p className="text-sm text-red-600">{job.error}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                      title="View Details"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>

                    {job.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetry(job.id)}
                        title="Retry Job"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Job Timing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Started:</span>
                    <div>{formatDate(job.startedAt)}</div>
                  </div>
                  {job.completedAt && (
                    <div>
                      <span className="font-medium">Completed:</span>
                      <div>{formatDate(job.completedAt)}</div>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Duration:</span>
                    <div>{formatDuration(job.startedAt, job.completedAt)}</div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedJob === job.id && job.stepLogs.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h5 className="font-semibold mb-3">Step Details</h5>
                    <div className="space-y-2">
                      {job.stepLogs.map((step, index) => (
                        <div key={step.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{step.stepName.replace('_', ' ')}</div>
                              <div className="text-sm text-gray-500">
                                Started: {formatDate(step.startedAt)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {step.durationMs && (
                              <span className="text-sm text-gray-500">
                                {Math.round(step.durationMs / 1000)}s
                              </span>
                            )}
                            <Badge variant={
                              step.status === 'completed' ? 'default' :
                              step.status === 'failed' ? 'destructive' :
                              step.status === 'running' ? 'secondary' : 'outline'
                            }>
                              {step.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}