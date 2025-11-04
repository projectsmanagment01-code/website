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

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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

    // Execute pipeline
    const result = await RecipePipelineOrchestrator.executePipeline({
      spyDataId: targetSpyDataId,
      authorId: authorId || undefined,
      onProgress: async (step, total, message) => {
        console.log(`Pipeline progress: ${step}/${total} - ${message}`);
      }
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        recipeId: result.recipeId,
        recipeUrl: result.recipeUrl,
        logs: result.logs
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        stage: result.stage,
        logs: result.logs
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Pipeline execution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
