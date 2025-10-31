/**
 * StepTimeline Component  
 * Visual timeline showing step execution progress
 */

'use client';

interface StepTimelineProps {
  steps: Array<{
    stepNumber: number;
    stepName: string;
    status: string;
    durationMs: number | null;
  }>;
}

export default function StepTimeline({ steps }: StepTimelineProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-600';
      case 'FAILED':
        return 'bg-red-600';
      case 'RUNNING':
        return 'bg-blue-600';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {steps.map((step, index) => (
        <div key={step.stepNumber} className="flex items-center flex-shrink-0">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getStatusColor(step.status)}`}
              title={`${step.stepName} - ${step.status}`}
            >
              {step.stepNumber}
            </div>
            <span className="text-xs text-gray-600 mt-1 max-w-[60px] truncate" title={step.stepName}>
              {step.stepName.split(' ')[0]}
            </span>
            {step.durationMs && (
              <span className="text-xs text-gray-500 mt-0.5">
                {(step.durationMs / 1000).toFixed(1)}s
              </span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 ${steps[index + 1].status !== 'PENDING' ? 'bg-gray-300' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
