/**
 * StepCard Component
 * Displays detailed information about a single automation step
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Loader2, Clock, DollarSign, Code, RefreshCw } from 'lucide-react';

interface StepCardProps {
  step: {
    id: string;
    stepNumber: number;
    stepName: string;
    status: string;
    startedAt: Date;
    completedAt: Date | null;
    durationMs: number | null;
    inputData: any;
    outputData: any;
    config: any;
    error: string | null;
    stackTrace: string | null;
    tokensUsed: number | null;
    costUsd: any;
  };
  jobId: string;
}

export default function StepCard({ step, jobId }: StepCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [showOutput, setShowOutput] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  
  const getStatusColor = () => {
    switch (step.status) {
      case 'SUCCESS':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'FAILED':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'RUNNING':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (step.status) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4" />;
      case 'RUNNING':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded shadow-md overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor()} border`}>
              <span className="text-xs font-bold">{step.stepNumber}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{step.stepName}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                {step.durationMs && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {(step.durationMs / 1000).toFixed(2)}s
                  </span>
                )}
                {step.tokensUsed && (
                  <span className="flex items-center gap-1">
                    <Code className="w-3 h-3" />
                    {step.tokensUsed} tokens
                  </span>
                )}
                {step.costUsd && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${parseFloat(step.costUsd.toString()).toFixed(4)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded text-xs font-semibold border ${getStatusColor()} flex items-center gap-1`}>
              {getStatusIcon()}
              {step.status}
            </span>
            {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
          {/* Error Display */}
          {step.status === 'FAILED' && step.error && (
            <div className="bg-red-50 border border-red-300 rounded p-3">
              <p className="text-sm font-semibold text-red-900 mb-1">Error:</p>
              <p className="text-sm text-red-700 font-mono">{step.error}</p>
              {step.stackTrace && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer hover:underline">
                    View stack trace
                  </summary>
                  <pre className="text-xs text-red-700 bg-red-100 p-2 rounded mt-2 overflow-auto max-h-40">
                    {step.stackTrace}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => { setShowInput(true); setShowOutput(false); setShowConfig(false); }}
              className={`px-3 py-2 text-sm font-semibold transition-colors ${
                showInput ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Input Data
            </button>
            <button
              onClick={() => { setShowInput(false); setShowOutput(true); setShowConfig(false); }}
              className={`px-3 py-2 text-sm font-semibold transition-colors ${
                showOutput ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Output Data
            </button>
            <button
              onClick={() => { setShowInput(false); setShowOutput(false); setShowConfig(true); }}
              className={`px-3 py-2 text-sm font-semibold transition-colors ${
                showConfig ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Configuration
            </button>
          </div>

          {/* Data Display */}
          {showInput && (
            <div className="bg-white border border-gray-200 rounded p-3">
              <pre className="text-xs overflow-auto max-h-96 text-gray-800">
                {JSON.stringify(step.inputData, null, 2)}
              </pre>
            </div>
          )}

          {showOutput && (
            <div className="bg-white border border-gray-200 rounded p-3">
              <pre className="text-xs overflow-auto max-h-96 text-gray-800">
                {JSON.stringify(step.outputData, null, 2)}
              </pre>
            </div>
          )}

          {showConfig && (
            <div className="bg-white border border-gray-200 rounded p-3">
              <pre className="text-xs overflow-auto max-h-96 text-gray-800">
                {JSON.stringify(step.config, null, 2)}
              </pre>
            </div>
          )}

          {/* Actions */}
          {step.status === 'FAILED' && (
            <div className="flex gap-2 pt-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-semibold shadow-md flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry This Step
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
