// Generation Statistics Component
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

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

interface GenerationStatsProps {
  stats: Stats;
}

export function GenerationStats({ stats }: GenerationStatsProps) {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const pendingJobs = stats.overview.totalJobs - stats.overview.completedJobs - stats.overview.failedJobs - stats.overview.processingJobs;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Image Generation Statistics</h3>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.overview.totalJobs}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                <p className={`text-2xl font-bold ${getSuccessRateColor(stats.overview.successRate)}`}>
                  {stats.overview.successRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Duration</p>
                <p className="text-2xl font-bold">{formatDuration(stats.overview.avgDurationMs)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Cron Jobs</p>
                <p className="text-2xl font-bold text-green-600">{stats.cronJobs.active}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Job Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Completed */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completed</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{stats.overview.completedJobs}</span>
                  <Badge variant="default">{stats.overview.totalJobs > 0 ? Math.round((stats.overview.completedJobs / stats.overview.totalJobs) * 100) : 0}%</Badge>
                </div>
              </div>
              <Progress 
                value={stats.overview.totalJobs > 0 ? (stats.overview.completedJobs / stats.overview.totalJobs) * 100 : 0} 
                className="h-2" 
              />
            </div>

            {/* Failed */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Failed</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{stats.overview.failedJobs}</span>
                  <Badge variant="destructive">{stats.overview.totalJobs > 0 ? Math.round((stats.overview.failedJobs / stats.overview.totalJobs) * 100) : 0}%</Badge>
                </div>
              </div>
              <Progress 
                value={stats.overview.totalJobs > 0 ? (stats.overview.failedJobs / stats.overview.totalJobs) * 100 : 0} 
                className="h-2" 
              />
            </div>

            {/* Processing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Processing</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{stats.overview.processingJobs}</span>
                  <Badge variant="secondary">{stats.overview.totalJobs > 0 ? Math.round((stats.overview.processingJobs / stats.overview.totalJobs) * 100) : 0}%</Badge>
                </div>
              </div>
              <Progress 
                value={stats.overview.totalJobs > 0 ? (stats.overview.processingJobs / stats.overview.totalJobs) * 100 : 0} 
                className="h-2" 
              />
            </div>

            {/* Pending */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pending</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{pendingJobs}</span>
                  <Badge variant="outline">{stats.overview.totalJobs > 0 ? Math.round((pendingJobs / stats.overview.totalJobs) * 100) : 0}%</Badge>
                </div>
              </div>
              <Progress 
                value={stats.overview.totalJobs > 0 ? (pendingJobs / stats.overview.totalJobs) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Cron Jobs Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Cron Jobs Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.cronJobs.total}
              </div>
              <p className="text-gray-600">Total Cron Jobs</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {stats.cronJobs.active}
                </div>
                <p className="text-sm text-green-700">Active</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600 mb-1">
                  {stats.cronJobs.inactive}
                </div>
                <p className="text-sm text-gray-700">Inactive</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Jobs</span>
                <Badge variant="default">
                  {stats.cronJobs.total > 0 ? Math.round((stats.cronJobs.active / stats.cronJobs.total) * 100) : 0}%
                </Badge>
              </div>
              <Progress 
                value={stats.cronJobs.total > 0 ? (stats.cronJobs.active / stats.cronJobs.total) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {stats.recentActivity}
              </div>
              <p className="text-gray-600">Jobs This Week</p>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${getSuccessRateColor(stats.overview.successRate)}`}>
                {stats.overview.successRate}%
              </div>
              <p className="text-gray-600">Success Rate</p>
              <div className="mt-2">
                {stats.overview.successRate >= 90 && (
                  <Badge variant="default">Excellent</Badge>
                )}
                {stats.overview.successRate >= 70 && stats.overview.successRate < 90 && (
                  <Badge variant="secondary">Good</Badge>
                )}
                {stats.overview.successRate < 70 && (
                  <Badge variant="destructive">Needs Attention</Badge>
                )}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {formatDuration(stats.overview.avgDurationMs)}
              </div>
              <p className="text-gray-600">Avg Processing Time</p>
              <div className="mt-2">
                {stats.overview.avgDurationMs < 300000 && (
                  <Badge variant="default">Fast</Badge>
                )}
                {stats.overview.avgDurationMs >= 300000 && stats.overview.avgDurationMs < 600000 && (
                  <Badge variant="secondary">Normal</Badge>
                )}
                {stats.overview.avgDurationMs >= 600000 && (
                  <Badge variant="outline">Slow</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}