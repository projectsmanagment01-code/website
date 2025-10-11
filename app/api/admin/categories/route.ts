/**
 * Category API Routes - Admin Only
 * 
 * GET  /api/admin/categories - List all categories with pagination
 * POST /api/admin/categories - Create new category
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCategory, getCategories, searchCategories, CategoryType } from '@/lib/category-service-temp';
import { checkAuthOrRespond } from '@/lib/auth-standard';

export async function GET(request: NextRequest) {
  // Check authentication
  const authCheck = await checkAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const type = searchParams.get('type') as CategoryType | null;

    // Handle search query
    if (search) {
      const categories = await searchCategories(search, limit);
      return NextResponse.json({
        categories,
        total: categories.length,
        currentPage: 1,
        totalPages: 1
      });
    }

    // Handle pagination
    const result = await getCategories(page, limit);
    
    // Filter by type if specified
    if (type && Object.values(CategoryType).includes(type)) {
      result.categories = result.categories.filter(cat => cat.type === type);
      result.total = result.categories.length;
      result.totalPages = Math.ceil(result.total / limit);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error in GET /api/admin/categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const authCheck = await checkAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const { name, description, type, seoTitle, seoDescription, parentId } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!type || !Object.values(CategoryType).includes(type)) {
      return NextResponse.json(
        { error: 'Valid type is required (CUISINE, DIET, MEAL_TYPE, COOKING_METHOD, DIFFICULTY, SEASON)' },
        { status: 400 }
      );
    }

    // Create category
    const category = await createCategory({
      name,
      description,
      type
    });

    console.log(`✅ Category created: ${category.name} (ID: ${category.id}, Type: ${category.type})`);

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