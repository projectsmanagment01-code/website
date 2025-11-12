/**
 * Diagnostics endpoint for automation system
 * GET /api/admin/automation/diagnostics
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getWorkerInstance } from '@/lib/worker-init';
import { pipelineQueue } from '@/automation/jobs/pipeline-jobs';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      checks: {}
    };

    // Check 1: Worker Status
    try {
      const worker = getWorkerInstance();
      diagnostics.checks.worker = {
        status: worker ? 'RUNNING' : 'NOT_INITIALIZED',
        isActive: worker?.isRunning() || false,
        isClosing: worker?.closing || false
      };
    } catch (error) {
      diagnostics.checks.worker = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Check 2: Queue Status
    try {
      const queueJobs = await pipelineQueue.getJobs(['waiting', 'active', 'delayed']);
      const repeatableJobs = await pipelineQueue.getRepeatableJobs();
      
      diagnostics.checks.queue = {
        status: 'OK',
        waitingJobs: queueJobs.filter(j => j.name === 'waiting').length,
        activeJobs: queueJobs.filter(j => j.name === 'active').length,
        delayedJobs: queueJobs.filter(j => j.name === 'delayed').length,
        repeatableJobs: repeatableJobs.length,
        schedules: repeatableJobs.map(j => ({
          key: j.key,
          pattern: j.pattern,
          next: j.next
        }))
      };
    } catch (error) {
      diagnostics.checks.queue = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Check 3: Upload Directory
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'generated-recipes');
      await fs.mkdir(uploadDir, { recursive: true });
      
      const stats = await fs.stat(uploadDir);
      const files = await fs.readdir(uploadDir);
      
      // Test write permission
      const testFile = path.join(uploadDir, '_test_write.txt');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      
      diagnostics.checks.uploadDirectory = {
        status: 'OK',
        path: uploadDir,
        exists: true,
        writable: true,
        fileCount: files.length,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    } catch (error) {
      diagnostics.checks.uploadDirectory = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Check 4: Database
    try {
      const schedules = await prisma.automationSchedule.count();
      const executionLogs = await prisma.pipelineExecutionLog.count();
      const spyData = await prisma.pinterestSpyData.count();
      
      diagnostics.checks.database = {
        status: 'OK',
        schedules,
        executionLogs,
        spyDataEntries: spyData
      };
    } catch (error) {
      diagnostics.checks.database = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Check 5: Recent Execution Logs
    try {
      const recentLogs = await prisma.pipelineExecutionLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          stage: true,
          error: true,
          triggeredBy: true,
          createdAt: true,
          completedAt: true
        }
      });
      
      diagnostics.checks.recentExecutions = {
        status: 'OK',
        logs: recentLogs
      };
    } catch (error) {
      diagnostics.checks.recentExecutions = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Overall status
    const hasErrors = Object.values(diagnostics.checks).some((check: any) => check.status === 'ERROR');
    diagnostics.overallStatus = hasErrors ? 'DEGRADED' : 'HEALTHY';

    return NextResponse.json(diagnostics, { status: 200 });

  } catch (error) {
    console.error('Diagnostics error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'FAILED'
    }, { status: 500 });
  }
}
