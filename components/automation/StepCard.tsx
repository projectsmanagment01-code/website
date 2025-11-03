'use client';

import React from 'react';
import { Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface Step {
  id: string;
  stepNumber: number;
  stepName: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  startTime?: Date | null;
  endTime?: Date | null;
  durationMs?: number | null;
  errorMessage?: string | null;
  output?: any;
  costUsd?: number | null;
}

interface StepCardProps {
  step: Step;
  jobId: string;
}

export default function StepCard({ step, jobId }: StepCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'RUNNING':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-50 border-green-200';
      case 'FAILED':
        return 'bg-red-50 border-red-200';
      case 'RUNNING':
        return 'bg-blue-50 border-blue-200';
      case 'PENDING':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString();
  };

  return (
    <div className={`border rounded-lg p-4 shadow-sm ${getStatusBgColor(step.status)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getStatusIcon(step.status)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Step {step.stepNumber}: {step.stepName}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                step.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                step.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                step.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {step.status}
              </span>
            </div>
            
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Started:</span>
                <span className="ml-1 text-gray-900">{formatTime(step.startTime)}</span>
              </div>
              <div>
                <span className="text-gray-500">Ended:</span>
                <span className="ml-1 text-gray-900">{formatTime(step.endTime)}</span>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <span className="ml-1 text-gray-900">{formatDuration(step.durationMs)}</span>
              </div>
              <div>
                <span className="text-gray-500">Cost:</span>
                <span className="ml-1 text-gray-900">
                  {step.costUsd ? `$${parseFloat(step.costUsd.toString()).toFixed(4)}` : '-'}
                </span>
              </div>
            </div>

            {step.errorMessage && (
              <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded">
                <p className="text-sm font-medium text-red-800">Error:</p>
                <p className="text-sm text-red-700 mt-1">{step.errorMessage}</p>
              </div>
            )}

            {step.output && step.status === 'SUCCESS' && (
              <div className="mt-3">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    View Output
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 border border-gray-200 rounded">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                      {typeof step.output === 'string' ? step.output : JSON.stringify(step.output, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>

        {step.status === 'FAILED' && (
          <button className="ml-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Retry Step
          </button>
        )}
      </div>
    </div>
  );
}