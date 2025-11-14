'use client';

import React from 'react';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';

interface Step {
  id: string;
  stepNumber: number;
  stepName: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  startTime?: Date | null;
  endTime?: Date | null;
  durationMs?: number | null;
}

interface StepTimelineProps {
  steps: Step[];
}

export default function StepTimeline({ steps }: StepTimelineProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-500';
      case 'FAILED':
        return 'bg-red-500';
      case 'RUNNING':
        return 'bg-blue-500';
      case 'PENDING':
        return 'bg-gray-300';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-white" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-white" />;
      case 'RUNNING':
        return <Loader2 className="w-4 h-4 text-white animate-spin" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-shrink-0">
            {/* Step Circle */}
            <div className="relative flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(step.status)} shadow-sm`}
                title={`Step ${step.stepNumber}: ${step.stepName}`}
              >
                {getStatusIcon(step.status)}
              </div>
              
              {/* Step Info */}
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center min-w-max">
                <p className="text-xs font-medium text-gray-900 truncate max-w-20">
                  {step.stepName}
                </p>
                {step.durationMs && (
                  <p className="text-xs text-gray-500">
                    {formatDuration(step.durationMs)}
                  </p>
                )}
              </div>
            </div>

            {/* Connection Line */}
            {index < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-gray-300 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600">Success</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600">Failed</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-600">Running</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <span className="text-gray-600">Pending</span>
        </div>
      </div>
    </div>
  );
}