/**
 * Single Category Management API
 * 
 * Endpoints:
 * GET    /api/admin/categories/[id] - Get single category with details
 * PUT    /api/admin/categories/[id] - Update category
 * DELETE /api/admin/categories/[id] - Delete category
 * 
 * Protected: Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { verifyAuth } from '@/lib/api-auth';
import {
  getCategoryById,
  updateCategory,
  deleteCategory
} from '@/lib/category-service-new';
import { revalidateAdminPaths } from '@/lib/cache-busting';

// Aggressive cache-busting configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return errorResponseNoCache('Unauthorized. Admin access required.', 401);
    }

    const { id } = await context.params;
    
    const category = await getCategoryById(id, true); // Include recipes
    
    if (!category) {
      return errorResponseNoCache('Category not found', 404);
    }
    
    return jsonResponseNoCache({
      success: true,
      category
    });

  } catch (error) {
    console.error('❌ GET /api/admin/categories/[id] error:', error);
    return jsonResponseNoCache({ 
        error: 'Failed to fetch category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return errorResponseNoCache('Unauthorized. Admin access required.', 401);
    }

    const { id } = await context.params;
    const body = await request.json();
    
    // Validate at least one field to update
    if (Object.keys(body).length === 0) {
      return errorResponseNoCache('No fields provided for update', 400);
    }
    
    // Update category
    const category = await updateCategory(id, {
      name: body.name?.trim(),
      description: body.description?.trim(),
      image: body.image?.trim(),
      icon: body.icon?.trim(),
      color: body.color?.trim(),
      order: typeof body.order === 'number' ? body.order : undefined,
      metaTitle: body.metaTitle?.trim(),
      metaDescription: body.metaDescription?.trim(),
      isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined
    });
    
    // CRITICAL: Revalidate cache after mutation
    await revalidateAdminPaths();
    
    // CRITICAL: Revalidate frontend cache tags for instant updates
    const { revalidateByTags } = await import('@/lib/cache-busting');
    await revalidateByTags(['categories', 'all-categories', `category-${category.slug}`]);
    
    return jsonResponseNoCache({
      success: true,
      category,
      message: `Category "${category.name}" updated successfully`
    });

  } catch (error) {
    console.error('❌ PUT /api/admin/categories/[id] error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponseNoCache('Category not found', 404);
    }
    
    return errorResponseNoCache('Failed to update category', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return errorResponseNoCache('Unauthorized. Admin access required.', 401);
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    
    // Delete category
    await deleteCategory(id, force);
    
    // CRITICAL: Revalidate cache after mutation
    await revalidateAdminPaths();
    
    // CRITICAL: Revalidate frontend cache tags for instant updates
    const { revalidateByTags } = await import('@/lib/cache-busting');
    await revalidateByTags(['categories', 'all-categories']);
    
    return jsonResponseNoCache({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('❌ DELETE /api/admin/categories/[id] error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return errorResponseNoCache('Category not found', 404);
      }
      
      if (error.message.includes('Cannot delete category')) {
        return errorResponseNoCache(error.message, 400);
      }
    }
    
    return errorResponseNoCache('Failed to delete category', 500);
  }
}