/**
 * Category API Routes - Admin Only
 * 
 * GET  /api/admin/categories - List all categories with pagination
 * POST /api/admin/categories - Create new category
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCategory, getCategoriesPaginated, searchCategories } from '@/lib/category-service-new';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // Check authentication (supports both JWT and API tokens)
  const authCheck = await checkHybridAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Handle search query
    if (search) {
      const categories = await searchCategories(search);
      return NextResponse.json({
        categories,
        total: categories.length,
        currentPage: 1,
        totalPages: 1,
        page: 1,
        limit
      });
    }

    // Handle pagination
    const result = await getCategoriesPaginated(page, limit, includeInactive);
    
    return NextResponse.json({
      categories: result.categories,
      total: result.total,
      currentPage: result.page,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit
    });

  } catch (error) {
    console.error('❌ Error in GET /api/admin/categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check authentication (supports both JWT and API tokens)
  const authCheck = await checkHybridAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const { name, description, image, color, order, metaTitle, metaDescription } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Create category
    const category = await createCategory({
      name,
      description,
      image,
      color,
      order,
      metaTitle,
      metaDescription
    });

    console.log(`✅ Category created: ${name} (ID: ${category.id})`);

    return NextResponse.json({
      message: 'Category created successfully',
      category
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error in POST /api/admin/categories:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}