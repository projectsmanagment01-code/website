import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findOrphanPages, updateOrphanPagesInDB, getPrioritizedOrphans } from '@/lib/internal-linking';

/**
 * GET /api/admin/internal-links/orphans
 * Get orphan pages (recipes with few incoming links)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const refresh = searchParams.get('refresh') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (refresh) {
      // Scan and update orphan pages
      const orphanData = await findOrphanPages(prisma);
      await updateOrphanPagesInDB(prisma, orphanData);
      
      return NextResponse.json({
        success: true,
        scanned: true,
        total: orphanData.length,
        orphans: orphanData.filter(o => o.isOrphan).slice(0, limit),
      });
    } else {
      // Get from database
      const orphans = await getPrioritizedOrphans(prisma, limit);
      
      return NextResponse.json({
        success: true,
        scanned: false,
        total: orphans.length,
        orphans,
      });
    }
    
  } catch (error: any) {
    console.error('Error fetching orphan pages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orphan pages' },
      { status: 500 }
    );
  }
}
