// lib/performance.ts - Performance monitoring utilities
import { logger } from './logger'

export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map()

  /**
   * Start a performance timer
   */
  static start(label: string) {
    this.timers.set(label, Date.now())
  }

  /**
   * End a performance timer and log the duration
   */
  static end(label: string): number {
    const startTime = this.timers.get(label)
    if (!startTime) {
      logger.warn(`No timer found for label: ${label}`)
      return 0
    }

    const duration = Date.now() - startTime
    this.timers.delete(label)

    // Log slow operations
    if (duration > 1000) {
      logger.warn(`Slow operation detected: ${label} took ${duration}ms`)
    } else if (duration > 500) {
      logger.info(`Operation completed: ${label} took ${duration}ms`)
    }

    return duration
  }

  /**
   * Measure the execution time of an async operation
   */
  static async measure<T>(
    label: string,
    operation: () => Promise<T>
  ): Promise<T> {
    this.start(label)
    try {
      const result = await operation()
      const duration = this.end(label)
      logger.performance(label, duration)
      return result
    } catch (error) {
      this.end(label)
      logger.error(`Operation failed: ${label}`, error)
      throw error
    }
  }

  /**
   * Measure the execution time of a sync operation
   */
  static measureSync<T>(label: string, operation: () => T): T {
    const start = Date.now()
    try {
      const result = operation()
      const duration = Date.now() - start
      logger.performance(label, duration)
      return result
    } catch (error) {
      logger.error(`Operation failed: ${label}`, error)
      throw error
    }
  }

  /**
   * Create a simple performance mark
   */
  static mark(name: string) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name)
    }
  }

  /**
   * Measure between two performance marks
   */
  static measureBetween(name: string, startMark: string, endMark: string) {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark)
        const measure = performance.getEntriesByName(name)[0]
        if (measure) {
          logger.performance(name, Math.round(measure.duration))
        }
      } catch (error) {
        logger.warn('Performance measurement failed', { error: error instanceof Error ? error.message : String(error) })
      }
    }
  }

  /**
   * Get memory usage information
   */
  static getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage()
  }

  /**
   * Log current memory usage
   */
  static logMemoryUsage(label?: string) {
    const usage = this.getMemoryUsage()
    const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

    logger.info(label ? `Memory usage - ${label}` : 'Memory usage', {
      heapUsed: formatBytes(usage.heapUsed),
      heapTotal: formatBytes(usage.heapTotal),
      rss: formatBytes(usage.rss),
      external: formatBytes(usage.external),
    })
  }

  /**
   * Check if memory usage is high
   */
  static isMemoryHigh(thresholdMB: number = 500): boolean {
    const usage = this.getMemoryUsage()
    const heapUsedMB = usage.heapUsed / 1024 / 1024
    
    if (heapUsedMB > thresholdMB) {
      logger.warn(`High memory usage detected: ${heapUsedMB.toFixed(2)} MB`, {
        threshold: `${thresholdMB} MB`,
        heapUsed: `${heapUsedMB.toFixed(2)} MB`,
      })
      return true
    }
    
    return false
  }
}

/**
 * Decorator for measuring method execution time
 */
export function measurePerformance(label?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const methodLabel = label || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      return PerformanceMonitor.measure(methodLabel, () =>
        originalMethod.apply(this, args)
      )
    }

    return descriptor
  }
}
