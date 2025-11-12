/**
 * Logging utility using Winston
 * Handles file logging and console output
 */

// Note: Install winston package: npm install winston

interface LogData {
  recipeId?: string;
  step?: number;
  event?: string;
  duration?: number;
  [key: string]: any;
}

class AutomationLogger {
  private logToConsole(level: string, message: string, data?: LogData) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data,
    };

    // Console output with colors
    const colors: Record<string, string> = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
    };
    
    const reset = '\x1b[0m';
    const color = colors[level] || '';
    
    console.log(`${color}[${timestamp}] ${level.toUpperCase()}: ${message}${reset}`);
    if (data && Object.keys(data).length > 0) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  debug(message: string, data?: LogData) {
    this.logToConsole('debug', message, data);
  }

  info(message: string, data?: LogData) {
    this.logToConsole('info', message, data);
  }

  warn(message: string, data?: LogData) {
    this.logToConsole('warn', message, data);
  }

  error(message: string, error?: Error | any, data?: LogData) {
    const errorData = {
      ...data,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : error,
    };
    this.logToConsole('error', message, errorData);
  }

  // Log to database via Prisma
  async logToDatabase(params: {
    recipeId: string;
    event: string;
    level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
    details: string;
    step?: number;
    duration?: number;
  }) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      await prisma.automationLog.create({
        data: {
          recipeId: params.recipeId,
          event: params.event,
          level: params.level,
          details: params.details,
          step: params.step,
          duration: params.duration,
        },
      });
      
      await prisma.$disconnect();
    } catch (err) {
      console.error('Failed to log to database:', err);
    }
  }
}

export const logger = new AutomationLogger();

/**
 * Helper to get automation logs from database
 */
export async function getAutomationLogs(filters?: {
  recipeId?: string;
  level?: string;
  limit?: number;
}) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const logs = await prisma.automationLog.findMany({
      where: {
        ...(filters?.recipeId && { recipeId: filters.recipeId }),
        ...(filters?.level && { level: filters.level as any }),
      },
      orderBy: { timestamp: 'desc' },
      take: filters?.limit || 100,
      include: {
        recipe: {
          select: {
            title: true,
            status: true,
          },
        },
      },
    });
    
    return logs;
  } finally {
    await prisma.$disconnect();
  }
}
