/**
 * Scheduled Pipeline Jobs
 * Integrates with existing BullMQ automation system to run recipe pipelines on schedule
 */

import { Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { RecipePipelineOrchestrator } from '../pipeline/recipe-pipeline';
import { queueConfig } from '../config/queue.config';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface PipelineJobData {
  scheduleId: string;
  authorId?: string;
  filters?: Record<string, any>;
}

export interface PipelineJobResult {
  success: boolean;
  processed: number;
  failed: number;
  recipes: Array<{
    spyDataId: string;
    recipeId?: string;
    recipeUrl?: string;
    error?: string;
  }>;
}

/**
 * Pipeline queue for scheduled jobs
 */
export const pipelineQueue = new Queue<PipelineJobData, PipelineJobResult>(
  'recipe-pipeline',
  queueConfig
);

/**
 * Pipeline worker - processes scheduled jobs
 */
export const pipelineWorker = new Worker<PipelineJobData, PipelineJobResult>(
  'recipe-pipeline',
  async (job) => {
    const { scheduleId, authorId, filters } = job.data;

    logger.info(`🚀 Starting scheduled pipeline job (1 recipe per run)`, {
      scheduleId,
      jobId: job.id
    });

    const results: PipelineJobResult = {
      success: true,
      processed: 0,
      failed: 0,
      recipes: []
    };

    let executionLog: any = null;

    try {
      // Update schedule last run - handle case where schedule was deleted
      try {
        await prisma.automationSchedule.update({
          where: { id: scheduleId },
          data: {
            lastRun: new Date(),
            runCount: { increment: 1 }
          }
        });
      } catch (scheduleError: any) {
        if (scheduleError?.code === 'P2025') {
          // Schedule was deleted - log warning and continue
          logger.warn(`⚠️ Schedule ${scheduleId} no longer exists (may have been deleted). Completing job without schedule update.`);
        } else {
          throw scheduleError; // Re-throw other errors
        }
      }

      // Get next single pending spy data entry (always process only 1)
      const spyDataEntries = await prisma.pinterestSpyData.findMany({
        where: {
          generatedRecipeId: null,
          status: { in: ['PENDING', 'SEO_COMPLETED', 'SEO_PROCESSED', 'READY_FOR_GENERATION'] },
          ...filters
        },
        take: 1, // ALWAYS ONLY 1 RECIPE PER RUN
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        select: { id: true, spyTitle: true }
      });

      if (spyDataEntries.length === 0) {
        logger.info(`No pending entries found for scheduled job ${job.id}`);
        return results;
      }

      logger.info(`Found ${spyDataEntries.length} entries to process`);

      // Process the single entry through the pipeline
      const entry = spyDataEntries[0];
      
      // Create execution log
      executionLog = await prisma.pipelineExecutionLog.create({
        data: {
          scheduleId: scheduleId,
          spyDataId: entry.id,
          spyTitle: entry.spyTitle,
          status: 'RUNNING',
          stage: 'Starting',
          progress: 0,
          triggeredBy: 'schedule',
          authorId: authorId,
          logs: []
        }
      });
      
      logger.info(`Processing single entry: ${entry.spyTitle}`);
      
      await job.updateProgress(50);

      try {
        const pipelineResult = await RecipePipelineOrchestrator.executePipeline({
          spyDataId: entry.id,
          authorId: authorId,
          onProgress: async (step, total, message) => {
            logger.debug(`Pipeline step ${step}/${total}: ${message}`);
            const progress = Math.floor(50 + (step / total) * 50);
            await job.updateProgress(progress);
            
            // Update execution log
            await prisma.pipelineExecutionLog.update({
              where: { id: executionLog.id },
              data: {
                progress,
                stage: message,
                logs: {
                  push: {
                    timestamp: new Date().toISOString(),
                    step,
                    total,
                    message
                  }
                }
              }
            });
          }
        });

        if (pipelineResult.success) {
          results.processed++;
          results.recipes.push({
            spyDataId: entry.id,
            recipeId: pipelineResult.recipeId,
            recipeUrl: pipelineResult.recipeUrl
          });
          
          // Update execution log as success
          await prisma.pipelineExecutionLog.update({
            where: { id: executionLog.id },
            data: {
              status: 'SUCCESS',
              completedAt: new Date(),
              durationMs: Date.now() - new Date(executionLog.startedAt).getTime(),
              progress: 100,
              recipeId: pipelineResult.recipeId,
              recipeUrl: pipelineResult.recipeUrl,
              logs: {
                push: pipelineResult.logs.map(log => ({
                  timestamp: new Date().toISOString(),
                  message: log
                }))
              }
            }
          });
          
          logger.info(`✅ Recipe created: ${pipelineResult.recipeUrl}`);
        } else {
          results.failed++;
          results.recipes.push({
            spyDataId: entry.id,
            error: pipelineResult.error
          });
          
          // Update execution log as failed
          await prisma.pipelineExecutionLog.update({
            where: { id: executionLog.id },
            data: {
              status: 'FAILED',
              completedAt: new Date(),
              durationMs: Date.now() - new Date(executionLog.startedAt).getTime(),
              error: pipelineResult.error,
              errorStage: pipelineResult.stage,
              logs: {
                push: pipelineResult.logs.map(log => ({
                  timestamp: new Date().toISOString(),
                  message: log
                }))
              }
            }
          });
          
          logger.error(`❌ Failed to create recipe: ${pipelineResult.error}`);
        }

      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.recipes.push({
          spyDataId: entry.id,
          error: errorMessage
        });
        
        // Update execution log as failed
        if (executionLog) {
          await prisma.pipelineExecutionLog.update({
            where: { id: executionLog.id },
            data: {
              status: 'FAILED',
              completedAt: new Date(),
              durationMs: Date.now() - new Date(executionLog.startedAt).getTime(),
              error: errorMessage,
              logs: {
                push: {
                  timestamp: new Date().toISOString(),
                  message: `Error: ${errorMessage}`
                }
              }
            }
          });
        }
        
        logger.error(`❌ Pipeline error for ${entry.id}:`, error);
      }

      // Update schedule statistics - handle deleted schedule
      try {
        await prisma.automationSchedule.update({
          where: { id: scheduleId },
          data: {
            runCount: { increment: 1 }
          }
        });
      } catch (scheduleError: any) {
        if (scheduleError?.code === 'P2025') {
          logger.warn(`⚠️ Schedule ${scheduleId} no longer exists. Skipping statistics update.`);
        } else {
          throw scheduleError;
        }
      }

      await job.updateProgress(100);

      logger.info(`✅ Scheduled job completed`, {
        jobId: job.id,
        processed: results.processed,
        failed: results.failed
      });

      return results;

    } catch (error) {
      logger.error(`❌ Scheduled job failed`, { jobId: job.id, error });
      results.success = false;
      throw error;
    }
  },
  {
    ...queueConfig,
    concurrency: 1, // Process one batch at a time
    limiter: {
      max: 10, // Max 10 jobs
      duration: 60000 // per minute
    }
  }
);

/**
 * Add or update a repeatable job based on schedule
 * Always processes 1 recipe per run
 */
export async function scheduleRecipePipeline(
  scheduleId: string,
  cronExpression: string,
  authorId?: string,
  filters?: Record<string, any>
): Promise<void> {
  logger.info(`📅 Scheduling pipeline job (1 recipe per run)`, { scheduleId, cronExpression });

  await pipelineQueue.add(
    'scheduled-pipeline',
    {
      scheduleId,
      authorId,
      filters
    },
    {
      repeat: {
        pattern: cronExpression
      },
      jobId: `schedule-${scheduleId}`,
      removeOnComplete: {
        age: 7 * 24 * 3600, // Keep for 7 days
        count: 100
      },
      removeOnFail: {
        age: 30 * 24 * 3600 // Keep for 30 days
      }
    }
  );

  logger.info(`✅ Pipeline job scheduled successfully`);
}

/**
 * Remove a scheduled job
 */
export async function removeScheduledPipeline(scheduleId: string): Promise<void> {
  logger.info(`🗑️ Removing scheduled pipeline`, { scheduleId });

  await pipelineQueue.removeRepeatable(
    'scheduled-pipeline',
    {
      pattern: '', // Will be looked up by jobId
    },
    `schedule-${scheduleId}`
  );

  logger.info(`✅ Scheduled pipeline removed`);
}

/**
 * Get all repeatable jobs
 */
export async function getScheduledJobs() {
  return await pipelineQueue.getRepeatableJobs();
}

// Worker event listeners
pipelineWorker.on('completed', (job, result) => {
  logger.info(`✅ Pipeline job ${job.id} completed`, {
    processed: result.processed,
    failed: result.failed
  });
});

pipelineWorker.on('failed', (job, error) => {
  logger.error(`❌ Pipeline job ${job?.id} failed`, { error });
});

pipelineWorker.on('error', (error) => {
  logger.error(`❌ Pipeline worker error`, { error });
});

logger.info(`🔧 Pipeline worker started and listening for jobs`);
