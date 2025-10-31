/**
 * BullMQ Queue for Recipe Automation
 * Handles job creation, scheduling, and monitoring
 */

import { Queue, QueueEvents } from 'bullmq';
import { queueConfig } from '../config/queue.config';
import { logger } from '../utils/logger';
import { WorkflowContext } from '../types/workflow.types';

export interface AutomationJobData {
  automationId: string;
  recipeRowNumber: number;
  title?: string;
}

export interface AutomationJobResult {
  automationId: string;
  status: 'COMPLETED' | 'FAILED';
  recipeId?: string;
  recipeUrl?: string;
  error?: string;
}

/**
 * Main automation queue
 */
export const automationQueue = new Queue<AutomationJobData, AutomationJobResult>(
  'recipe-automation',
  queueConfig
);

/**
 * Queue events for monitoring
 */
export const automationQueueEvents = new QueueEvents(
  'recipe-automation',
  queueConfig
);

/**
 * Add a new recipe automation job to the queue
 */
export async function addAutomationJob(
  automationId: string,
  recipeRowNumber: number,
  title?: string
): Promise<string> {
  logger.info(`Adding automation job for recipe row ${recipeRowNumber}`, {
    automationId,
    recipeRowNumber,
    title,
  });

  try {
    const job = await automationQueue.add(
      'process-recipe',
      {
        automationId,
        recipeRowNumber,
        title,
      },
      {
        jobId: automationId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000, // Start with 5 seconds
        },
        removeOnComplete: {
          age: 7 * 24 * 3600, // Keep completed jobs for 7 days
          count: 1000, // Keep last 1000 completed jobs
        },
        removeOnFail: {
          age: 30 * 24 * 3600, // Keep failed jobs for 30 days
        },
      }
    );

    logger.info(`Automation job added successfully`, { jobId: job.id });
    return job.id!;
  } catch (error) {
    logger.error('Failed to add automation job', error);
    throw error;
  }
}

/**
 * Get job status by ID
 */
export async function getJobStatus(jobId: string) {
  try {
    const job = await automationQueue.getJob(jobId);
    
    if (!job) {
      return { exists: false };
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return {
      exists: true,
      state,
      progress,
      result,
      failedReason,
      attemptsMade: job.attemptsMade,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      data: job.data,
    };
  } catch (error) {
    logger.error('Failed to get job status', error);
    throw error;
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      automationQueue.getWaitingCount(),
      automationQueue.getActiveCount(),
      automationQueue.getCompletedCount(),
      automationQueue.getFailedCount(),
      automationQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  } catch (error) {
    logger.error('Failed to get queue stats', error);
    throw error;
  }
}

/**
 * Get recent jobs (last 50)
 */
export async function getRecentJobs() {
  try {
    const [completed, failed, active, waiting] = await Promise.all([
      automationQueue.getCompleted(0, 20),
      automationQueue.getFailed(0, 20),
      automationQueue.getActive(0, 10),
      automationQueue.getWaiting(0, 10),
    ]);

    const jobs = [...completed, ...failed, ...active, ...waiting];

    const jobDetails = await Promise.all(
      jobs.map(async (job) => {
        const state = await job.getState();
        return {
          id: job.id,
          name: job.name,
          data: job.data,
          state,
          progress: job.progress,
          result: job.returnvalue,
          failedReason: job.failedReason,
          attemptsMade: job.attemptsMade,
          timestamp: job.timestamp,
          processedOn: job.processedOn,
          finishedOn: job.finishedOn,
        };
      })
    );

    // Sort by timestamp (most recent first)
    jobDetails.sort((a, b) => b.timestamp - a.timestamp);

    return jobDetails.slice(0, 50);
  } catch (error) {
    logger.error('Failed to get recent jobs', error);
    throw error;
  }
}

/**
 * Retry a failed job
 */
export async function retryJob(jobId: string): Promise<void> {
  try {
    const job = await automationQueue.getJob(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const state = await job.getState();
    
    if (state !== 'failed') {
      throw new Error(`Job ${jobId} is not in failed state (current: ${state})`);
    }

    await job.retry();
    logger.info(`Job ${jobId} retried successfully`);
  } catch (error) {
    logger.error('Failed to retry job', error);
    throw error;
  }
}

/**
 * Cancel a job
 */
export async function cancelJob(jobId: string): Promise<void> {
  try {
    const job = await automationQueue.getJob(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    await job.remove();
    logger.info(`Job ${jobId} cancelled successfully`);
  } catch (error) {
    logger.error('Failed to cancel job', error);
    throw error;
  }
}

/**
 * Clean old jobs from queue
 */
export async function cleanQueue(
  grace: number = 7 * 24 * 3600 * 1000 // 7 days
): Promise<void> {
  try {
    const [completedCleaned, failedCleaned] = await Promise.all([
      automationQueue.clean(grace, 1000, 'completed'),
      automationQueue.clean(grace * 4, 1000, 'failed'), // Keep failed jobs longer
    ]);

    logger.info('Queue cleaned', {
      completedCleaned: completedCleaned.length,
      failedCleaned: failedCleaned.length,
    });
  } catch (error) {
    logger.error('Failed to clean queue', error);
    throw error;
  }
}

/**
 * Pause queue processing
 */
export async function pauseQueue(): Promise<void> {
  await automationQueue.pause();
  logger.info('Queue paused');
}

/**
 * Resume queue processing
 */
export async function resumeQueue(): Promise<void> {
  await automationQueue.resume();
  logger.info('Queue resumed');
}

/**
 * Setup queue event listeners
 */
export function setupQueueEventListeners(): void {
  automationQueueEvents.on('completed', ({ jobId, returnvalue }) => {
    logger.info(`Job ${jobId} completed`, { result: returnvalue });
  });

  automationQueueEvents.on('failed', ({ jobId, failedReason }) => {
    logger.error(`Job ${jobId} failed`, { reason: failedReason });
  });

  automationQueueEvents.on('progress', ({ jobId, data }) => {
    logger.debug(`Job ${jobId} progress`, { progress: data });
  });

  automationQueueEvents.on('stalled', ({ jobId }) => {
    logger.warn(`Job ${jobId} stalled`);
  });

  logger.info('Queue event listeners setup complete');
}

/**
 * Gracefully close queue connections
 */
export async function closeQueue(): Promise<void> {
  await Promise.all([
    automationQueue.close(),
    automationQueueEvents.close(),
  ]);
  logger.info('Queue connections closed');
}
