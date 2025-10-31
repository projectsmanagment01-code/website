import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch current schedule configuration
export async function GET() {
  try {
    // Get or create default schedule
    let schedule = await prisma.automationSchedule.findFirst();
    
    if (!schedule) {
      schedule = await prisma.automationSchedule.create({
        data: {
          enabled: false,
          scheduleType: 'manual',
        },
      });
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule configuration' },
      { status: 500 }
    );
  }
}

// PUT - Update schedule configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      enabled,
      scheduleType,
      cronExpression,
      timeOfDay,
      dayOfWeek,
    } = body;

    // Get or create schedule
    let schedule = await prisma.automationSchedule.findFirst();
    
    if (!schedule) {
      schedule = await prisma.automationSchedule.create({
        data: {
          enabled: enabled ?? false,
          scheduleType: scheduleType ?? 'manual',
          cronExpression,
          timeOfDay,
          dayOfWeek,
        },
      });
    } else {
      schedule = await prisma.automationSchedule.update({
        where: { id: schedule.id },
        data: {
          enabled: enabled !== undefined ? enabled : schedule.enabled,
          scheduleType: scheduleType ?? schedule.scheduleType,
          cronExpression: cronExpression !== undefined ? cronExpression : schedule.cronExpression,
          timeOfDay: timeOfDay !== undefined ? timeOfDay : schedule.timeOfDay,
          dayOfWeek: dayOfWeek !== undefined ? dayOfWeek : schedule.dayOfWeek,
          updatedAt: new Date(),
        },
      });
    }

    // TODO: Update cron scheduler with new configuration
    // This will be implemented in the scheduler service

    return NextResponse.json({ schedule, message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Failed to update schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule configuration' },
      { status: 500 }
    );
  }
}
