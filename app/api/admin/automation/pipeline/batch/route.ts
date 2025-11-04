/**
 * API Route: Trigger Batch Pipeline Processing
 * POST /api/admin/automation/pipeline/batch
 * 
 * Processes multiple spy data entries in a batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { RecipePipelineOrchestrator } from '@/automation/pipeline/recipe-pipeline';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { spyDataIds, batchSize = 5, authorId } = body;

    let targetIds: string[] = [];

    // If specific IDs provided, use those
    if (spyDataIds && Array.isArray(spyDataIds) && spyDataIds.length > 0) {
      targetIds = spyDataIds;
    } else {
      // Otherwise, get next pending entries
      const entries = await prisma.pinterestSpyData.findMany({
        where: {
          generatedRecipeId: null,
          status: { in: ['PENDING', 'SEO_COMPLETED'] }
        },
        take: batchSize,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        select: { id: true }
      });

      targetIds = entries.map(e => e.id);
    }

    if (targetIds.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        failed: 0,
        recipes: [],
        message: 'No entries to process'
      });
    }

    console.log(`🚀 Starting batch processing: ${targetIds.length} entries`);

    const results: Array<{
      spyDataId: string;
      success: boolean;
      recipeId?: string;
      recipeUrl?: string;
      error?: string;
    }> = [];

    // Process each entry
    for (let i = 0; i < targetIds.length; i++) {
      const spyDataId = targetIds[i];
      
      console.log(`Processing ${i + 1}/${targetIds.length}: ${spyDataId}`);

      try {
        const result = await RecipePipelineOrchestrator.executePipeline({
          spyDataId,
          authorId,
          onProgress: async (step, total, message) => {
            console.log(`  Step ${step}/${total}: ${message}`);
          }
        });

        results.push({
          spyDataId,
          success: result.success,
          recipeId: result.recipeId,
          recipeUrl: result.recipeUrl,
          error: result.error
        });

        console.log(result.success ? `✅ Success` : `❌ Failed: ${result.error}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          spyDataId,
          success: false,
          error: errorMessage
        });

        console.error(`❌ Pipeline error:`, error);
      }

      // Delay between entries to avoid rate limits
      if (i < targetIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const processed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Batch complete: ${processed} succeeded, ${failed} failed`);

    return NextResponse.json({
      success: true,
      processed,
      failed,
      recipes: results
    });

  } catch (error) {
    console.error('❌ Batch processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
