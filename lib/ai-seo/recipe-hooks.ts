/**
 * Recipe Post-Save Hook
 * Automatically triggers SEO enhancement after recipe creation/update
 * 
 * Add this to your recipe creation/update API routes
 */

import { triggerAutoSEOEnhancement } from '@/lib/ai-seo/auto-enhancement';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware function to trigger SEO enhancement after recipe save
 */
export async function postRecipeSaveHook(
  recipe: any,
  action: 'create' | 'update'
) {
  try {
    console.log(`🎣 Post-save hook triggered for recipe: ${recipe.title} (${action})`);

    // Only trigger for new recipes or significant updates
    const shouldTrigger = action === 'create' || hasSignificantChanges(recipe);

    if (!shouldTrigger) {
      console.log(`⏭️ Skipping SEO enhancement - no significant changes`);
      return;
    }

    // Trigger enhancement in background (non-blocking)
    // This runs asynchronously and doesn't delay the API response
    setImmediate(async () => {
      try {
        await triggerAutoSEOEnhancement(recipe, {
          autoApply: false, // Keep for admin review
          priority: action === 'create' ? 'high' : 'medium',
          notifyAdmin: true
        });
      } catch (error) {
        console.error('Background SEO enhancement error:', error);
      }
    });

    console.log(`✅ SEO enhancement queued for background processing`);
  } catch (error) {
    console.error('Post-save hook error:', error);
    // Don't throw - we don't want to fail the recipe save if SEO enhancement fails
  }
}

/**
 * Check if recipe has significant changes that warrant re-analysis
 */
function hasSignificantChanges(recipe: any): boolean {
  // Check if important SEO fields were modified
  const significantFields = [
    'title',
    'description',
    'category',
    'heroImage',
    'ingredients',
    'instructions'
  ];

  // You would compare with previous version from database
  // For now, we'll just return true to always analyze updates
  return true;
}

/**
 * API Route: Create Recipe with Auto SEO
 * POST /api/recipes/create
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate recipe data
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Save recipe to database
    const recipe = await prisma.recipe.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        cuisine: body.cuisine,
        heroImage: body.heroImage,
        images: body.images,
        ingredients: body.ingredients,
        instructions: body.instructions,
        prepTime: body.prepTime,
        cookTime: body.cookTime,
        difficulty: body.difficulty,
        // ... other fields
      }
    });

    // Trigger auto SEO enhancement (non-blocking)
    await postRecipeSaveHook(recipe, 'create');

    return NextResponse.json({
      success: true,
      recipe,
      message: 'Recipe created successfully. SEO enhancement queued for processing.'
    });

  } catch (error: any) {
    console.error('Recipe creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * API Route: Update Recipe with Auto SEO
 * PUT /api/recipes/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Update recipe in database
    const recipe = await prisma.recipe.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        cuisine: body.cuisine,
        heroImage: body.heroImage,
        images: body.images,
        ingredients: body.ingredients,
        instructions: body.instructions,
        // ... other fields
        updatedAt: new Date()
      }
    });

    // Trigger auto SEO enhancement (non-blocking)
    await postRecipeSaveHook(recipe, 'update');

    return NextResponse.json({
      success: true,
      recipe,
      message: 'Recipe updated successfully. SEO re-analysis queued.'
    });

  } catch (error: any) {
    console.error('Recipe update error:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Scheduled job to process unanalyzed recipes
 * Run this via cron job or scheduled task
 */
export async function runScheduledSEOAnalysis() {
  console.log('🕐 Starting scheduled SEO analysis job...');
  
  const { processUnanalyzedRecipes } = await import('@/lib/ai-seo/auto-enhancement');
  
  const results = await processUnanalyzedRecipes(10);
  
  console.log(`✅ Scheduled job complete: ${results.length} recipes processed`);
  
  return {
    success: true,
    processedCount: results.length,
    timestamp: new Date()
  };
}

// Example usage in your existing recipe API routes:
/*
// In your app/api/recipes/route.ts or similar:

import { postRecipeSaveHook } from '@/lib/ai-seo/recipe-hooks';

export async function POST(request: NextRequest) {
  // ... your existing recipe creation code ...
  
  const recipe = await prisma.recipe.create({ data: recipeData });
  
  // Add this line to trigger auto SEO
  await postRecipeSaveHook(recipe, 'create');
  
  return NextResponse.json({ success: true, recipe });
}
*/