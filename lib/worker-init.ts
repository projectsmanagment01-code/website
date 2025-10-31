/**
 * Auto-initialize worker on server startup
 */

import { createAutomationWorker } from '@/automation/queue/automation.worker';
import { Worker } from 'bullmq';

let workerInstance: Worker | null = null;

export function initializeWorker() {
  if (typeof window !== 'undefined') {
    // Client-side, skip
    return null;
  }

  if (workerInstance && !workerInstance.closing) {
    console.log('Worker already running');
    return workerInstance;
  }

  try {
    workerInstance = createAutomationWorker();
    console.log('✅ Automation worker initialized successfully');
    return workerInstance;
  } catch (error) {
    console.error('❌ Failed to initialize worker:', error);
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
