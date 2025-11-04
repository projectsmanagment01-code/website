/**
 * BullMQ Job Processor
 * Processes automation jobs and executes the workflow
 */

import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { AutomationJobData, AutomationJobResult } from './automation.queue';
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

    // Load settings from database
    const { getAutomationSettings } = await import('@/lib/automation-settings');
    const settings = await getAutomationSettings();

    // Initialize workflow context
    const context: WorkflowContext = {
      automationId,
      recipeRowNumber,
      currentStep: 1,
      totalSteps: 12,
      startTime: Date.now(),
      recipe: undefined,
      seoData: undefined,
      imagePrompts: undefined,
      referenceImage: undefined,
      generatedImages: undefined,
      uploadedImages: undefined,
      article: undefined,
      publishedRecipe: undefined,
      config: {
        googleSheetId: settings?.googleSheetId || process.env.GOOGLE_SHEET_ID || '',
        websiteApiToken: settings?.websiteApiToken || process.env.WEBSITE_API_TOKEN || '',
        aiGenerator: settings?.geminiFlashModel || 'gemini-2.0-flash-exp',
        nakedDomain: process.env.NAKED_DOMAIN || '',
        geminiApiKey: settings?.geminiApiKey || process.env.GEMINI_API_KEY || '',
        makeWebhookUrl: settings?.makeWebhookUrl || process.env.MAKE_WEBHOOK_URL,
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
        enablePinterest: settings?.enablePinterest || false,
        enableIndexing: settings?.enableIndexing || true,
        geminiFlashModel: settings?.geminiFlashModel || 'gemini-2.0-flash-exp',
        geminiProModel: settings?.geminiProModel || 'gemini-2.0-flash-thinking-exp-01-21',
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

    // Check if workflow succeeded
    if (!result.success) {
      // Workflow failed - update status and throw error
      await prisma.recipeAutomation.update({
        where: { id: automationId },
        data: {
          status: 'FAILED',
          error: result.error || 'Workflow failed without error message',
          completedAt: new Date(),
        },
      });

      throw new Error(result.error || 'Workflow failed without error message');
    }

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
