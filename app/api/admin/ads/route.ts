/**
 * Ad Management API Routes - Admin Only
 * 
 * GET    /api/admin/ads - List all ads with filtering
 * POST   /api/admin/ads - Create new ad
 * 
 * For single ad operations, see [id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';
import { prisma } from '@/lib/prisma';

// Aggressive cache-busting configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Valid placement options
const VALID_PLACEMENTS = [
  'before-hero',
  'after-hero',
  'in-content',
  'after-ingredients',
  'after-instructions',
  'sidebar-top',
  'sidebar-sticky',
  'footer',
  'between-recipes'
] as const;

// Valid ad types
const VALID_AD_TYPES = ['adsense', 'custom', 'affiliate', 'house'] as const;

// Valid target pages
const VALID_TARGET_PAGES = ['home', 'recipe', 'category', 'article', 'search', 'author'] as const;

/**
 * GET /api/admin/ads - List all ads
 * Query params:
 *   - placement: Filter by placement type
 *   - adType: Filter by ad type
 *   - isActive: Filter by active status
 *   - page: Page number (default 1)
 *   - limit: Items per page (default 50)
 */
export async function GET(request: NextRequest) {
  // Check authentication
  const authCheck = await checkHybridAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement');
    const adType = searchParams.get('adType');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};
    
    if (placement) {
      where.placement = placement;
    }
    
    if (adType) {
      where.adType = adType;
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get ads with pagination
    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        where,
        orderBy: [
          { placement: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.ad.count({ where })
    ]);

    return jsonResponseNoCache({
      ads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      meta: {
        validPlacements: VALID_PLACEMENTS,
        validAdTypes: VALID_AD_TYPES,
        validTargetPages: VALID_TARGET_PAGES
      }
    });

  } catch (error) {
    console.error('❌ Error fetching ads:', error);
    return errorResponseNoCache(
      `Failed to fetch ads: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * POST /api/admin/ads - Create new ad
 */
export async function POST(request: NextRequest) {
  // Check authentication
  const authCheck = await checkHybridAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return errorResponseNoCache('Ad name is required', 400);
    }
    
    if (!body.placement) {
      return errorResponseNoCache('Placement is required', 400);
    }
    
    if (!VALID_PLACEMENTS.includes(body.placement)) {
      return errorResponseNoCache(
        `Invalid placement. Valid options: ${VALID_PLACEMENTS.join(', ')}`,
        400
      );
    }

    // Validate ad type
    const adType = body.adType || 'adsense';
    if (!VALID_AD_TYPES.includes(adType)) {
      return errorResponseNoCache(
        `Invalid ad type. Valid options: ${VALID_AD_TYPES.join(', ')}`,
        400
      );
    }

    // For AdSense ads, validate required fields
    if (adType === 'adsense') {
      if (!body.slotId && !body.adCode) {
        return errorResponseNoCache(
          'AdSense ads require either a slot ID or ad code',
          400
        );
      }
    }

    // For custom/affiliate ads, require ad code or image
    if ((adType === 'custom' || adType === 'affiliate') && !body.adCode && !body.imageUrl) {
      return errorResponseNoCache(
        'Custom and affiliate ads require either ad code or an image URL',
        400
      );
    }

    // Parse arrays
    const sizes = Array.isArray(body.sizes) ? body.sizes : [];
    const targetPages = Array.isArray(body.targetPages) ? body.targetPages : [];
    const targetCategories = Array.isArray(body.targetCategories) ? body.targetCategories : [];
    const excludePages = Array.isArray(body.excludePages) ? body.excludePages : [];

    // Create the ad
    const ad = await prisma.ad.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        adType,
        provider: body.provider?.trim() || null,
        slotId: body.slotId?.trim() || null,
        publisherId: body.publisherId?.trim() || null,
        adFormat: body.adFormat || 'auto',
        placement: body.placement,
        position: parseInt(body.position) || 0,
        sizes,
        responsive: body.responsive !== false,
        minWidth: body.minWidth ? parseInt(body.minWidth) : null,
        maxWidth: body.maxWidth ? parseInt(body.maxWidth) : null,
        targetPages,
        targetCategories,
        excludePages,
        adCode: body.adCode?.trim() || null,
        imageUrl: body.imageUrl?.trim() || null,
        linkUrl: body.linkUrl?.trim() || null,
        altText: body.altText?.trim() || null,
        isActive: body.isActive !== false,
        priority: parseInt(body.priority) || 0,
        lazyLoad: body.lazyLoad !== false,
        lazyOffset: body.lazyOffset || '200px',
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        createdBy: (authCheck as any).payload?.id || null
      }
    });

    console.log(`✅ Ad created: ${ad.name} (${ad.id})`);

    return jsonResponseNoCache({ success: true, ad }, 201);

  } catch (error) {
    console.error('❌ Error creating ad:', error);
    return errorResponseNoCache(
      `Failed to create ad: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}
