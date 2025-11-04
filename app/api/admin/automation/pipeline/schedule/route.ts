/**
 * API Route: Manage Pipeline Schedules
 * GET /api/admin/automation/pipeline/schedule - List all schedules
 * POST /api/admin/automation/pipeline/schedule - Create new schedule
 * PUT /api/admin/automation/pipeline/schedule - Update schedule
 * DELETE /api/admin/automation/pipeline/schedule - Delete schedule
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { PrismaClient } from '@prisma/client';
import { scheduleRecipePipeline, removeScheduledPipeline, getScheduledJobs } from '@/automation/jobs/pipeline-jobs';

const prisma = new PrismaClient();

// GET - List all schedules
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schedules = await prisma.automationSchedule.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Get active jobs from queue
    const activeJobs = await getScheduledJobs();

    return NextResponse.json({
      success: true,
      schedules,
      activeJobs: activeJobs.map(job => ({
        id: job.id,
        key: job.key,
        pattern: job.pattern,
        next: job.next
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching schedules:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create new schedule
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      cronExpression,
      batchSize = 1,
      enabled = false,
      authorId,
      filters
    } = body;

    if (!name || !cronExpression) {
      return NextResponse.json(
        { error: 'Missing required fields: name, cronExpression' },
        { status: 400 }
      );
    }

    // Validate cron expression (basic check)
    if (!isValidCronExpression(cronExpression)) {
      return NextResponse.json(
        { error: 'Invalid cron expression' },
        { status: 400 }
      );
    }

    // Create schedule in database
    const schedule = await prisma.automationSchedule.create({
      data: {
        enabled,
        scheduleType: 'custom',
        cronExpression,
        runCount: 0
      }
    });

    // If enabled, add to queue
    if (enabled) {
      await scheduleRecipePipeline(
        schedule.id,
        cronExpression,
        batchSize,
        authorId,
        filters
      );
    }

    return NextResponse.json({
      success: true,
      schedule
    });

  } catch (error) {
    console.error('❌ Error creating schedule:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update schedule
export async function PUT(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, enabled, cronExpression, batchSize, authorId, filters } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing schedule ID' },
        { status: 400 }
      );
    }

    const schedule = await prisma.automationSchedule.findUnique({
      where: { id }
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Remove existing job if any
    if (schedule.enabled) {
      await removeScheduledPipeline(id).catch(e => 
        console.warn('Failed to remove old schedule:', e)
      );
    }

    // Update schedule
    const updatedSchedule = await prisma.automationSchedule.update({
      where: { id },
      data: {
        enabled: enabled ?? schedule.enabled,
        cronExpression: cronExpression ?? schedule.cronExpression
      }
    });

    // Add new job if enabled
    if (updatedSchedule.enabled && updatedSchedule.cronExpression) {
      await scheduleRecipePipeline(
        updatedSchedule.id,
        updatedSchedule.cronExpression,
        batchSize || 1,
        authorId,
        filters
      );
    }

    return NextResponse.json({
      success: true,
      schedule: updatedSchedule
    });

  } catch (error) {
    console.error('❌ Error updating schedule:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete schedule
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing schedule ID' },
        { status: 400 }
      );
    }

    const schedule = await prisma.automationSchedule.findUnique({
      where: { id }
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Remove from queue
    if (schedule.enabled) {
      await removeScheduledPipeline(id).catch(e => 
        console.warn('Failed to remove schedule from queue:', e)
      );
    }

    // Delete from database
    await prisma.automationSchedule.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting schedule:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Basic cron expression validation
 */
function isValidCronExpression(expression: string): boolean {
  const parts = expression.split(' ');
  return parts.length >= 5 && parts.length <= 7;
}
