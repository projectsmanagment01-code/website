/**
 * Recipe Automation System - Main Entry Point
 * 
 * This is the public API for the automation system.
 * Import and use these functions from admin dashboard and API routes.
 */

export {
  // Queue operations
  addAutomationJob,
  getJobStatus,
  getQueueStats,
  getRecentJobs,
  retryJob,
  cancelJob,
  cleanQueue,
  pauseQueue,
  resumeQueue,
  setupQueueEventListeners,
  closeQueue,
} from './queue/automation.queue';

export {
  // Worker
  createAutomationWorker,
} from './queue/automation.worker';

export {
  // Workflow
  executeWorkflow,
  type WorkflowResult,
  type ProgressCallback,
} from './workflows/main-workflow';

export {
  // Types
  type WorkflowContext,
  type AutomationConfig,
  type RecipeData,
  type ImageSetData,
  type WorkflowStep,
} from './types/workflow.types';

export {
  type ImagePrompts,
  type ImageGenerationRequest,
  type ImageGenerationResult,
  type ImageUploadRequest,
  type ImageUploadResult,
  type ImageDownloadRequest,
  type ImageDownloadResult,
} from './types/image.types';

export {
  type RecipeArticleData,
  type RecipePublishResult,
} from './types/recipe.types';

export {
  // Services (for direct use if needed)
  GeminiFlashService,
  GeminiProService,
} from './services/ai';

export {
  GoogleSheetsService,
  GoogleIndexingService,
} from './services/google';

export {
  ImageGeneratorService,
  ImageDownloaderService,
  ImageUploaderService,
} from './services/image';

export {
  RecipeArticleService,
  RecipePublisherService,
} from './services/recipe';

export {
  PinterestService,
} from './services/external';

export {
  // Utils
  logger,
} from './utils/logger';

export {
  retryWithBackoff,
  withTimeout,
  isRetryableError,
  sleep,
} from './utils/retry';

export {
  ConfigError,
  SheetError,
  ImageError,
  AIError,
  PublishError,
  ValidationError,
} from './utils/errors';

export {
  validateRecipeData,
  validateImagePrompts,
  validateRecipeArticle,
  validateUrl,
  validateConfig,
} from './utils/validators';

// Re-export constants
export { AUTOMATION_CONSTANTS } from './config/constants';
export { automationEnv } from './config/env';

/**
 * Initialize the automation system
 * Call this once when your application starts
 */
export async function initializeAutomation(): Promise<void> {
  const { setupQueueEventListeners } = await import('./queue/automation.queue');
  setupQueueEventListeners();
  logger.info('Automation system initialized');
}

/**
 * Start a new recipe automation
 * 
 * @param recipeRowNumber - Row number in Google Sheets (1-indexed)
 * @param title - Optional recipe title for logging
 * @returns Job ID for tracking
 */
export async function startAutomation(
  recipeRowNumber: number,
  title?: string
): Promise<string> {
  const { PrismaClient } = await import('@prisma/client');
  const { addAutomationJob } = await import('./queue/automation.queue');
  
  const prisma = new PrismaClient();
  
  try {
    // Create automation record in database
    const automation = await prisma.recipeAutomation.create({
      data: {
        status: 'PENDING',
        recipeRowNumber,
        configId: 'default', // Use default config
      },
    });

    // Add job to queue
    const jobId = await addAutomationJob(
      automation.id,
      recipeRowNumber,
      title
    );

    logger.info('Automation started', {
      automationId: automation.id,
      jobId,
      recipeRowNumber,
      title,
    });

    return jobId;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get automation status
 * 
 * @param automationId - Automation ID or Job ID
 * @returns Status information
 */
export async function getAutomationStatus(automationId: string): Promise<{
  automation: any;
  job: any;
}> {
  const { PrismaClient } = await import('@prisma/client');
  const { getJobStatus } = await import('./queue/automation.queue');
  
  const prisma = new PrismaClient();
  
  try {
    const [automation, job] = await Promise.all([
      prisma.recipeAutomation.findUnique({
        where: { id: automationId },
        include: {
          config: true,
          images: true,
        },
      }),
      getJobStatus(automationId),
    ]);

    return { automation, job };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get automation logs
 * 
 * @param automationId - Automation ID
 * @param level - Optional log level filter
 * @returns Array of log entries
 */
export async function getAutomationLogs(
  automationId: string,
  level?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
): Promise<any[]> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const logs = await prisma.automationLog.findMany({
      where: {
        automationId,
        ...(level && { level }),
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    });

    return logs;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get automation statistics
 */
export async function getAutomationStats(): Promise<{
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  successRate: number;
}> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const [
      total,
      pending,
      processing,
      completed,
      failed,
    ] = await Promise.all([
      prisma.recipeAutomation.count(),
      prisma.recipeAutomation.count({ where: { status: 'PENDING' } }),
      prisma.recipeAutomation.count({ where: { status: 'PROCESSING' } }),
      prisma.recipeAutomation.count({ where: { status: 'COMPLETED' } }),
      prisma.recipeAutomation.count({ where: { status: 'FAILED' } }),
    ]);

    const successRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      successRate: Math.round(successRate * 100) / 100,
    };
  } finally {
    await prisma.$disconnect();
  }
}
