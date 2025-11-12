/**
 * Retry utility with exponential backoff
 */

import { AUTOMATION_CONSTANTS } from '../config/constants';
import { logger } from './logger';

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = AUTOMATION_CONSTANTS.RETRY.MAX_ATTEMPTS,
    initialDelay = AUTOMATION_CONSTANTS.RETRY.INITIAL_DELAY,
    maxDelay = AUTOMATION_CONSTANTS.RETRY.MAX_DELAY,
    backoffMultiplier = AUTOMATION_CONSTANTS.RETRY.BACKOFF_MULTIPLIER,
    onRetry,
  } = options;

  let attempt = 1;
  let lastError: any;

  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        break;
      }

      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );

      logger.warn(`Attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms`, {
        error: error instanceof Error ? error.message : String(error),
      });

      if (onRetry) {
        onRetry(attempt, error);
      }

      await sleep(delay);
      attempt++;
    }
  }

  throw lastError;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') {
    return true;
  }

  // HTTP 5xx errors
  if (error?.response?.status >= 500 && error?.response?.status < 600) {
    return true;
  }

  // Rate limit errors
  if (error?.response?.status === 429) {
    return true;
  }

  // Gemini API specific errors
  if (error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
    return true;
  }

  return false;
}

/**
 * Execute function with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError = 'Operation timed out'
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutError));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}
