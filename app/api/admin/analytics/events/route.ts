import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, recipeId, sessionId, meta } = body;

    if (!eventType) {
      return NextResponse.json({ success: false, error: 'Event type required' }, { status: 400 });
    }

    await executeWithRetry(
      async () => {
        // @ts-ignore
        if (!prisma.conversionEvent) return;

        await prisma.conversionEvent.create({
          data: {
            eventType,
            recipeId: recipeId || null,
            sessionId: sessionId || null,
            meta: meta || {},
            createdAt: new Date(),
          },
        });
      },
      { maxRetries: 3, retryDelay: 1000, operationName: 'trackConversion' }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking conversion:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
