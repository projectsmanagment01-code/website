/**
 * API Route: Run Full Recipe Pipeline
 * POST /api/admin/automation/pipeline/run
 * 
 * Executes the complete pipeline: Pinterest Spy Data → SEO → Images → Recipe → Published
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { RecipePipelineOrchestrator } from '@/automation/pipeline/recipe-pipeline';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configure route for long-running operations (image generation can take time)
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let executionLog: any = null;
  
  try {
    // Skip auth in development
    const isDev = process.env.NODE_ENV === 'development' || process.env.SKIP_AUTH === 'true';
    if (!isDev) {
      const authResult = await verifyAuth(req);
      if (!authResult) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } else {
      console.log('🔓 Skipping auth (development mode)');
    }

    const body = await req.json();
    const { spyDataId, authorId, autoSelect } = body;

    let targetSpyDataId = spyDataId;

    // If no spyDataId provided, get next pending entry
    if (!targetSpyDataId && autoSelect) {
      targetSpyDataId = await RecipePipelineOrchestrator.getNextPendingEntry();
      if (!targetSpyDataId) {
        return NextResponse.json({
          success: false,
          error: 'No pending spy data entries found'
        });
      }
    }

    if (!targetSpyDataId) {
      return NextResponse.json(
        { error: 'Missing spyDataId or autoSelect=true' },
        { status: 400 }
      );
    }

    // Get spy data title for logging
    const spyData = await prisma.pinterestSpyData.findUnique({
      where: { id: targetSpyDataId },
      select: { spyTitle: true }
    });

    // Create execution log entry
    executionLog = await prisma.pipelineExecutionLog.create({
      data: {
        spyDataId: targetSpyDataId,
        spyTitle: spyData?.spyTitle || null,
        authorId: authorId || null,
        status: 'RUNNING',
        stage: 'STARTING',
        progress: 0,
        logs: [{ timestamp: new Date().toISOString(), message: 'Pipeline started' }],
        triggeredBy: 'MANUAL',
        startedAt: new Date()
      }
    });

    console.log(`📊 Created execution log: ${executionLog.id}`);

    // Execute pipeline with progress tracking
    const result = await RecipePipelineOrchestrator.executePipeline({
      spyDataId: targetSpyDataId,
      authorId: authorId || undefined,
      onProgress: async (step, total, message) => {
        console.log(`Pipeline progress: ${step}/${total} - ${message}`);
        
        // Update execution log with progress
        await prisma.pipelineExecutionLog.update({
          where: { id: executionLog.id },
          data: {
            progress: Math.round((step / total) * 100),
            logs: {
              push: {
                timestamp: new Date().toISOString(),
                step,
                total,
                message
              }
            }
          }
        }).catch(err => console.error('Failed to update progress:', err));
      }
    });

    const durationMs = Date.now() - new Date(executionLog.startedAt).getTime();

    if (result.success) {
      // Update execution log as SUCCESS
      await prisma.pipelineExecutionLog.update({
        where: { id: executionLog.id },
        data: {
          status: 'SUCCESS',
          stage: 'COMPLETED',
          progress: 100,
          recipeId: result.recipeId,
          recipeUrl: result.recipeUrl,
          completedAt: new Date(),
          durationMs,
          logs: result.logs.map(log => ({
            timestamp: new Date().toISOString(),
            message: log
          }))
        }
      });

      return NextResponse.json({
        success: true,
        recipeId: result.recipeId,
        recipeUrl: result.recipeUrl,
        executionLogId: executionLog.id,
        logs: result.logs
      });
    } else {
      // Update execution log as FAILED
      await prisma.pipelineExecutionLog.update({
        where: { id: executionLog.id },
        data: {
          status: 'FAILED',
          stage: result.stage || 'UNKNOWN',
          error: result.error,
          errorStage: result.stage,
          completedAt: new Date(),
          durationMs,
          logs: result.logs.map(log => ({
            timestamp: new Date().toISOString(),
            message: log
          }))
        }
      });

      return NextResponse.json({
        success: false,
        error: result.error,
        stage: result.stage,
        executionLogId: executionLog.id,
        logs: result.logs
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Pipeline execution error:', error);
    
    // Update execution log as FAILED if it exists
    if (executionLog) {
      await prisma.pipelineExecutionLog.update({
        where: { id: executionLog.id },
        data: {
          status: 'FAILED',
          stage: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
          durationMs: Date.now() - new Date(executionLog.startedAt).getTime()
        }
      }).catch(err => console.error('Failed to update log:', err));
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
