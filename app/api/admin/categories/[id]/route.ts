/**
 * Individual Category API Routes - Admin Only
 * 
 * GET    /api/admin/categories/[id] - Get single category
 * PUT    /api/admin/categories/[id] - Update category
 * DELETE /api/admin/categories/[id] - Delete category
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCategoryById, updateCategory, deleteCategory } from '@/lib/category-service';
import { CategoryType } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const category = await getCategoryById(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);

  } catch (error) {
    console.error(`❌ Error in GET /api/admin/categories/${params?.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, type, seoTitle, seoDescription, parentId } = body;

    // Validate type if provided
    if (type && !Object.values(CategoryType).includes(type)) {
      return NextResponse.json(
        { error: 'Valid type is required (CUISINE, DIET, MEAL_TYPE, COOKING_METHOD, DIFFICULTY, SEASON)' },
        { status: 400 }
      );
    }

    // Update category
    const category = await updateCategory(id, {
      name,
      description,
      type,
      seoTitle,
      seoDescription,
      parentId
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Category updated: ${category.name} (ID: ${category.id})`);

    return NextResponse.json({
      message: 'Category updated successfully',
      category
    });

  } catch (error) {
    console.error(`❌ Error in PUT /api/admin/categories/${params?.id}:`, error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    
    const success = await deleteCategory(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Category deleted: ${id}`);

    return NextResponse.json({
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error(`❌ Error in DELETE /api/admin/categories/${params?.id}:`, error);
    
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