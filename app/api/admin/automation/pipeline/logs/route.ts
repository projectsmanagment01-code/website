import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

/**
 * GET /api/admin/automation/pipeline/logs
 * Fetches pipeline execution logs with filtering and pagination
 */
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authResult = await verifyAdminToken(request);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status'); // RUNNING, SUCCESS, FAILED
    const scheduleId = searchParams.get('scheduleId');
    const spyDataId = searchParams.get('spyDataId');
    const triggeredBy = searchParams.get('triggeredBy'); // schedule, manual
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (scheduleId) {
      where.scheduleId = scheduleId;
    }
    
    if (spyDataId) {
      where.spyDataId = spyDataId;
    }
    
    if (triggeredBy) {
      where.triggeredBy = triggeredBy;
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Fetch logs with relations
    const [logs, total] = await Promise.all([
      prisma.pipelineExecutionLog.findMany({
        where,
        include: {
          schedule: {
            select: {
              id: true,
              scheduleType: true,
              cronExpression: true,
              enabled: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.pipelineExecutionLog.count({ where })
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching pipeline logs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch pipeline logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
