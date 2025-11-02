/**
 * Pinterest Spy Data SEO Processing API
 * 
 * Dedicated endpoint for processing SEO metadata extraction
 * - POST: Process SEO for specific entries
 * - GET: Get SEO processing status
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api-auth";
import { PrismaClient } from "@prisma/client";
import { SEOExtractionService } from "@/lib/pinterest-spy/seo-extraction-service";

const prisma = new PrismaClient();

// Cache control
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * POST /api/admin/pinterest-spy/process-seo
 * Process SEO extraction for specific entries
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entryIds, batchSize = 5 } = body;

    if (!entryIds || !Array.isArray(entryIds) || entryIds.length === 0) {
      return NextResponse.json(
        { error: 'Array of entry IDs is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting SEO processing for ${entryIds.length} entries`);

    // Process in batches to avoid overwhelming the AI API
    const batches = [];
    for (let i = 0; i < entryIds.length; i += batchSize) {
      batches.push(entryIds.slice(i, i + batchSize));
    }

    const allResults = [];
    let totalProcessed = 0;
    let totalFailed = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} entries)`);

      const batchResults = await processSEOBatch(batch);
      allResults.push(...batchResults.results);
      totalProcessed += batchResults.processed;
      totalFailed += batchResults.failed;

      // Add delay between batches
      if (batchIndex < batches.length - 1) {
        console.log('⏳ Waiting between batches...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`✅ SEO processing complete: ${totalProcessed} success, ${totalFailed} failed`);

    return NextResponse.json({
      message: `SEO processing complete`,
      totalEntries: entryIds.length,
      processed: totalProcessed,
      failed: totalFailed,
      results: allResults
    });
  } catch (error) {
    console.error('❌ Error processing SEO:', error);
    return NextResponse.json(
      { error: 'Failed to process SEO' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/pinterest-spy/process-seo
 * Get SEO processing status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get processing statistics
    const stats = await prisma.pinterestSpyData.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const statusCounts = stats.reduce((acc: Record<string, number>, stat: any) => {
      acc[stat.status] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Get recent processing activity
    const recentActivity = await prisma.pinterestSpyData.findMany({
      where: {
        seoProcessedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { seoProcessedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        spyTitle: true,
        seoKeyword: true,
        status: true,
        seoProcessedAt: true,
        seoProcessingError: true
      }
    });

    // Get entries ready for processing
    const readyForProcessing = await prisma.pinterestSpyData.count({
      where: {
        status: 'PENDING',
        seoKeyword: null
      }
    });

    return NextResponse.json({
      stats: {
        byStatus: statusCounts,
        readyForProcessing,
        recentlyProcessed: recentActivity.length
      },
      recentActivity
    });
  } catch (error) {
    console.error('❌ Error getting SEO processing status:', error);
    return NextResponse.json(
      { error: 'Failed to get processing status' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to process a batch of entries using TRUE BATCH processing
 * Sends all entries in ONE API call instead of individual requests
 */
async function processSEOBatch(entryIds: string[]): Promise<{
  processed: number;
  failed: number;
  results: Array<{ id: string; success: boolean; error?: string; seoData?: any }>;
}> {
  const results: Array<{ id: string; success: boolean; error?: string; seoData?: any }> = [];
  let processed = 0;
  let failed = 0;

  console.log(`🚀 TRUE BATCH: Processing ${entryIds.length} entries in ONE API call`);

  // Fetch all entries at once
  const allSpyData = await prisma.pinterestSpyData.findMany({
    where: { id: { in: entryIds } }
  });

  // Create a map for quick lookup
  const spyDataMap = new Map(allSpyData.map(data => [data.id, data]));

  // Separate already processed from pending
  const pendingEntries: Array<{ id: string; data: any }> = [];
  
  for (const entryId of entryIds) {
    const spyData = spyDataMap.get(entryId);

    if (!spyData) {
      results.push({ id: entryId, success: false, error: 'Entry not found' });
      failed++;
      continue;
    }

    // Skip if already processed
    if (spyData.status === 'SEO_COMPLETED' && spyData.seoKeyword) {
      console.log(`⏭️ Skipping already processed: ${spyData.spyTitle}`);
      results.push({ 
        id: entryId, 
        success: true, 
        seoData: {
          seoKeyword: spyData.seoKeyword,
          seoTitle: spyData.seoTitle,
          seoDescription: spyData.seoDescription,
          seoCategory: spyData.seoCategory
        }
      });
      processed++;
      continue;
    }

    pendingEntries.push({ id: entryId, data: spyData });
  }

  // If no pending entries, return early
  if (pendingEntries.length === 0) {
    console.log('✅ All entries already processed');
    return { processed, failed, results };
  }

  console.log(`📦 Sending ${pendingEntries.length} entries to AI in ONE batch...`);

  try {
    // Update all to processing status
    await prisma.pinterestSpyData.updateMany({
      where: { id: { in: pendingEntries.map(e => e.id) } },
      data: { 
        status: 'SEO_PROCESSING',
        seoProcessingAttempts: { increment: 1 }
      }
    });

    // Call the TRUE BATCH extraction service
    const batchResults = await SEOExtractionService.batchExtractSEO(
      pendingEntries.map(e => ({
        spyTitle: e.data.spyTitle,
        spyDescription: e.data.spyDescription,
        spyImageUrl: e.data.spyImageUrl,
        spyArticleUrl: e.data.spyArticleUrl,
        spyPinImage: e.data.spyPinImage || undefined,
        annotation: e.data.annotation || undefined
      })),
      pendingEntries.length // Batch size = all pending entries
    );

    // Process results and update database
    for (let i = 0; i < batchResults.length; i++) {
      const result = batchResults[i];
      const entryId = pendingEntries[i].id;

      if (result.success && result.data) {
        // Update with SEO data
        await prisma.pinterestSpyData.update({
          where: { id: entryId },
          data: {
            seoKeyword: result.data.seoKeyword,
            seoTitle: result.data.seoTitle,
            seoDescription: result.data.seoDescription,
            seoCategory: result.data.seoCategory || null,
            status: 'SEO_COMPLETED',
            seoProcessedAt: new Date(),
            seoProcessingError: null
          }
        });

        results.push({ 
          id: entryId, 
          success: true, 
          seoData: {
            seoKeyword: result.data.seoKeyword,
            seoTitle: result.data.seoTitle,
            seoDescription: result.data.seoDescription,
            seoCategory: result.data.seoCategory,
            confidence: result.data.confidence,
            reasoning: result.data.reasoning
          }
        });
        processed++;
        
        console.log(`✅ [${i + 1}/${batchResults.length}] ${result.data.seoCategory || 'no-cat'} | ${result.data.seoKeyword}`);
      } else {
        // Update with error
        await prisma.pinterestSpyData.update({
          where: { id: entryId },
          data: {
            status: 'SEO_FAILED',
            seoProcessingError: result.error || 'Unknown error'
          }
        });

        results.push({ 
          id: entryId, 
          success: false, 
          error: result.error 
        });
        failed++;
        
        console.error(`❌ [${i + 1}/${batchResults.length}] Failed: ${result.error}`);
      }
    }

    console.log(`✅ TRUE BATCH complete: ${processed} processed, ${failed} failed`);
  } catch (batchError) {
    console.error('❌ Batch processing error:', batchError);
    
    // Mark all pending entries as failed
    for (const entry of pendingEntries) {
      try {
        await prisma.pinterestSpyData.update({
          where: { id: entry.id },
          data: {
            status: 'SEO_FAILED',
            seoProcessingError: batchError instanceof Error ? batchError.message : 'Batch processing error'
          }
        });
      } catch (updateError) {
        console.error('❌ Failed to update error status:', updateError);
      }

      results.push({ 
        id: entry.id, 
        success: false, 
        error: batchError instanceof Error ? batchError.message : 'Batch processing error'
      });
      failed++;
    }
  }

  return { processed, failed, results };
}