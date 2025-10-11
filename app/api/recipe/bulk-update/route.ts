import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const token = await auth.getToken(request);
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipeIds, updates } = body;

    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      return NextResponse.json(
        { error: 'Recipe IDs array is required' },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Updates object is required' },
        { status: 400 }
      );
    }

    // For status updates, we'll use the href field as a status indicator
    // href = null/empty means draft, href with value means published
    const updatedRecipes = [];
    
    for (const id of recipeIds) {
      const updateData: any = {
        updatedAt: new Date(),
      };
      
      // Handle status updates using href field
      if (updates.status === 'draft') {
        updateData.href = null; // Draft recipes have no href
      } else if (updates.status === 'published') {
        // For published recipes, ensure href exists
        const recipe = await prisma.recipe.findUnique({ where: { id } });
        if (recipe) {
          updateData.href = recipe.href || `/recipes/${recipe.slug}`;
        }
      }
      
      // Apply other updates
      Object.keys(updates).forEach(key => {
        if (key !== 'status') {
          updateData[key] = updates[key];
        }
      });

      const updatedRecipe = await prisma.recipe.update({
        where: { id },
        data: updateData,
      });
      
      updatedRecipes.push(updatedRecipe);
    }

    // Revalidate affected pages
    try {
      // Revalidate main pages
      revalidateTag('recipes');
      revalidateTag('published-recipes');
      revalidateTag('latest');
      revalidateTag('trending');
      revalidateTag('categories');
      revalidateTag('all-recipes');
      
      revalidatePath('/');
      revalidatePath('/recipes');
      revalidatePath('/admin');
      
      // Revalidate individual recipe pages
      for (const recipe of updatedRecipes) {
        if (recipe.slug) {
          revalidateTag(`recipe-${recipe.slug}`);
          revalidatePath(`/recipes/${recipe.slug}`);
        }
      }
    } catch (revalidationError) {
      console.error('Cache revalidation failed:', revalidationError);
    }

    return NextResponse.json({
      message: `Successfully updated ${updatedRecipes.length} recipes`,
      updatedRecipes: updatedRecipes.length,
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      { error: 'Failed to update recipes' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const token = await auth.getToken(request);
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipeIds } = body;

    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      return NextResponse.json(
        { error: 'Recipe IDs array is required' },
        { status: 400 }
      );
    }

    // Get recipe data before deletion for revalidation
    const recipesToDelete = await prisma.recipe.findMany({
      where: { id: { in: recipeIds } },
      select: { id: true, slug: true, category: true }
    });

    // Delete recipes
    const deleteResult = await prisma.recipe.deleteMany({
      where: { id: { in: recipeIds } }
    });

    // Revalidate affected pages
    try {
      revalidateTag('recipes');
      revalidateTag('published-recipes');
      revalidatePath('/recipes');
      revalidatePath('/admin');
      
      // Revalidate individual recipe pages and categories
      for (const recipe of recipesToDelete) {
        if (recipe.slug) {
          revalidateTag(`recipe-${recipe.slug}`);
          revalidatePath(`/recipes/${recipe.slug}`);
        }
        if (recipe.category) {
          revalidateTag(`category-${recipe.category}`);
          revalidatePath(`/categories/${recipe.category}`);
        }
      }
      
      console.log('✅ Auto-revalidation successful for bulk delete');
    } catch (revalidationError) {
      console.error('❌ Auto-revalidation failed:', revalidationError);
    }

    return NextResponse.json({
      message: `Successfully deleted ${deleteResult.count} recipes`,
      deletedRecipes: deleteResult.count,
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipes' },
      { status: 500 }
    );
  }
}