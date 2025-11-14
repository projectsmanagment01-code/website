/**
 * Recipe Generation Queue API
 * 
 * Endpoints for managing recipe generation from Pinterest spy data:
 * - POST: Queue entries for generation
 * - GET: Get queue status
 * - PUT: Process the generation queue
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api-auth";
import { RecipeGenerationQueue, GenerationRequest } from "@/lib/pinterest-spy/recipe-generation-queue";

// Cache control
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/admin/pinterest-spy/generate-recipes
 * Get generation queue status
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await RecipeGenerationQueue.getQueueStatus();
    
    return NextResponse.json({
      message: 'Generation queue status',
      status
    });
  } catch (error) {
    console.error('❌ Error getting generation queue status:', error);
    return NextResponse.json(
      { error: 'Failed to get queue status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pinterest-spy/generate-recipes
 * Queue spy data entries for recipe generation
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entryIds, priority = 0, options = {} } = body;

    if (!entryIds || !Array.isArray(entryIds) || entryIds.length === 0) {
      return NextResponse.json(
        { error: 'Array of spy data entry IDs is required' },
        { status: 400 }
      );
    }

    console.log(`🎯 Queueing ${entryIds.length} entries for recipe generation`);

    // Convert entry IDs to generation requests
    const requests: GenerationRequest[] = entryIds.map((id: string) => ({
      spyDataId: id,
      priority,
      options
    }));

    const result = await RecipeGenerationQueue.queueForGeneration(requests);

    return NextResponse.json({
      message: `Queued ${result.queued} entries for generation`,
      queued: result.queued,
      failed: result.failed,
      results: result.results
    });
  } catch (error) {
    console.error('❌ Error queueing for generation:', error);
    return NextResponse.json(
      { error: 'Failed to queue for generation' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/pinterest-spy/generate-recipes
 * Process the generation queue (actually generate recipes)
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { batchSize = 3 } = body;

    console.log(`🚀 Processing generation queue with batch size: ${batchSize}`);

    const result = await RecipeGenerationQueue.processGenerationQueue(batchSize);

    return NextResponse.json({
      message: `Processed ${result.processed} recipes successfully, ${result.failed} failed`,
      processed: result.processed,
      failed: result.failed,
      results: result.results
    });
  } catch (error) {
    console.error('❌ Error processing generation queue:', error);
    return NextResponse.json(
      { error: 'Failed to process generation queue' },
      { status: 500 }
    );
  }
}