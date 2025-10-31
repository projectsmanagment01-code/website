import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    // Delete the job from database
    await prisma.recipeAutomation.delete({
      where: { id: jobId }
    });

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete job:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
