import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, sessionId, resultsCount } = body;

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query required' }, { status: 400 });
    }

    await executeWithRetry(
      async () => {
        // @ts-ignore
        if (!prisma.searchQuery) {
          console.warn('Prisma SearchQuery model not available yet');
          return;
        }
        
        await prisma.searchQuery.create({
          data: {
            query: query.trim(),
            sessionId: sessionId || null,
            resultsCount: resultsCount || 0,
            searchedAt: new Date(),
          },
        });
      },
      { maxRetries: 3, retryDelay: 1000, operationName: 'trackSearch' }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking search:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
