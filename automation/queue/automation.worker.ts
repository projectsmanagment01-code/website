/**
 * BullMQ Worker
 * Background worker process that executes automation jobs
 */

import { Worker } from 'bullmq';
import { queueConfig } from '../config/queue.config';
import { logger } from '../utils/logger';
import {
  processAutomationJob,
  onJobCompleted,
  onJobFailed,
  onJobStalled,
  onShutdown,
} from './automation.processor';
import { AutomationJobData, AutomationJobResult } from './automation.queue';

/**
 * Create and start the automation worker
 */
export function createAutomationWorker(): Worker<
  AutomationJobData,
  AutomationJobResult
> {
  const worker = new Worker<AutomationJobData, AutomationJobResult>(
    'recipe-automation',
    processAutomationJob,
    {
      ...queueConfig,
      concurrency: 1, // Process one recipe at a time
      lockDuration: 30 * 60 * 1000, // 30 minutes lock
      stalledInterval: 5 * 60 * 1000, // Check for stalled jobs every 5 minutes
      maxStalledCount: 2,
    }
  );

  // Setup event listeners
  worker.on('completed', async (job) => {
    await onJobCompleted(job, job.returnvalue);
  });

  worker.on('failed', async (job, error) => {
    if (job) {
      await onJobFailed(job, error);
    }
  });

  worker.on('stalled', async (jobId, prev) => {
    const job = await worker.getJob(jobId);
    if (job) {
      await onJobStalled(jobId, job.data);
    }
  });

  worker.on('error', (error) => {
    logger.error('Worker error', error);
  });

  worker.on('ready', () => {
    logger.info('Worker is ready and waiting for jobs');
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await worker.close();
    await onShutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await worker.close();
    await onShutdown();
    process.exit(0);
  });

  logger.info('Automation worker started', {
    concurrency: 1,
    lockDuration: '30 minutes',
  });

  return worker;
}

/**
 * Start worker if run directly
 */
if (require.main === module) {
  createAutomationWorker();
}
