import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findOrphanPages, updateOrphanPagesInDB } from '@/lib/internal-linking';

/**
 * POST /api/admin/internal-links/orphans/scan
 * Scan and update orphan pages data
 */
export async function POST() {
  try {
    const startTime = Date.now();
    
    // Find orphan pages
    const orphanData = await findOrphanPages(prisma);
    
    // Update database
    await updateOrphanPagesInDB(prisma, orphanData);
    
    const duration = Date.now() - startTime;
    const orphanCount = orphanData.filter(o => o.isOrphan).length;
    
    return NextResponse.json({
      success: true,
      totalRecipes: orphanData.length,
      orphanCount,
      durationMs: duration,
      topOrphans: orphanData
        .filter(o => o.isOrphan)
        .slice(0, 20)
        .map(o => ({
          title: o.recipeTitle,
          slug: o.recipeSlug,
          incomingLinks: o.incomingLinksCount,
          outgoingLinks: o.outgoingLinksCount,
        })),
    });
    
  } catch (error: any) {
    console.error('Error scanning orphan pages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to scan orphan pages' },
      { status: 500 }
    );
  }
}
