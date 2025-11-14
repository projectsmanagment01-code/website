/**
 * Automation Worker Entry Point
 * Initializes and starts all BullMQ workers for background automation tasks
 */

import { logger } from '../utils/logger';
import { pipelineWorker } from '../jobs/pipeline-jobs';

// Initialize workers
logger.info('🚀 Starting automation workers...');

// Pipeline worker is already initialized in pipeline-jobs.ts
logger.info('✅ Pipeline worker initialized');

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('📴 SIGTERM received, shutting down workers gracefully...');
  await pipelineWorker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('📴 SIGINT received, shutting down workers gracefully...');
  await pipelineWorker.close();
  process.exit(0);
});

// Keep the process alive
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught exception in worker process:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled rejection in worker process:', { reason, promise });
});

logger.info('✅ Automation workers running and ready to process jobs');
