/**
 * Global Error Handlers for Node.js Process
 * 
 * This module sets up process-level error handlers to catch unhandled
 * rejections and exceptions that could crash the application.
 * 
 * CRITICAL: These handlers prevent revenue loss from application crashes
 */

export function setupGlobalErrorHandlers() {
  // Unhandled Promise Rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ [UNHANDLED REJECTION] Caught at:', promise);
    console.error('❌ Reason:', reason);
    
    // Log stack trace if available
    if (reason instanceof Error) {
      console.error('❌ Stack:', reason.stack);
    }
    
    // TODO: Send to monitoring service (Sentry, DataDog, etc.)
    // Example: Sentry.captureException(reason);
  });

  // Uncaught Exceptions
  process.on('uncaughtException', (error, origin) => {
    console.error('❌ [UNCAUGHT EXCEPTION]');
    console.error('❌ Error:', error.message);
    console.error('❌ Origin:', origin);
    console.error('❌ Stack:', error.stack);
    
    // TODO: Send to monitoring service
    // Example: Sentry.captureException(error);
    
    // In production, perform cleanup and exit
    // The process manager (PM2, Docker, Vercel) will restart the app
    if (process.env.NODE_ENV === 'production') {
      console.error('🛑 Production environment - initiating graceful shutdown...');
      
      // Allow time for logging to complete
      setTimeout(() => {
        console.error('💀 Exiting process with code 1');
        process.exit(1); // Non-zero exit code signals error
      }, 1000);
    } else {
      console.error('⚠️ Development environment - continuing execution');
    }
  });

  // Monitor exceptions without affecting behavior
  process.on('uncaughtExceptionMonitor', (error, origin) => {
    console.error('⚠️ [EXCEPTION MONITOR]', {
      message: error.message,
      origin,
      timestamp: new Date().toISOString(),
    });
    
    // TODO: Send to monitoring service for alerting
  });

  console.log('✅ Global error handlers initialized');
}

// Auto-initialize if this file is imported
if (typeof process !== 'undefined') {
  setupGlobalErrorHandlers();
}
