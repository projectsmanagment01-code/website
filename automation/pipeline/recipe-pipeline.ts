/**
 * Recipe Pipeline Orchestrator
 * Manages the complete pipeline from Pinterest Spy Data to Published Recipe
 * 
 * Pipeline Steps:
 * 1. Select spy data entry (PENDING status)
 * 2. Generate SEO metadata
 * 3. Generate 4 images
 * 4. Generate complete recipe
 * 5. Publish recipe
 * 6. Archive spy data
 */

import { PrismaClient } from '@prisma/client';
import { CategoryMatcher } from '../recipe-generation/category-matcher';
import { RecipeGenerationService } from '../recipe-generation/service';
import { RecipeDatabaseService } from '../recipe-generation/database';

const prisma = new PrismaClient();

export interface PipelineContext {
  spyDataId: string;
  automationId?: string;
  authorId?: string; // Optional: auto-select if not provided
  onProgress?: (step: number, total: number, message: string) => Promise<void>;
}

export interface PipelineResult {
  success: boolean;
  recipeId?: string;
  recipeUrl?: string;
  error?: string;
  stage?: string; // What stage failed
  logs: string[];
}

export class RecipePipelineOrchestrator {
  private static readonly TOTAL_STEPS = 5;

  /**
   * Execute the complete recipe generation pipeline
   */
  static async executePipeline(context: PipelineContext): Promise<PipelineResult> {
    const logs: string[] = [];
    const log = (message: string) => {
      console.log(message);
      logs.push(`[${new Date().toISOString()}] ${message}`);
    };

    try {
      log(`🚀 Starting recipe pipeline for spy data: ${context.spyDataId}`);

      // STEP 1: Fetch and validate spy data
      await context.onProgress?.(1, this.TOTAL_STEPS, 'Fetching spy data...');
      log('📊 STEP 1/5: Fetching spy data...');

      const spyData = await prisma.pinterestSpyData.findUnique({
        where: { id: context.spyDataId }
      });

      if (!spyData) {
        throw new Error(`Spy data not found: ${context.spyDataId}`);
      }

      // Check if already processed
      if (spyData.generatedRecipeId) {
        throw new Error(`Recipe already generated for this spy data: ${spyData.generatedRecipeId}`);
      }

      log(`✅ Spy data loaded: ${spyData.spyTitle}`);

      // STEP 2: Generate SEO if not exists
      await context.onProgress?.(2, this.TOTAL_STEPS, 'Generating SEO metadata...');
      log('🔍 STEP 2/5: Generating SEO metadata...');

      if (!spyData.seoKeyword || !spyData.seoTitle || !spyData.seoDescription) {
        log('⚠️ SEO data missing, generating...');
        await this.generateSEO(spyData.id);
        
        // Reload spy data with SEO
        const updatedSpyData = await prisma.pinterestSpyData.findUnique({
          where: { id: context.spyDataId }
        });
        
        if (!updatedSpyData || !updatedSpyData.seoKeyword) {
          throw new Error('Failed to generate SEO data');
        }
        
        Object.assign(spyData, updatedSpyData);
        log(`✅ SEO generated: ${spyData.seoTitle}`);
      } else {
        log(`✅ SEO data already exists`);
      }

      // STEP 3: Generate images if not exists
      await context.onProgress?.(3, this.TOTAL_STEPS, 'Generating recipe images...');
      log('🖼️ STEP 3/5: Generating recipe images...');

      if (!spyData.generatedImage1Url || !spyData.generatedImage2Url || 
          !spyData.generatedImage3Url || !spyData.generatedImage4Url) {
        log('⚠️ Images missing, generating...');
        await this.generateImages(spyData.id);
        
        // Reload spy data with images
        const updatedSpyData = await prisma.pinterestSpyData.findUnique({
          where: { id: context.spyDataId }
        });
        
        if (!updatedSpyData || !updatedSpyData.generatedImage1Url) {
          throw new Error('Failed to generate images');
        }
        
        Object.assign(spyData, updatedSpyData);
        log(`✅ Images generated (4 images)`);
      } else {
        log(`✅ Images already exist`);
      }

      // STEP 4: Match category and author
      await context.onProgress?.(4, this.TOTAL_STEPS, 'Matching category and author...');
      log('🎯 STEP 4/5: Finding best category match...');

      const categoryMatch = await CategoryMatcher.findBestCategory({
        title: spyData.seoTitle!,
        description: spyData.seoDescription!,
        keyword: spyData.seoKeyword!,
        category: spyData.seoCategory || undefined
      });

      let authorId = context.authorId;
      let categoryId: string | undefined;

      if (categoryMatch) {
        log(`✅ Category matched: ${categoryMatch.categoryName} (${categoryMatch.confidence}% confidence)`);
        categoryId = categoryMatch.categoryId;

        // Auto-select author if not provided
        if (!authorId) {
          const matchingAuthorId = await CategoryMatcher.findMatchingAuthor(categoryMatch.categoryId);
          if (matchingAuthorId) {
            authorId = matchingAuthorId;
            log(`✅ Author auto-matched based on category tags`);
          } else {
            // Fallback to first available author
            const fallbackAuthor = await prisma.author.findFirst();
            if (fallbackAuthor) {
              authorId = fallbackAuthor.id;
              log(`⚠️ No matching author found, using fallback: ${fallbackAuthor.name}`);
            } else {
              throw new Error('No authors available in database');
            }
          }
        }
      } else {
        log(`⚠️ No category match found`);
        
        // Still need an author
        if (!authorId) {
          const fallbackAuthor = await prisma.author.findFirst();
          if (fallbackAuthor) {
            authorId = fallbackAuthor.id;
            log(`⚠️ Using fallback author: ${fallbackAuthor.name}`);
          } else {
            throw new Error('No authors available in database');
          }
        }
      }

      // STEP 5: Generate and publish recipe
      await context.onProgress?.(5, this.TOTAL_STEPS, 'Generating recipe content...');
      log('🍳 STEP 5/5: Generating complete recipe...');

      const recipeId = RecipeGenerationService.generateRecipeId();

      const generationInput = {
        seoKeyword: spyData.seoKeyword!,
        seoTitle: spyData.seoTitle!,
        seoDescription: spyData.seoDescription!,
        seoCategory: spyData.seoCategory || 'Main Dish',
        featureImage: spyData.generatedImage1Url!,
        preparationImage: spyData.generatedImage2Url!,
        cookingImage: spyData.generatedImage3Url!,
        finalPresentationImage: spyData.generatedImage4Url!,
        authorId: authorId!,
        recipeId: recipeId,
        categoryId: categoryId,
        categoryName: categoryMatch?.categoryName,
        categorySlug: categoryMatch?.categorySlug,
        spyData: spyData
      };

      log(`📝 Calling AI to generate recipe...`);
      const generationResult = await RecipeGenerationService.generateRecipe(generationInput);

      if (!generationResult.success || !generationResult.recipeData) {
        throw new Error(generationResult.error || 'Recipe generation failed');
      }

      log(`✅ Recipe content generated successfully`);

      // Save recipe to database
      log(`💾 Saving recipe to database...`);
      const saveResult = await RecipeDatabaseService.saveRecipe({
        spyEntryId: context.spyDataId,
        recipeData: generationResult.recipeData,
        recipeJson: JSON.stringify(generationResult.recipeData)
      });

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save recipe');
      }

      log(`✅ Recipe saved with ID: ${saveResult.recipeId}`);

      // Update spy data to mark as completed
      await prisma.pinterestSpyData.update({
        where: { id: context.spyDataId },
        data: {
          status: 'COMPLETED',
          generatedRecipeId: saveResult.recipeId,
          recipeGeneratedAt: new Date()
        }
      });

      const recipeUrl = `/recipes/${generationResult.recipeData.slug}`;
      log(`🎉 Pipeline completed successfully! Recipe URL: ${recipeUrl}`);

      return {
        success: true,
        recipeId: saveResult.recipeId,
        recipeUrl: recipeUrl,
        logs
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log(`❌ Pipeline failed: ${errorMessage}`);

      // Update spy data status to failed
      await prisma.pinterestSpyData.update({
        where: { id: context.spyDataId },
        data: {
          status: 'FAILED',
          generationError: errorMessage,
          generationAttempts: { increment: 1 }
        }
      }).catch(e => log(`Failed to update spy data status: ${e}`));

      return {
        success: false,
        error: errorMessage,
        logs
      };
    }
  }

  /**
   * Generate SEO metadata for spy data
   */
  private static async generateSEO(spyDataId: string): Promise<void> {
    // Get base URL - use localhost for server-side calls
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
    
    const response = await fetch(`${baseUrl}/api/admin/pinterest-spy/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spyDataIds: [spyDataId] })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SEO generation failed: ${response.statusText} - ${errorText}`);
    }
  }

  /**
   * Generate images for spy data
   */
  private static async generateImages(spyDataId: string): Promise<void> {
    // Get base URL - use localhost for server-side calls
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
    
    const response = await fetch(`${baseUrl}/api/admin/pinterest-spy/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spyDataIds: [spyDataId] })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Image generation failed: ${response.statusText} - ${errorText}`);
    }
  }

  /**
   * Get next pending spy data entry for processing
   */
  static async getNextPendingEntry(): Promise<string | null> {
    const entry = await prisma.pinterestSpyData.findFirst({
      where: {
        OR: [
          { status: 'PENDING' },
          { status: 'SEO_COMPLETED' }
        ],
        generatedRecipeId: null
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      select: { id: true }
    });

    return entry?.id || null;
  }

  /**
   * Archive completed spy data to archive table
   */
  static async archiveCompletedEntry(spyDataId: string): Promise<void> {
    const spyData = await prisma.pinterestSpyData.findUnique({
      where: { id: spyDataId },
      include: { generatedRecipe: true }
    });

    if (!spyData || !spyData.generatedRecipe) {
      throw new Error('Spy data or generated recipe not found');
    }

    // Create archive entry
    await prisma.generatedRecipeArchive.create({
      data: {
        recipeId: spyData.generatedRecipeId!,
        originalSpyData: spyData as any,
        spyDataId: spyData.id,
        title: spyData.generatedRecipe.title,
        slug: spyData.generatedRecipe.slug,
        category: spyData.generatedRecipe.category,
        authorId: spyData.generatedRecipe.authorId,
        images: [
          spyData.generatedImage1Url,
          spyData.generatedImage2Url,
          spyData.generatedImage3Url,
          spyData.generatedImage4Url
        ].filter(Boolean) as string[],
        seoKeyword: spyData.seoKeyword,
        seoTitle: spyData.seoTitle,
        seoDescription: spyData.seoDescription,
        publishedAt: new Date(),
        status: 'ACTIVE'
      }
    });

    // Delete spy data entry
    await prisma.pinterestSpyData.delete({
      where: { id: spyDataId }
    });
  }
}
