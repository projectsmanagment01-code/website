/**
 * Worker Management API
 * Start/stop the BullMQ automation worker
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { createAutomationWorker } from '@/automation/queue/automation.worker';
import { Worker } from 'bullmq';

// Global worker instance (persists across requests)
let workerInstance: Worker | null = null;

/**
 * GET /api/admin/automation/worker
 * Check if worker is running
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isRunning = workerInstance !== null && !workerInstance.closing;

    return NextResponse.json({
      running: isRunning,
      status: isRunning ? 'active' : 'stopped',
    });
  } catch (error) {
    console.error('Error checking worker status:', error);
    return NextResponse.json(
      { error: 'Failed to check worker status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/automation/worker
 * Start the automation worker
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if worker already running
    if (workerInstance && !workerInstance.closing) {
      return NextResponse.json({
        success: true,
        message: 'Worker is already running',
        status: 'active',
      });
    }

    // Start the worker
    workerInstance = createAutomationWorker();

    return NextResponse.json({
      success: true,
      message: 'Worker started successfully',
      status: 'active',
    });
  } catch (error) {
    console.error('Error starting worker:', error);
    return NextResponse.json(
      { error: 'Failed to start worker' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/automation/worker
 * Stop the automation worker
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if worker is running
    if (!workerInstance || workerInstance.closing) {
      return NextResponse.json({
        success: true,
        message: 'Worker is not running',
        status: 'stopped',
      });
    }

    // Stop the worker
    await workerInstance.close();
    workerInstance = null;

    return NextResponse.json({
      success: true,
      message: 'Worker stopped successfully',
      status: 'stopped',
    });
  } catch (error) {
    console.error('Error stopping worker:', error);
    return NextResponse.json(
      { error: 'Failed to stop worker' },
      { status: 500 }
    );
  }
}
