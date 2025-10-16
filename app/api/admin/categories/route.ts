/**
 * Admin Category Management API
 * 
 * Endpoints:
 * GET    /api/admin/categories - List all categories with pagination
 * POST   /api/admin/categories - Create new category
 * 
 * Protected: Requires admin authentication (JWT or API token)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import {
  getCategories,
  getCategoriesPaginated,
  createCategory,
  searchCategories,
  getCategoryStats,
  reorderCategories
} from '@/lib/category-service-new';

// ============================================================================
// GET - List Categories
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const stats = searchParams.get('stats') === 'true';
    
    // Handle stats request
    if (stats) {
      const categoryStats = await getCategoryStats();
      return NextResponse.json({
        success: true,
        stats: categoryStats
      });
    }
    
    // Handle search
    if (search) {
      const categories = await searchCategories(search);
      return NextResponse.json({
        success: true,
        categories,
        total: categories.length,
        page: 1,
        limit: categories.length,
        totalPages: 1
      });
    }
    
    // Handle pagination
    const result = await getCategoriesPaginated(page, limit, includeInactive);
    
    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ GET /api/admin/categories error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create Category
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Handle reorder request
    if (body.action === 'reorder' && body.orderedIds) {
      await reorderCategories(body.orderedIds);
      return NextResponse.json({
        success: true,
        message: 'Categories reordered successfully'
      });
    }
    
    // Validate required fields
    const { name, image } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    if (!image || !image.trim()) {
      return NextResponse.json(
        { error: 'Category image is required' },
        { status: 400 }
      );
    }
    
    // Create category
    const category = await createCategory({
      name: name.trim(),
      description: body.description?.trim(),
      image: image.trim(),
      icon: body.icon?.trim(),
      color: body.color?.trim(),
      order: typeof body.order === 'number' ? body.order : undefined,
      metaTitle: body.metaTitle?.trim(),
      metaDescription: body.metaDescription?.trim()
    });
    
    return NextResponse.json({
      success: true,
      category,
      message: `Category "${category.name}" created successfully`
    }, { status: 201 });

  } catch (error) {
    console.error('❌ POST /api/admin/categories error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}