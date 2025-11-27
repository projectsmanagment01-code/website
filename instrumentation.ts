// instrumentation.ts - Next.js instrumentation hook
// This runs before Next.js starts, perfect for global error handlers
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import and initialize global error handlers for Node.js runtime
    await import('./app/error-handlers');
  }
}
