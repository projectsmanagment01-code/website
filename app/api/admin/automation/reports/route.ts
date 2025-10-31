import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // Build the where clause based on status filter
    const where: any = {};
    
    if (statusFilter && statusFilter !== 'ALL') {
      where.status = statusFilter.toUpperCase();
    }

    // Fetch automation runs from database
    const runs = await prisma.recipeAutomation.findMany({
      where,
      orderBy: {
        startedAt: 'desc'
      },
      take: 100, // Limit to most recent 100 runs
      select: {
        id: true,
        recipeRowNumber: true,
        spyTitle: true,
        postLink: true, // Use postLink instead of spyUrl
        status: true,
        currentStep: true,
        totalSteps: true,
        startedAt: true,
        completedAt: true,
        error: true,
        recipeId: true,
      }
    });

    return NextResponse.json({
      success: true,
      runs,
      count: runs.length,
      filter: statusFilter || 'ALL'
    });

  } catch (error) {
    console.error('Failed to fetch automation reports:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch automation reports',
        runs: []
      },
      { status: 500 }
    );
  }
}
