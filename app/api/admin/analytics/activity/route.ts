import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResponse = await checkHybridAuthOrRespond(request);
    if (!authResponse.authorized) return authResponse.response;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      executeWithRetry(
        async () => await prisma.analyticsVisitor.findMany({
          take: limit,
          skip: skip,
          orderBy: { visitedAt: 'desc' },
          select: {
            country: true,
            city: true,
            page: true,
            visitedAt: true,
            deviceType: true
          }
        }),
        { operationName: 'getPaginatedActivity' }
      ),
      executeWithRetry(
        async () => await prisma.analyticsVisitor.count(),
        { operationName: 'countActivity' }
      )
    ]);

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
