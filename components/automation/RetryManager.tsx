"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Loader2, DollarSign } from 'lucide-react';

interface RetryEntry {
  id: string;
  spyTitle: string;
  status: string;
  failedStep: string | null;
  failedAt: Date | null;
  lastSuccessfulStep: string | null;
  generationAttempts: number;
  generationError: string | null;
  hasImages: boolean;
  hasSEO: boolean;
  resumeSummary: string;
  createdAt: Date;
}

interface RetryButtonProps {
  entry: RetryEntry;
  onRetrySuccess?: () => void;
}

export function RetryButton({ entry, onRetrySuccess }: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleRetry = async () => {
    setIsRetrying(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/automation/pipeline/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spyDataId: entry.id })
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: `✅ Successfully completed! Recipe ID: ${data.result.recipeId}`
        });
        onRetrySuccess?.();
      } else {
        setResult({
          success: false,
          message: `❌ Retry failed: ${data.error || data.result?.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{entry.spyTitle}</CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
                  {entry.failedStep || 'Unknown Step'}
                </span>
                <span className="text-gray-500">
                  Attempt #{entry.generationAttempts}
                </span>
                {entry.failedAt && (
                  <span className="text-gray-500">
                    Failed: {new Date(entry.failedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </CardDescription>
          </div>
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            variant="default"
            size="sm"
            className="ml-4"
          >
            {isRetrying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry from Checkpoint
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Checkpoint Status */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress Checkpoints:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* SEO Status */}
            <div className={`p-3 rounded-lg border-2 ${
              entry.hasSEO 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-300 bg-gray-50 dark:bg-gray-800'
            }`}>
              <div className="flex items-center gap-2">
                {entry.hasSEO ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm font-medium">SEO Generated</span>
              </div>
            </div>

            {/* Images Status */}
            <div className={`p-3 rounded-lg border-2 ${
              entry.hasImages 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-300 bg-gray-50 dark:bg-gray-800'
            }`}>
              <div className="flex items-center gap-2">
                {entry.hasImages ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">4 Images Saved</span>
                    <DollarSign className="h-4 w-4 text-green-600" title="No regeneration cost!" />
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium">Images Pending</span>
                  </>
                )}
              </div>
            </div>

            {/* Recipe Status */}
            <div className="p-3 rounded-lg border-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Recipe Failed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resume Summary */}
        {entry.hasImages && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <DollarSign className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>💰 Money Saver:</strong> Images already generated! Retry will skip image generation 
              and start directly from recipe generation. No additional image costs!
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
          {entry.resumeSummary}
        </div>

        {/* Error Message */}
        {entry.generationError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Last Error:</strong> {entry.generationError}
            </AlertDescription>
          </Alert>
        )}

        {/* Retry Result */}
        {result && (
          <Alert className={result.success ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={result.success ? 'text-green-800 dark:text-green-200' : ''}>
              {result.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

interface RetryManagerProps {
  entries: RetryEntry[];
  onRefresh?: () => void;
}

export function RetryManager({ entries, onRefresh }: RetryManagerProps) {
  if (entries.length === 0) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          No failed entries to retry. All automations completed successfully! 🎉
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Failed Automations - Retry Manager</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {entries.length} failed {entries.length === 1 ? 'entry' : 'entries'} can be retried from last checkpoint
          </p>
        </div>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh List
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <RetryButton key={entry.id} entry={entry} onRetrySuccess={onRefresh} />
        ))}
      </div>
    </div>
  );
}
