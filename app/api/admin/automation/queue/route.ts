import { NextRequest, NextResponse } from 'next/server';
import { automationQueue } from '@/automation/queue/automation.queue';

export async function POST(request: NextRequest) {
  try {
    // Get all waiting jobs
    const waitingJobs = await automationQueue.getWaiting();
    const activeJobs = await automationQueue.getActive();
    const completedJobs = await automationQueue.getCompleted();
    const failedJobs = await automationQueue.getFailed();
    
    const { action } = await request.json();
    
    if (action === 'list') {
      return NextResponse.json({
        success: true,
        jobs: {
          waiting: waitingJobs.map(j => ({ id: j.id, name: j.name, data: j.data })),
          active: activeJobs.map(j => ({ id: j.id, name: j.name, data: j.data })),
          completed: completedJobs.slice(0, 10).map(j => ({ id: j.id, name: j.name })),
          failed: failedJobs.slice(0, 10).map(j => ({ id: j.id, name: j.name })),
        }
      });
    }
    
    if (action === 'clean') {
      // Remove all waiting jobs
      await Promise.all(waitingJobs.map(job => job.remove()));
      
      // Clean completed jobs (older than 1 hour)
      await automationQueue.clean(3600000, 1000, 'completed');
      
      // Clean failed jobs (older than 1 hour)
      await automationQueue.clean(3600000, 1000, 'failed');
      
      return NextResponse.json({
        success: true,
        message: `Cleaned ${waitingJobs.length} waiting jobs, completed and failed jobs`,
        removed: {
          waiting: waitingJobs.length,
        }
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "list" or "clean"' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Failed to manage queue:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to manage queue',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
