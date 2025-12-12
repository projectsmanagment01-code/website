/**
 * Individual Ad Management API Routes - Admin Only
 * 
 * GET    /api/admin/ads/[id] - Get single ad
 * PUT    /api/admin/ads/[id] - Update ad
 * DELETE /api/admin/ads/[id] - Delete ad
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

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/ads/[id] - Get single ad
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authCheck = await checkHybridAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await params;
    
    const ad = await prisma.ad.findUnique({
      where: { id }
    });

    if (!ad) {
      return errorResponseNoCache('Ad not found', 404);
    }

    return jsonResponseNoCache({ ad });

  } catch (error) {
    console.error('❌ Error fetching ad:', error);
    return errorResponseNoCache(
      `Failed to fetch ad: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * PUT /api/admin/ads/[id] - Update ad
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authCheck = await checkHybridAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Check if ad exists
    const existingAd = await prisma.ad.findUnique({
      where: { id }
    });

    if (!existingAd) {
      return errorResponseNoCache('Ad not found', 404);
    }

    // Validate placement if provided
    if (body.placement && !VALID_PLACEMENTS.includes(body.placement)) {
      return errorResponseNoCache(
        `Invalid placement. Valid options: ${VALID_PLACEMENTS.join(', ')}`,
        400
      );
    }

    // Validate ad type if provided
    if (body.adType && !VALID_AD_TYPES.includes(body.adType)) {
      return errorResponseNoCache(
        `Invalid ad type. Valid options: ${VALID_AD_TYPES.join(', ')}`,
        400
      );
    }

    // Build update data
    const updateData: any = {};

    // String fields
    if (body.name !== undefined) updateData.name = body.name?.trim() || existingAd.name;
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.adType !== undefined) updateData.adType = body.adType;
    if (body.provider !== undefined) updateData.provider = body.provider?.trim() || null;
    if (body.slotId !== undefined) updateData.slotId = body.slotId?.trim() || null;
    if (body.publisherId !== undefined) updateData.publisherId = body.publisherId?.trim() || null;
    if (body.adFormat !== undefined) updateData.adFormat = body.adFormat;
    if (body.placement !== undefined) updateData.placement = body.placement;
    if (body.adCode !== undefined) updateData.adCode = body.adCode?.trim() || null;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl?.trim() || null;
    if (body.linkUrl !== undefined) updateData.linkUrl = body.linkUrl?.trim() || null;
    if (body.altText !== undefined) updateData.altText = body.altText?.trim() || null;
    if (body.lazyOffset !== undefined) updateData.lazyOffset = body.lazyOffset;

    // Numeric fields
    if (body.position !== undefined) updateData.position = parseInt(body.position) || 0;
    if (body.priority !== undefined) updateData.priority = parseInt(body.priority) || 0;
    if (body.minWidth !== undefined) updateData.minWidth = body.minWidth ? parseInt(body.minWidth) : null;
    if (body.maxWidth !== undefined) updateData.maxWidth = body.maxWidth ? parseInt(body.maxWidth) : null;

    // Boolean fields
    if (body.responsive !== undefined) updateData.responsive = body.responsive === true;
    if (body.isActive !== undefined) updateData.isActive = body.isActive === true;
    if (body.lazyLoad !== undefined) updateData.lazyLoad = body.lazyLoad === true;

    // Array fields
    if (body.sizes !== undefined) updateData.sizes = Array.isArray(body.sizes) ? body.sizes : [];
    if (body.targetPages !== undefined) updateData.targetPages = Array.isArray(body.targetPages) ? body.targetPages : [];
    if (body.targetCategories !== undefined) updateData.targetCategories = Array.isArray(body.targetCategories) ? body.targetCategories : [];
    if (body.excludePages !== undefined) updateData.excludePages = Array.isArray(body.excludePages) ? body.excludePages : [];

    // Date fields
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;

    // Update the ad
    const ad = await prisma.ad.update({
      where: { id },
      data: updateData
    });

    console.log(`✅ Ad updated: ${ad.name} (${ad.id})`);

    return jsonResponseNoCache({ success: true, ad });

  } catch (error) {
    console.error('❌ Error updating ad:', error);
    return errorResponseNoCache(
      `Failed to update ad: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * DELETE /api/admin/ads/[id] - Delete ad
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authCheck = await checkHybridAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await params;

    // Check if ad exists
    const existingAd = await prisma.ad.findUnique({
      where: { id }
    });

    if (!existingAd) {
      return errorResponseNoCache('Ad not found', 404);
    }

    // Delete the ad
    await prisma.ad.delete({
      where: { id }
    });

    console.log(`✅ Ad deleted: ${existingAd.name} (${id})`);

    return jsonResponseNoCache({ success: true, message: 'Ad deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting ad:', error);
    return errorResponseNoCache(
      `Failed to delete ad: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * PATCH /api/admin/ads/[id] - Quick toggle active status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authCheck = await checkHybridAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Check if ad exists
    const existingAd = await prisma.ad.findUnique({
      where: { id }
    });

    if (!existingAd) {
      return errorResponseNoCache('Ad not found', 404);
    }

    // Only allow toggling isActive with PATCH
    if (body.isActive === undefined) {
      return errorResponseNoCache('PATCH only supports toggling isActive status', 400);
    }

    const ad = await prisma.ad.update({
      where: { id },
      data: { isActive: body.isActive === true }
    });

    console.log(`✅ Ad ${ad.isActive ? 'activated' : 'deactivated'}: ${ad.name} (${ad.id})`);

    return jsonResponseNoCache({ success: true, ad });

  } catch (error) {
    console.error('❌ Error toggling ad status:', error);
    return errorResponseNoCache(
      `Failed to toggle ad status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}
