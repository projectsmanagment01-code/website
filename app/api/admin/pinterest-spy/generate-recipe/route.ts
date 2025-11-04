/**
 * API Route: Generate Recipe from Pinterest Spy Data
 * POST /api/admin/pinterest-spy/generate-recipe
 */

import { NextRequest, NextResponse } from 'next/server';
import { RecipeGenerationService } from '@/automation/recipe-generation/service';
import { RecipeDatabaseService } from '@/automation/recipe-generation/database';
import { CategoryMatcher } from '@/automation/recipe-generation/category-matcher';
import { verifyAuth } from '@/lib/api-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { spyEntryId, authorId } = body;

    if (!spyEntryId) {
      return NextResponse.json(
        { error: 'Missing spyEntryId' },
        { status: 400 }
      );
    }

    if (!authorId) {
      return NextResponse.json(
        { error: 'Missing authorId - please select an author' },
        { status: 400 }
      );
    }

    // Fetch the spy entry
    const spyEntry = await prisma.pinterestSpyData.findUnique({
      where: { id: spyEntryId }
    });

    if (!spyEntry) {
      return NextResponse.json(
        { error: 'Spy entry not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!spyEntry.seoKeyword || !spyEntry.seoTitle || !spyEntry.seoDescription) {
      return NextResponse.json(
        { error: 'Entry missing SEO data - please generate SEO first' },
        { status: 400 }
      );
    }

    if (!spyEntry.generatedImage1Url || !spyEntry.generatedImage2Url || 
        !spyEntry.generatedImage3Url || !spyEntry.generatedImage4Url) {
      return NextResponse.json(
        { error: 'Entry missing generated images - please generate images first' },
        { status: 400 }
      );
    }

    // Check if recipe already exists
    const recipeExists = await RecipeDatabaseService.recipeExistsForEntry(spyEntryId);
    if (recipeExists) {
      return NextResponse.json(
        { error: 'Recipe already generated for this entry' },
        { status: 400 }
      );
    }

    // Generate unique recipe ID
    const recipeId = RecipeGenerationService.generateRecipeId();

    // 🎯 STEP 1: Find best matching category
    console.log(`🎯 Finding best category match for: ${spyEntry.seoTitle}`);
    const categoryMatch = await CategoryMatcher.findBestCategory({
      title: spyEntry.seoTitle,
      description: spyEntry.seoDescription,
      keyword: spyEntry.seoKeyword,
      category: spyEntry.seoCategory
    });

    let finalAuthorId = authorId;
    let categoryId: string | undefined = undefined;

    if (categoryMatch) {
      console.log(`✅ Category matched: ${categoryMatch.categoryName} (${categoryMatch.confidence}% confidence)`);
      categoryId = categoryMatch.categoryId;

      // 🎯 STEP 2: Try to find matching author based on category tags (if no author selected)
      if (!authorId || authorId === 'auto') {
        const matchingAuthorId = await CategoryMatcher.findMatchingAuthor(categoryMatch.categoryId);
        if (matchingAuthorId) {
          finalAuthorId = matchingAuthorId;
          console.log(`✅ Auto-matched author based on category tags`);
        } else {
          console.warn(`⚠️ No author found with matching tags for category: ${categoryMatch.categoryName}`);
          if (!authorId) {
            return NextResponse.json(
              { error: `No author found with tags matching category "${categoryMatch.categoryName}". Please select an author manually or add category tags to authors.` },
              { status: 400 }
            );
          }
        }
      }
    } else {
      console.warn(`⚠️ No matching category found - recipe will be saved without category link`);
    }

    // Prepare input for recipe generation
    const input = {
      seoKeyword: spyEntry.seoKeyword,
      seoTitle: spyEntry.seoTitle,
      seoDescription: spyEntry.seoDescription,
      seoCategory: spyEntry.seoCategory || 'Main Dish',
      featureImage: spyEntry.generatedImage1Url,
      preparationImage: spyEntry.generatedImage2Url,
      cookingImage: spyEntry.generatedImage3Url,
      finalPresentationImage: spyEntry.generatedImage4Url,
      authorId: finalAuthorId,
      recipeId: recipeId,
      categoryId: categoryId,
      categoryName: categoryMatch?.categoryName,
      categorySlug: categoryMatch?.categorySlug,
      spyData: spyEntry
    };

    // Generate recipe using AI
    console.log(`🍳 Starting recipe generation for: ${spyEntry.seoTitle}`);
    const generationResult = await RecipeGenerationService.generateRecipe(input);

    if (!generationResult.success || !generationResult.recipeData) {
      return NextResponse.json(
        { error: generationResult.error || 'Recipe generation failed' },
        { status: 500 }
      );
    }

    // Save recipe to database
    const saveResult = await RecipeDatabaseService.saveRecipe({
      spyEntryId: spyEntryId,
      recipeData: generationResult.recipeData,
      recipeJson: JSON.stringify(generationResult.recipeData)
    });

    if (!saveResult.success) {
      return NextResponse.json(
        { error: saveResult.error || 'Failed to save recipe' },
        { status: 500 }
      );
    }

    console.log(`✅ Recipe generated and saved: ${saveResult.recipeId}`);

    return NextResponse.json({
      success: true,
      recipeId: saveResult.recipeId,
      recipeData: generationResult.recipeData
    });

  } catch (error) {
    console.error('❌ Recipe generation API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
