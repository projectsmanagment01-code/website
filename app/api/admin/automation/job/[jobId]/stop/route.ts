import { NextRequest, NextResponse } from 'next/server';
import { cancelJob } from '@/automation';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Cancel the job from queue
    await cancelJob(jobId);

    // Update database status
    await prisma.recipeAutomation.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: 'Job stopped by user',
        completedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Job stopped successfully' 
    });
  } catch (error) {
    console.error('Stop job error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to stop job' },
      { status: 500 }
    );
  }
}
