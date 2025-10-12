/**
 * Example: Recipe API with Automatic SEO Enhancement
 * 
 * This shows how to integrate the auto-SEO system into your existing recipe endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { triggerAutoSEOEnhancement } from '@/lib/ai-seo/auto-enhancement';

// ============================================
// Example 1: Create Recipe with Auto-SEO
// ============================================

export async function POST_CreateRecipe(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate recipe data
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // 1. Save recipe to database (your existing code)
    const recipe = await prisma.recipe.create({
      data: {
        title: body.title,
        slug: generateSlug(body.title),
        description: body.description,
        category: body.category,
        cuisine: body.cuisine,
        heroImage: body.heroImage,
        images: body.images || [],
        ingredients: body.ingredients,
        instructions: body.instructions,
        prepTime: body.prepTime,
        cookTime: body.cookTime,
        servings: body.servings,
        difficulty: body.difficulty,
        authorId: body.authorId,
        published: body.published || false,
      }
    });

    // 2. 🚀 TRIGGER AUTOMATIC SEO ENHANCEMENT
    // This runs in the background and doesn't block the response
    setImmediate(async () => {
      try {
        console.log(`🤖 Starting auto-SEO for recipe: ${recipe.title}`);
        
        const result = await triggerAutoSEOEnhancement(recipe, {
          autoApply: false,        // Require admin review
          priority: 'high',        // Process immediately for new recipes
          notifyAdmin: true        // Send notification to admin
        });
        
        console.log(`✨ Auto-SEO completed: ${result.enhancementsGenerated} enhancements`);
        console.log(`   SEO Score: ${result.status === 'success' ? '✅' : '⚠️'} ${calculateSEOScore(result)}/100`);
        
      } catch (error) {
        console.error('❌ Background SEO enhancement failed:', error);
        // Don't throw - we don't want to affect the recipe creation
      }
    });

    // 3. Return success response immediately
    return NextResponse.json({
      success: true,
      recipe: {
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        // ... other fields
      },
      message: 'Recipe created successfully! AI is generating SEO enhancements in the background.',
      seo: {
        status: 'processing',
        message: 'SEO enhancements will be available in the admin dashboard within 1-2 minutes'
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Recipe creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================
// Example 2: Update Recipe with Auto-SEO
// ============================================

export async function PUT_UpdateRecipe(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const recipeId = params.id;

    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    });

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // 1. Update recipe (your existing code)
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        heroImage: body.heroImage,
        ingredients: body.ingredients,
        instructions: body.instructions,
        updatedAt: new Date(),
        // ... other fields
      }
    });

    // 2. Check if significant SEO-related changes were made
    const hasSignificantChanges = 
      body.title !== existingRecipe.title ||
      body.description !== existingRecipe.description ||
      body.heroImage !== existingRecipe.heroImage ||
      JSON.stringify(body.ingredients) !== JSON.stringify(existingRecipe.ingredients);

    // 3. 🚀 TRIGGER AUTO-SEO if there are significant changes
    if (hasSignificantChanges) {
      setImmediate(async () => {
        try {
          console.log(`🔄 Re-analyzing SEO for updated recipe: ${updatedRecipe.title}`);
          
          await triggerAutoSEOEnhancement(updatedRecipe, {
            autoApply: false,
            priority: 'medium',  // Lower priority for updates
            notifyAdmin: false   // Don't spam admin for updates
          });
          
          console.log(`✅ SEO re-analysis queued for ${updatedRecipe.title}`);
        } catch (error) {
          console.error('Background SEO re-analysis failed:', error);
        }
      });
    }

    return NextResponse.json({
      success: true,
      recipe: updatedRecipe,
      message: 'Recipe updated successfully',
      seo: hasSignificantChanges 
        ? { status: 'processing', message: 'SEO re-analysis in progress' }
        : { status: 'skipped', message: 'No significant SEO-related changes detected' }
    });

  } catch (error: any) {
    console.error('Recipe update error:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================
// Example 3: Batch Process Existing Recipes
// ============================================

export async function POST_BatchProcessSEO(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchSize = parseInt(searchParams.get('batchSize') || '10');
    const forceReprocess = searchParams.get('force') === 'true';

    console.log(`🔄 Starting batch SEO processing (batch size: ${batchSize})`);

    // Get recipes that need SEO analysis
    const recipes = await prisma.recipe.findMany({
      where: {
        OR: [
          { lastSEOAnalysis: null },  // Never analyzed
          forceReprocess ? {} : {
            lastSEOAnalysis: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)  // >30 days old
            }
          }
        ]
      },
      take: batchSize,
      orderBy: { createdAt: 'desc' }
    });

    if (recipes.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No recipes need SEO analysis',
        processedCount: 0
      });
    }

    // Process recipes one by one
    const results = [];
    
    for (const recipe of recipes) {
      try {
        const result = await triggerAutoSEOEnhancement(recipe, {
          autoApply: false,
          priority: 'low',
          notifyAdmin: false
        });
        
        results.push({
          recipeId: recipe.id,
          recipeTitle: recipe.title,
          status: result.status,
          enhancementsCount: result.enhancementsGenerated
        });

        console.log(`✅ Processed: ${recipe.title} (${result.enhancementsGenerated} enhancements)`);

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error(`❌ Failed to process ${recipe.title}:`, error);
        results.push({
          recipeId: recipe.id,
          recipeTitle: recipe.title,
          status: 'failed',
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Batch processing complete`,
      processedCount: results.length,
      results: results
    });

  } catch (error: any) {
    console.error('Batch processing error:', error);
    return NextResponse.json(
      { error: 'Batch processing failed', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================
// Example 4: Get Recipe with SEO Data
// ============================================

export async function GET_RecipeWithSEO(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipeId = params.id;

    // Get recipe with all SEO data
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        seoMetadata: true,
        seoImageData: true,
        seoEnhancements: {
          where: { status: 'applied' },
          orderBy: { createdAt: 'desc' }
        },
        seoReports: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Get AI-enhanced metadata if available
    const enhancedMetadata = recipe.seoMetadata[0] || null;
    const latestReport = recipe.seoReports[0] || null;

    return NextResponse.json({
      success: true,
      recipe: {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        // ... other fields
      },
      seo: {
        metadata: enhancedMetadata ? {
          title: enhancedMetadata.currentTitle || recipe.title,
          description: enhancedMetadata.currentDescription || recipe.description,
          keywords: enhancedMetadata.currentKeywords,
          isAIGenerated: true,
          confidence: 0.85
        } : {
          title: recipe.title,
          description: recipe.description,
          isAIGenerated: false
        },
        images: recipe.seoImageData.map(img => ({
          url: img.imageUrl,
          altText: img.currentAltText || img.aiAltText,
          caption: img.currentCaption || img.aiCaption
        })),
        score: recipe.seoScore,
        lastAnalysis: recipe.lastSEOAnalysis,
        enhancementsCount: recipe.aiEnhancementsCount,
        latestReport: latestReport ? {
          status: latestReport.status,
          enhancementsCount: latestReport.enhancementsCount,
          processingTime: latestReport.processingTime,
          createdAt: latestReport.createdAt
        } : null
      }
    });

  } catch (error: any) {
    console.error('Error fetching recipe with SEO data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================
// Helper Functions
// ============================================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function calculateSEOScore(result: any): number {
  let score = 50;
  
  if (result.enhancementDetails?.metadata?.status === 'success') score += 25;
  if (result.enhancementDetails?.images?.status === 'success') score += 10;
  if (result.enhancementDetails?.internalLinks?.status === 'success') score += 10;
  if (result.enhancementDetails?.schema?.status === 'success') score += 5;
  
  return Math.min(100, score);
}

// ============================================
// Usage in your routes
// ============================================

/**
 * app/api/recipes/route.ts
 * 
 * export { POST_CreateRecipe as POST };
 */

/**
 * app/api/recipes/[id]/route.ts
 * 
 * export { PUT_UpdateRecipe as PUT };
 * export { GET_RecipeWithSEO as GET };
 */

/**
 * app/api/recipes/batch-seo/route.ts
 * 
 * export { POST_BatchProcessSEO as POST };
 */