/**
 * Step Logging Utilities
 * Helper functions to log automation steps
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StepLogData {
  automationId: string;
  stepNumber: number;
  stepName: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  inputData?: any;
  outputData?: any;
  config?: any;
  error?: string;
  stackTrace?: string;
  tokensUsed?: number;
  costUsd?: number;
}

/**
 * Create a new step log entry
 */
export async function createStepLog(data: Omit<StepLogData, 'status'> & { status?: string }) {
  return await prisma.automationStepLog.create({
    data: {
      ...data,
      status: data.status || 'RUNNING',
      startedAt: new Date(),
    },
  });
}

/**
 * Update an existing step log
 */
export async function updateStepLog(
  stepLogId: string,
  data: Partial<StepLogData> & {
    durationMs?: number;
    completedAt?: Date;
  }
) {
  return await prisma.automationStepLog.update({
    where: { id: stepLogId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

/**
 * Log a successful step
 */
export async function logStepSuccess(
  stepLogId: string,
  outputData: any,
  durationMs: number,
  metadata?: { tokensUsed?: number; costUsd?: number }
) {
  return await updateStepLog(stepLogId, {
    status: 'SUCCESS',
    outputData,
    durationMs,
    completedAt: new Date(),
    ...metadata,
  });
}

/**
 * Log a failed step
 */
export async function logStepFailure(
  stepLogId: string,
  error: Error,
  durationMs: number
) {
  return await updateStepLog(stepLogId, {
    status: 'FAILED',
    error: error.message,
    stackTrace: error.stack,
    durationMs,
    completedAt: new Date(),
  });
}

/**
 * Get all step logs for an automation
 */
export async function getStepLogs(automationId: string) {
  return await prisma.automationStepLog.findMany({
    where: { automationId },
    orderBy: { stepNumber: 'asc' },
  });
}

/**
 * Get a single step log
 */
export async function getStepLog(stepLogId: string) {
  return await prisma.automationStepLog.findUnique({
    where: { id: stepLogId },
  });
}

/**
 * Wrapper to execute a step with automatic logging
 */
export async function executeStep<T>(
  automationId: string,
  stepNumber: number,
  stepName: string,
  config: any,
  inputData: any,
  stepFunction: () => Promise<T>,
  extractOutput?: (result: T) => any
): Promise<T> {
  const startTime = Date.now();
  
  // Create step log
  const stepLog = await createStepLog({
    automationId,
    stepNumber,
    stepName,
    status: 'RUNNING',
    inputData,
    config,
  });

  try {
    // Execute the step
    const result = await stepFunction();
    const durationMs = Date.now() - startTime;

    // Extract output data (or use result directly)
    const outputData = extractOutput ? extractOutput(result) : result;

    // Log success
    await logStepSuccess(stepLog.id, outputData, durationMs);

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    
    // Log failure
    await logStepFailure(stepLog.id, error as Error, durationMs);
    
    throw error;
  }
}
