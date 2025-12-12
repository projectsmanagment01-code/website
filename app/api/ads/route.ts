/**
 * Public Ads API
 * 
 * GET /api/ads - Get active ads for display (no auth required)
 * 
 * This is a public endpoint for the frontend to fetch ads.
 * Only returns active, scheduled ads.
 */

import { NextRequest, NextResponse } from 'next/server';
import { jsonResponseNoCache } from '@/lib/api-response-helpers';
import { prisma } from '@/lib/prisma';

// Cache configuration - ads can be cached briefly
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 1 minute

/**
 * GET /api/ads - Get all active ads
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement');
    const isActiveParam = searchParams.get('isActive');

    const now = new Date();

    // Build filter - only active ads within schedule
    const where: any = {
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } }
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } }
          ]
        }
      ]
    };

    // Filter by placement if specified
    if (placement) {
      where.placement = placement;
    }

    // Allow filtering by isActive (for admin preview)
    if (isActiveParam === 'false') {
      where.isActive = false;
    }

    const ads = await prisma.ad.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { position: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        adType: true,
        provider: true,
        slotId: true,
        publisherId: true,
        adFormat: true,
        placement: true,
        position: true,
        sizes: true,
        responsive: true,
        minWidth: true,
        maxWidth: true,
        targetPages: true,
        targetCategories: true,
        excludePages: true,
        adCode: true,
        imageUrl: true,
        linkUrl: true,
        altText: true,
        isActive: true,
        priority: true,
        lazyLoad: true,
        lazyOffset: true,
        startDate: true,
        endDate: true
        // Exclude: impressions, clicks, createdBy, createdAt, updatedAt
      }
    });

    // Add cache headers for CDN
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    return new NextResponse(JSON.stringify({ ads }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('❌ Error fetching public ads:', error);
    return jsonResponseNoCache(
      { error: 'Failed to fetch ads', ads: [] },
      500
    );
  }
}
