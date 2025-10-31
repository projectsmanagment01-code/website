/**
 * Job Detail Page
 * Shows step-by-step execution details for an automation job
 */

import { Prisma, PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { ChevronLeft, Clock, CheckCircle2, XCircle, Loader2, Play } from 'lucide-react';
import StepCard from '@/components/automation/StepCard';
import StepTimeline from '@/components/automation/StepTimeline';

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const { jobId } = await params;

  // Fetch automation job
  const job = await prisma.recipeAutomation.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
            <p className="text-red-900 font-semibold">Job not found</p>
            <Link href="/admin/automation" className="text-red-700 hover:underline mt-2 inline-block">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch step logs
  const steps = await prisma.automationStepLog.findMany({
    where: { automationId: jobId },
    orderBy: { stepNumber: 'asc' },
  });

  // Calculate statistics
  const totalDuration = steps.reduce((sum, step) => sum + (step.durationMs || 0), 0);
  const successCount = steps.filter(s => s.status === 'SUCCESS').length;
  const failedCount = steps.filter(s => s.status === 'FAILED').length;
  const totalCost = steps.reduce((sum, step) => sum + parseFloat(step.costUsd?.toString() || '0'), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/automation"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div className="h-5 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">
                {job.spyTitle || 'Untitled Recipe'}
              </h1>
            </div>
            
            {/* Status Badge */}
            <div className={`px-3 py-1.5 rounded text-sm font-semibold ${
              job.status === 'SUCCESS' ? 'bg-green-100 text-green-700 border border-green-300' :
              job.status === 'FAILED' ? 'bg-red-100 text-red-700 border border-red-300' :
              job.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
              'bg-gray-100 text-gray-700 border border-gray-300'
            }`}>
              {job.status === 'PROCESSING' && <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />}
              {job.status === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
              {job.status === 'FAILED' && <XCircle className="w-4 h-4 inline mr-1" />}
              {job.status}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-200 rounded p-4 shadow-md">
            <p className="text-xs font-semibold text-gray-600 uppercase">Total Duration</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {(totalDuration / 1000).toFixed(1)}s
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded p-4 shadow-md">
            <p className="text-xs font-semibold text-gray-600 uppercase">Steps Completed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {successCount}/{steps.length}
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded p-4 shadow-md">
            <p className="text-xs font-semibold text-gray-600 uppercase">Failed Steps</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {failedCount}
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded p-4 shadow-md">
            <p className="text-xs font-semibold text-gray-600 uppercase">Total Cost</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${totalCost.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Timeline Overview */}
        {steps.length > 0 && (
          <div className="bg-white border border-gray-200 rounded p-4 shadow-md">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Execution Timeline</h2>
            <StepTimeline steps={steps} />
          </div>
        )}

        {/* Step Details */}
        <div className="space-y-3">
          {steps.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded p-8 text-center shadow-md">
              <p className="text-gray-600">No step logs available yet.</p>
              <p className="text-sm text-gray-500 mt-1">
                Steps will appear here as the automation runs.
              </p>
            </div>
          ) : (
            steps.map((step) => (
              <StepCard key={step.id} step={step} jobId={jobId} />
            ))
          )}
        </div>

        {/* Retry Job Button */}
        {job.status === 'FAILED' && (
          <div className="bg-white border border-gray-200 rounded p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Job Failed</p>
                <p className="text-sm text-gray-600 mt-1">
                  You can retry the entire job or individual steps above.
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2">
                <Play className="w-4 h-4" />
                Retry Job
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
