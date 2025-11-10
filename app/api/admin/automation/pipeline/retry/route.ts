import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { RecipePipelineOrchestrator } from '@/automation/pipeline/recipe-pipeline';
import { CheckpointManager } from '@/automation/pipeline/checkpoint-manager';

/**
 * POST /api/admin/automation/pipeline/retry
 * Retry a failed pipeline entry from the last successful checkpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authError = await verifyAuth();
    if (authError) {
      return authError;
    }

    const body = await request.json();
    const { spyDataId } = body;

    if (!spyDataId) {
      return NextResponse.json(
        { error: 'spyDataId is required' },
        { status: 400 }
      );
    }

    // Get checkpoint info
    const resumeInfo = await CheckpointManager.determineResumeStep(spyDataId);
    const summary = await CheckpointManager.getResumeSummary(spyDataId);

    console.log(`🔄 RETRY REQUEST for ${spyDataId}`);
    console.log(`Resume Info:`, resumeInfo);
    console.log(`Summary:`, summary);

    // Reset status to allow processing
    await CheckpointManager.resetForRetry(spyDataId);

    // Execute pipeline from checkpoint
    const result = await RecipePipelineOrchestrator.executePipeline({
      spyDataId,
      onProgress: async (step, total, message) => {
        console.log(`[${step}/${total}] ${message}`);
      }
    });

    return NextResponse.json({
      success: result.success,
      resumeInfo,
      summary,
      result
    });

  } catch (error) {
    console.error('Error in retry endpoint:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/automation/pipeline/retry
 * Get list of all retriable entries
 */
export async function GET() {
  try {
    // Verify admin authentication
    const authError = await verifyAuth();
    if (authError) {
      return authError;
    }

    const entries = await CheckpointManager.getRetriableEntries();

    // Add resume summaries
    const entriesWithSummaries = await Promise.all(
      entries.map(async (entry) => ({
        ...entry,
        resumeSummary: await CheckpointManager.getResumeSummary(entry.id),
        hasImages: !!(entry.generatedImage1Url && entry.generatedImage2Url && entry.generatedImage3Url && entry.generatedImage4Url),
        hasSEO: !!(entry.seoKeyword && entry.seoTitle)
      }))
    );

    return NextResponse.json({
      entries: entriesWithSummaries,
      count: entriesWithSummaries.length
    });

  } catch (error) {
    console.error('Error fetching retriable entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
