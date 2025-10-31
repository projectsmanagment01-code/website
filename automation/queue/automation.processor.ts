/**
 * BullMQ Job Processor
 * Processes automation jobs and executes the workflow
 */

import { Job } from 'bullmq';
import { PrismaClient, AutomationStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { AutomationJobData, AutomationJobResult } from './automation.queue';
import { executeWorkflow } from '../workflows/main-workflow';
import { WorkflowContext } from '../types/workflow.types';
import { ValidationError } from '../utils/errors';

const prisma = new PrismaClient();

/**
 * Process a single automation job
 */
export async function processAutomationJob(
  job: Job<AutomationJobData, AutomationJobResult>
): Promise<AutomationJobResult> {
  const { automationId, recipeRowNumber, title } = job.data;

  logger.info(`Processing automation job ${job.id}`, {
    automationId,
    recipeRowNumber,
    title,
    attemptsMade: job.attemptsMade,
  });

  try {
    // Update job progress
    await job.updateProgress(0);

    // Fetch automation record from database
    const automation = await prisma.recipeAutomation.findUnique({
      where: { id: automationId },
      include: {
        config: true,
        images: true,
      },
    });

    if (!automation) {
      throw new ValidationError(`Automation ${automationId} not found`);
    }

    // Update status to PROCESSING
    await prisma.recipeAutomation.update({
      where: { id: automationId },
      data: {
        status: AutomationStatus.PROCESSING,
        startedAt: new Date(),
      },
    });

    // Initialize workflow context
    const context: WorkflowContext = {
      automationId,
      recipeRowNumber,
      currentStep: 1,
      totalSteps: 11,
      recipe: null,
      prompts: null,
      referenceImagePath: null,
      images: null,
      uploadedImages: null,
      article: null,
      publishedRecipe: null,
      config: {
        sheetId: automation.config.sheetId,
        promptSheetRange: automation.config.promptSheetRange || 'Sheet1!A:Z',
        statusColumn: automation.config.statusColumn || 'A',
        imageColumns: {
          featureImage: automation.config.featureImageColumn || 'B',
          ingredientsImage: automation.config.ingredientsImageColumn || 'C',
          cookingImage: automation.config.cookingImageColumn || 'D',
          finalDishImage: automation.config.finalDishImageColumn || 'E',
        },
        postLinkColumn: automation.config.postLinkColumn || 'F',
        recipeIdColumn: automation.config.recipeIdColumn || 'G',
        pinterestDataColumn: automation.config.pinterestDataColumn || 'H',
        indexingStatusColumn: automation.config.indexingStatusColumn || 'I',
        enablePinterest: automation.config.enablePinterest,
        enableIndexing: automation.config.enableIndexing,
        geminiFlashModel: automation.config.geminiFlashModel || 'gemini-2.0-flash-exp',
        geminiProModel: automation.config.geminiProModel || 'gemini-1.5-pro',
      },
    };

    // Execute workflow with progress updates
    const result = await executeWorkflow(context, async (step, total) => {
      const progress = Math.round((step / total) * 100);
      await job.updateProgress(progress);
      logger.debug(`Job ${job.id} progress: ${progress}%`, { step, total });
    });

    // Update automation record with final status
    await prisma.recipeAutomation.update({
      where: { id: automationId },
      data: {
        status: AutomationStatus.COMPLETED,
        recipeId: result.recipeId || null,
        recipeUrl: result.recipeUrl || null,
        completedAt: new Date(),
      },
    });

    logger.info(`Automation job ${job.id} completed successfully`, {
      recipeId: result.recipeId,
      recipeUrl: result.recipeUrl,
    });

    return {
      automationId,
      status: 'COMPLETED',
      recipeId: result.recipeId,
      recipeUrl: result.recipeUrl,
    };
  } catch (error) {
    logger.error(`Automation job ${job.id} failed`, error);

    // Update automation record with error
    await prisma.recipeAutomation.update({
      where: { id: automationId },
      data: {
        status: AutomationStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error',
        failedAt: new Date(),
      },
    });

    // Re-throw error to let BullMQ handle retry logic
    throw error;
  }
}

/**
 * Handle job completion
 */
export async function onJobCompleted(
  job: Job<AutomationJobData, AutomationJobResult>,
  result: AutomationJobResult
): Promise<void> {
  logger.info(`Job ${job.id} completed`, {
    automationId: result.automationId,
    recipeId: result.recipeId,
    recipeUrl: result.recipeUrl,
  });

  // Log to database
  await prisma.automationLog.create({
    data: {
      automationId: result.automationId,
      level: 'INFO',
      message: 'Automation completed successfully',
      metadata: {
        recipeId: result.recipeId,
        recipeUrl: result.recipeUrl,
      },
    },
  });
}

/**
 * Handle job failure
 */
export async function onJobFailed(
  job: Job<AutomationJobData, AutomationJobResult>,
  error: Error
): Promise<void> {
  logger.error(`Job ${job.id} failed`, {
    automationId: job.data.automationId,
    error: error.message,
    attemptsMade: job.attemptsMade,
    maxAttempts: job.opts.attempts,
  });

  // Log to database
  await prisma.automationLog.create({
    data: {
      automationId: job.data.automationId,
      level: 'ERROR',
      message: `Automation failed: ${error.message}`,
      metadata: {
        error: error.message,
        stack: error.stack,
        attemptsMade: job.attemptsMade,
        maxAttempts: job.opts.attempts,
      },
    },
  });
}

/**
 * Handle job stalling
 */
export async function onJobStalled(
  jobId: string,
  data: AutomationJobData
): Promise<void> {
  logger.warn(`Job ${jobId} stalled`, {
    automationId: data.automationId,
  });

  // Log to database
  await prisma.automationLog.create({
    data: {
      automationId: data.automationId,
      level: 'WARN',
      message: `Job ${jobId} stalled - may be stuck or taking too long`,
      metadata: {
        jobId,
      },
    },
  });
}

/**
 * Graceful shutdown handler
 */
export async function onShutdown(): Promise<void> {
  logger.info('Processor shutting down gracefully');
  await prisma.$disconnect();
}
