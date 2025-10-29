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
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    
    const category = await getCategoryById(id, true); // Include recipes
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      category
    });

  } catch (error) {
    console.error('❌ GET /api/admin/categories/[id] error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    
    // Validate at least one field to update
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'No fields provided for update' },
        { status: 400 }
      );
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
    
    return NextResponse.json({
      success: true,
      category,
      message: `Category "${category.name}" updated successfully`
    });

  } catch (error) {
    console.error('❌ PUT /api/admin/categories/[id] error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    
    // Delete category
    await deleteCategory(id, force);
    
    // CRITICAL: Revalidate cache after mutation
    await revalidateAdminPaths();
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('❌ DELETE /api/admin/categories/[id] error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('Cannot delete category')) {
        return NextResponse.json(
          { 
            error: error.message,
            canForce: true
          },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to delete category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}