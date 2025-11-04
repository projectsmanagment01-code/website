/**
 * Auto-initialize worker on server startup
 * NOTE: Old worker system removed. Pipeline jobs worker starts automatically.
 */

import { Worker } from 'bullmq';
import { pipelineWorker } from '@/automation/jobs/pipeline-jobs';

let workerInstance: Worker | null = null;

export function initializeWorker() {
  if (typeof window !== 'undefined') {
    // Client-side, skip
    return null;
  }

  if (workerInstance && !workerInstance.closing) {
    console.log('Pipeline worker already running');
    return workerInstance;
  }

  try {
    // Use the new pipeline worker
    workerInstance = pipelineWorker;
    console.log('✅ Pipeline worker initialized successfully');
    return workerInstance;
  } catch (error) {
    console.error('❌ Failed to initialize pipeline worker:', error);
    return null;
  }
}

export function getWorkerInstance() {
  return workerInstance;
}

// Auto-start on module load (server-side only)
if (typeof window === 'undefined') {
  initializeWorker();
}
