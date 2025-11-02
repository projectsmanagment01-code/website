/**
 * Pinterest Spy Data API
 * 
 * Endpoints for managing Pinterest spy data:
 * - GET: List spy data with filtering and pagination
 * - POST: Create new spy data entries (single or bulk)
 * - PUT: Update spy data entries
 * - DELETE: Delete spy data entries
 * 
 * Also handles AI processing triggers for SEO extraction
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api-auth";
import { PrismaClient } from "@prisma/client";
import { SEOExtractionService, SpyDataInput } from "@/lib/pinterest-spy/seo-extraction-service";

const prisma = new PrismaClient();

// Cache control
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/admin/pinterest-spy
 * List Pinterest spy data with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const isMarkedForGeneration = url.searchParams.get('isMarkedForGeneration');
    const batchId = url.searchParams.get('batchId');
    const search = url.searchParams.get('search');

    // Build where clause
    const where: any = {};
    
    if (status) where.status = status;
    if (isMarkedForGeneration === 'true') where.isMarkedForGeneration = true;
    if (isMarkedForGeneration === 'false') where.isMarkedForGeneration = false;
    if (batchId) where.batchId = batchId;
    
    if (search) {
      where.OR = [
        { spyTitle: { contains: search, mode: 'insensitive' } },
        { spyDescription: { contains: search, mode: 'insensitive' } },
        { seoKeyword: { contains: search, mode: 'insensitive' } },
        { seoTitle: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch data
    const [spyData, totalCount] = await Promise.all([
      prisma.pinterestSpyData.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
        include: {
          generatedRecipe: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true
            }
          }
        }
      }),
      prisma.pinterestSpyData.count({ where })
    ]);

    // Calculate statistics
    const stats = await prisma.pinterestSpyData.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const statusCounts = stats.reduce((acc: Record<string, number>, stat: any) => {
      acc[stat.status] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      data: spyData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: {
        total: totalCount,
        byStatus: statusCounts,
        markedForGeneration: spyData.filter((item: any) => item.isMarkedForGeneration).length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching Pinterest spy data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spy data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pinterest-spy
 * Create new Pinterest spy data entries (single or bulk)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { data, batchId, autoProcessSEO = false } = body;

    // Handle both single entry and bulk import
    const spyDataList = Array.isArray(data) ? data : [data];
    
    // Validate all entries
    const validationResults = spyDataList.map((item: any, index: number) => ({
      index,
      ...SEOExtractionService.validateSpyData(item)
    }));

    const invalidEntries = validationResults.filter(result => !result.valid);
    if (invalidEntries.length > 0) {
      return NextResponse.json({
        error: 'Validation failed',
        invalidEntries: invalidEntries.map(entry => ({
          index: entry.index,
          errors: entry.errors
        }))
      }, { status: 400 });
    }

    // Extract user info from auth
    const userId = authResult.type === 'jwt' 
      ? (authResult.payload as any).email 
      : (authResult.payload as any).createdBy;

    // Create spy data entries
    const createdEntries = await Promise.all(
      spyDataList.map(async (spyData: SpyDataInput, index: number) => {
        return await prisma.pinterestSpyData.create({
          data: {
            spyTitle: spyData.spyTitle,
            spyDescription: spyData.spyDescription,
            spyImageUrl: spyData.spyImageUrl,
            spyArticleUrl: spyData.spyArticleUrl,
            spyPinImage: spyData.spyPinImage,
            annotation: spyData.annotation,
            batchId: batchId || `batch_${Date.now()}`,
            createdBy: userId,
            importedAt: new Date(),
            importedBy: userId,
            priority: index // Use index as initial priority
          }
        });
      })
    );

    console.log(`✅ Created ${createdEntries.length} spy data entries`);

    // Auto-process SEO if requested
    let seoResults = null;
    if (autoProcessSEO) {
      console.log('🤖 Starting automatic SEO processing...');
      try {
        seoResults = await processSEOForEntries(createdEntries.map(entry => entry.id));
      } catch (seoError) {
        console.error('⚠️ SEO processing failed, but entries were created:', seoError);
      }
    }

    return NextResponse.json({
      message: `Successfully created ${createdEntries.length} spy data entries`,
      created: createdEntries.length,
      data: createdEntries,
      seoProcessing: seoResults
    });
  } catch (error) {
    console.error('❌ Error creating Pinterest spy data:', error);
    return NextResponse.json(
      { error: 'Failed to create spy data' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/pinterest-spy
 * Update Pinterest spy data entries
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, updates, triggerSEOProcessing = false } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Spy data ID is required' },
        { status: 400 }
      );
    }

    // Extract user info from auth
    const userId = authResult.type === 'jwt' 
      ? (authResult.payload as any).email 
      : (authResult.payload as any).createdBy;

    // Update the spy data entry
    const updatedEntry = await prisma.pinterestSpyData.update({
      where: { id },
      data: {
        ...updates,
        lastProcessedBy: userId,
        updatedAt: new Date()
      },
      include: {
        generatedRecipe: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    // Trigger SEO processing if requested
    let seoResult = null;
    if (triggerSEOProcessing) {
      try {
        seoResult = await processSEOForEntries([id]);
      } catch (seoError) {
        console.error('⚠️ SEO processing failed:', seoError);
      }
    }

    return NextResponse.json({
      message: 'Spy data updated successfully',
      data: updatedEntry,
      seoProcessing: seoResult
    });
  } catch (error) {
    console.error('❌ Error updating Pinterest spy data:', error);
    return NextResponse.json(
      { error: 'Failed to update spy data' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/pinterest-spy
 * Delete Pinterest spy data entries
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body; // Array of IDs to delete

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Array of spy data IDs is required' },
        { status: 400 }
      );
    }

    // Delete the entries
    const deleteResult = await prisma.pinterestSpyData.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    return NextResponse.json({
      message: `Successfully deleted ${deleteResult.count} spy data entries`,
      deleted: deleteResult.count
    });
  } catch (error) {
    console.error('❌ Error deleting Pinterest spy data:', error);
    return NextResponse.json(
      { error: 'Failed to delete spy data' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to process SEO for multiple entries
 */
async function processSEOForEntries(entryIds: string[]): Promise<{
  processed: number;
  failed: number;
  results: Array<{ id: string; success: boolean; error?: string }>;
}> {
  const results: Array<{ id: string; success: boolean; error?: string }> = [];
  let processed = 0;
  let failed = 0;

  for (const entryId of entryIds) {
    try {
      // Get the spy data entry
      const spyData = await prisma.pinterestSpyData.findUnique({
        where: { id: entryId }
      });

      if (!spyData) {
        results.push({ id: entryId, success: false, error: 'Entry not found' });
        failed++;
        continue;
      }

      // Update status to processing
      await prisma.pinterestSpyData.update({
        where: { id: entryId },
        data: { 
          status: 'SEO_PROCESSING',
          seoProcessingAttempts: { increment: 1 }
        }
      });

      // Extract SEO metadata
      const seoMetadata = await SEOExtractionService.extractSEOMetadata({
        spyTitle: spyData.spyTitle,
        spyDescription: spyData.spyDescription,
        spyImageUrl: spyData.spyImageUrl,
        spyArticleUrl: spyData.spyArticleUrl,
        spyPinImage: spyData.spyPinImage || undefined,
        annotation: spyData.annotation || undefined
      });

      // Update with SEO data
      await prisma.pinterestSpyData.update({
        where: { id: entryId },
        data: {
          seoKeyword: seoMetadata.seoKeyword,
          seoTitle: seoMetadata.seoTitle,
          seoDescription: seoMetadata.seoDescription,
          status: 'SEO_COMPLETED',
          seoProcessedAt: new Date(),
          seoProcessingError: null
        }
      });

      results.push({ id: entryId, success: true });
      processed++;
      
      console.log(`✅ SEO processed for entry ${entryId}: ${seoMetadata.seoKeyword}`);
      
      // Add delay between API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ SEO processing failed for entry ${entryId}:`, error);
      
      // Update with error
      await prisma.pinterestSpyData.update({
        where: { id: entryId },
        data: {
          status: 'FAILED',
          seoProcessingError: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      results.push({ 
        id: entryId, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      failed++;
    }
  }

  return { processed, failed, results };
}