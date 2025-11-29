import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';

// GET - List all subscribers with pagination
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResponse = await checkHybridAuthOrRespond(request);
    if (!authResponse.authorized) return authResponse.response;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status') || 'all';
    const search = url.searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (status !== 'all') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [subscribers, total] = await Promise.all([
      executeWithRetry(
        async () =>
          await prisma.subscriber.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { subscribedAt: 'desc' },
          }),
        { maxRetries: 3, retryDelay: 1000, operationName: 'getSubscribers' }
      ),
      executeWithRetry(
        async () => await prisma.subscriber.count({ where: whereClause }),
        { maxRetries: 3, retryDelay: 1000, operationName: 'countSubscribers' }
      ),
    ]);

    // Get stats
    const [activeCount, unsubscribedCount] = await Promise.all([
      executeWithRetry(
        async () => await prisma.subscriber.count({ where: { status: 'active' } }),
        { maxRetries: 3, retryDelay: 1000, operationName: 'countActive' }
      ),
      executeWithRetry(
        async () => await prisma.subscriber.count({ where: { status: 'unsubscribed' } }),
        { maxRetries: 3, retryDelay: 1000, operationName: 'countUnsubscribed' }
      ),
    ]);

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        active: activeCount,
        unsubscribed: unsubscribedCount,
        total: activeCount + unsubscribedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a subscriber
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authResponse = await checkHybridAuthOrRespond(request);
    if (!authResponse.authorized) return authResponse.response;

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Subscriber ID is required' },
        { status: 400 }
      );
    }

    await executeWithRetry(
      async () =>
        await prisma.subscriber.delete({
          where: { id },
        }),
      { maxRetries: 3, retryDelay: 1000, operationName: 'deleteSubscriber' }
    );

    return NextResponse.json({
      success: true,
      message: 'Subscriber deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}

// PUT - Update subscriber status (unsubscribe/reactivate)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authResponse = await checkHybridAuthOrRespond(request);
    if (!authResponse.authorized) return authResponse.response;

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    if (!['active', 'unsubscribed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updateData: any = { status };
    if (status === 'unsubscribed') {
      updateData.unsubscribedAt = new Date();
    } else {
      updateData.unsubscribedAt = null;
    }

    const subscriber = await executeWithRetry(
      async () =>
        await prisma.subscriber.update({
          where: { id },
          data: updateData,
        }),
      { maxRetries: 3, retryDelay: 1000, operationName: 'updateSubscriber' }
    );

    return NextResponse.json({
      success: true,
      message: 'Subscriber updated successfully',
      subscriber,
    });
  } catch (error) {
    console.error('Error updating subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}
