/**
 * Auto-start worker endpoint
 * Called automatically when app boots
 */

import { NextResponse } from 'next/server';
import { createAutomationWorker } from '@/automation/queue/automation.worker';
import { Worker } from 'bullmq';

// Global worker instance
let workerInstance: Worker | null = null;

/**
 * GET /api/admin/automation/worker/start
 * Auto-start worker (no auth required for internal boot)
 */
export async function GET() {
  try {
    // Check if worker already running
    if (workerInstance && !workerInstance.closing) {
      return NextResponse.json({
        success: true,
        message: 'Worker already running',
        status: 'active',
      });
    }

    // Start the worker
    workerInstance = createAutomationWorker();

    return NextResponse.json({
      success: true,
      message: 'Worker started automatically',
      status: 'active',
    });
  } catch (error) {
    console.error('Failed to auto-start worker:', error);
    return NextResponse.json(
      { error: 'Failed to start worker', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Auto-start worker when this module loads
if (typeof window === 'undefined') {
  // Server-side only
  if (!workerInstance) {
    try {
      workerInstance = createAutomationWorker();
      console.log('✅ Automation worker auto-started on server boot');
    } catch (error) {
      console.error('❌ Failed to auto-start worker:', error);
    }
  }
}
