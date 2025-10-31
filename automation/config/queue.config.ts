import { ConnectionOptions } from 'bullmq';
import { automationEnv } from './env';
import { AUTOMATION_CONSTANTS } from './constants';

/**
 * BullMQ Queue Configuration
 */

// Redis connection options
export const redisConnection: ConnectionOptions = {
  host: automationEnv.redis.host,
  port: automationEnv.redis.port,
  password: automationEnv.redis.password,
  db: automationEnv.redis.db,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// Queue default job options
export const defaultJobOptions = {
  attempts: automationEnv.automation.maxRetries,
  backoff: {
    type: 'exponential' as const,
    delay: AUTOMATION_CONSTANTS.RETRY.INITIAL_DELAY,
  },
  removeOnComplete: AUTOMATION_CONSTANTS.QUEUE.REMOVE_ON_COMPLETE,
  removeOnFail: AUTOMATION_CONSTANTS.QUEUE.REMOVE_ON_FAIL,
};

// Worker options
export const workerOptions = {
  connection: redisConnection,
  concurrency: AUTOMATION_CONSTANTS.QUEUE.CONCURRENCY,
  limiter: {
    max: 1, // Max 1 job
    duration: 5000, // per 5 seconds
  },
};

// Queue options
export const queueOptions = {
  connection: redisConnection,
  defaultJobOptions,
};

// Export as queueConfig for compatibility
export const queueConfig = queueOptions;

export const QUEUE_NAME = AUTOMATION_CONSTANTS.QUEUE.NAME;
