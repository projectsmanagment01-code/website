// lib/db-utils.ts - Database utility helpers with retry logic and error handling
import { Prisma } from '@prisma/client'

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

/**
 * Execute database operations with automatic retry logic
 * @param operation - The database operation to execute
 * @param options - Retry configuration options
 * @returns Result of the database operation
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    retryDelay?: number
    operationName?: string
  } = {}
): Promise<T> {
  const { maxRetries = 3, retryDelay = 1000, operationName = 'Database operation' } = options
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      // Don't retry validation errors
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new DatabaseError('Invalid data format', 'VALIDATION_ERROR', 400)
      }

      // Don't retry unique constraint violations
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new DatabaseError('Duplicate entry', 'DUPLICATE_ERROR', 409)
      }

      // Don't retry not found errors
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new DatabaseError('Record not found', 'NOT_FOUND', 404)
      }

      console.warn(
        `⚠️ ${operationName} failed (attempt ${attempt}/${maxRetries})`,
        error instanceof Error ? error.message : error
      )

      // Only retry on connection errors
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt - 1) // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw new DatabaseError(
    `${operationName} failed after ${maxRetries} attempts`,
    'MAX_RETRIES_EXCEEDED'
  )
}

/**
 * Convert Prisma errors to standardized DatabaseError
 * @param error - The error to handle
 * @returns DatabaseError with appropriate status code
 */
export function handlePrismaError(error: unknown): DatabaseError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new DatabaseError('Unique constraint violation', 'P2002', 409)
      case 'P2025':
        return new DatabaseError('Record not found', 'P2025', 404)
      case 'P2003':
        return new DatabaseError('Foreign key constraint failed', 'P2003', 400)
      case 'P2021':
        return new DatabaseError('Table does not exist', 'P2021', 500)
      case 'P2024':
        return new DatabaseError('Connection timeout', 'P2024', 503)
      default:
        return new DatabaseError(
          `Database error: ${error.code}`,
          error.code,
          500
        )
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new DatabaseError('Invalid data format', 'VALIDATION_ERROR', 400)
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new DatabaseError('Cannot connect to database', 'CONNECTION_ERROR', 503)
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return new DatabaseError('Database engine crashed', 'ENGINE_CRASH', 503)
  }

  if (error instanceof Error) {
    return new DatabaseError(error.message, 'UNKNOWN_ERROR', 500)
  }

  return new DatabaseError('Unknown database error', 'UNKNOWN_ERROR', 500)
}

/**
 * Check if an error is retryable (connection/timeout errors)
 * @param error - The error to check
 * @returns true if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Connection timeout, connection refused, etc.
    return ['P2024', 'P1001', 'P1002', 'P1008', 'P1017'].includes(error.code)
  }

  return false
}
