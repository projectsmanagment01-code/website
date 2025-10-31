import { NextRequest, NextResponse } from 'next/server';
import { addAutomationJob } from '@/automation';
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

    // Get the failed job details from database
    const failedJob = await prisma.recipeAutomation.findUnique({
      where: { id: jobId }
    });

    if (!failedJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (failedJob.status !== 'FAILED') {
      return NextResponse.json({ 
        error: 'Only failed jobs can be retried' 
      }, { status: 400 });
    }

    // Delete the old failed job record
    await prisma.recipeAutomation.delete({
      where: { id: jobId }
    });

    // Add a new job to the queue for the same row
    const newJobId = await addAutomationJob();

    return NextResponse.json({ 
      success: true,
      message: 'Job retried successfully',
      jobId: newJobId
    });
  } catch (error) {
    console.error('Retry job error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retry job' },
      { status: 500 }
    );
  }
}
