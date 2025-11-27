// lib/logger.ts - Centralized logging system
type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: any
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    }

    // In production, use JSON format for log aggregation
    if (process.env.NODE_ENV === 'production') {
      console[level === 'debug' ? 'log' : level](JSON.stringify(logEntry))
    } else {
      // In development, use readable format
      const emoji = {
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        debug: '🐛',
      }[level]

      console[level === 'debug' ? 'log' : level](
        `${emoji} [${timestamp}] ${message}`,
        context ? JSON.stringify(context, null, 2) : ''
      )
    }

    // TODO: Send to monitoring service in production
    // if (process.env.NODE_ENV === 'production') {
    //   this.sendToMonitoring(logEntry)
    // }
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  /**
   * Log error messages with optional Error object
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
    }

    if (error instanceof Error) {
      errorContext.error = error.message
      errorContext.stack = error.stack
      errorContext.name = error.name
    } else if (error) {
      errorContext.error = String(error)
    }

    this.log('error', message, errorContext)
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, context)
    }
  }

  /**
   * Log database operations
   */
  database(operation: string, details?: LogContext) {
    this.info(`Database: ${operation}`, details)
  }

  /**
   * Log API requests
   */
  api(method: string, path: string, details?: LogContext) {
    this.info(`API ${method} ${path}`, details)
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, durationMs: number, details?: LogContext) {
    const level = durationMs > 1000 ? 'warn' : 'info'
    this.log(level, `Performance: ${operation} took ${durationMs}ms`, details)
  }

  // TODO: Implement monitoring service integration
  // private sendToMonitoring(logEntry: any) {
  //   // Send to Sentry, DataDog, CloudWatch, etc.
  //   // Example:
  //   // if (logEntry.level === 'error') {
  //   //   Sentry.captureException(new Error(logEntry.message), {
  //   //     extra: logEntry,
  //   //   })
  //   // }
  // }
}

export const logger = new Logger()
