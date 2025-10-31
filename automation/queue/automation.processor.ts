/**
 * BullMQ Job Processor
 * Processes automation jobs and executes the workflow
 */

import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
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
    });

    if (!automation) {
      throw new ValidationError(`Automation ${automationId} not found`);
    }

    // Update status to PROCESSING
    await prisma.recipeAutomation.update({
      where: { id: automationId },
      data: {
        status: 'PROCESSING',
        currentStep: 1,
        error: '📝 Step 1/12: Fetching Google Sheet data...'
      },
    });

    // Initialize workflow context
    const context: WorkflowContext = {
      automationId,
      recipeRowNumber,
      currentStep: 1,
      totalSteps: 12,
      recipe: null,
      prompts: null,
      referenceImagePath: null,
      images: null,
      uploadedImages: undefined,
      article: null,
      publishedRecipe: undefined,
      config: {
        sheetId: process.env.GOOGLE_SHEET_ID || '',
        promptSheetRange: 'Sheet1!A:Z',
        statusColumn: 'A',
        imageColumns: {
          featureImage: 'B',
          ingredientsImage: 'C',
          cookingImage: 'D',
          finalDishImage: 'E',
        },
        postLinkColumn: 'F',
        recipeIdColumn: 'G',
        pinterestDataColumn: 'H',
        indexingStatusColumn: 'I',
        enablePinterest: false,
        enableIndexing: true,
        geminiFlashModel: 'gemini-2.0-flash-exp',
        geminiProModel: 'gemini-2.0-flash-thinking-exp-01-21',
      },
    };

    // Execute workflow with progress updates
    const result = await executeWorkflow(context, async (step: number, total: number) => {
      const progress = Math.round((step / total) * 100);
      await job.updateProgress(progress);
      await prisma.recipeAutomation.update({
        where: { id: automationId },
        data: { currentStep: step },
      });
      logger.debug(`Job ${job.id} progress: ${progress}%`, { step, total });
    });

    // Update automation record with final status
    await prisma.recipeAutomation.update({
      where: { id: automationId },
      data: {
        status: 'SUCCESS',
        recipeId: result.recipeId || null,
        postLink: result.recipeUrl || null,
        completedAt: new Date(),
        currentStep: 12,
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
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
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
    jobId,
  });
}

/**
 * Graceful shutdown handler
 */
export async function onShutdown(): Promise<void> {
  logger.info('Processor shutting down gracefully');
  await prisma.$disconnect();
}
