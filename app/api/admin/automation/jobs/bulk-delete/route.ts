import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { jobIds } = await request.json();

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid job IDs' },
        { status: 400 }
      );
    }

    // Delete multiple jobs from database
    const result = await prisma.recipeAutomation.deleteMany({
      where: {
        id: { in: jobIds }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} job(s)`,
      count: result.count
    });

  } catch (error) {
    console.error('Failed to bulk delete jobs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete jobs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
