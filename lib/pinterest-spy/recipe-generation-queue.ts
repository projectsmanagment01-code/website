/**
 * Pinterest Spy Data Recipe Generation Service
 * 
 * Processes spy data entries that are marked for generation
 * and creates recipes using AI automation
 */

import { PrismaClient } from "@prisma/client";
import { SEOExtractionService } from "./seo-extraction-service";

const prisma = new PrismaClient();

export interface GenerationRequest {
  spyDataId: string;
  priority?: number;
  options?: {
    skipSEOProcessing?: boolean;
    customPrompts?: {
      recipeStyle?: string;
      additionalInstructions?: string;
    };
  };
}

export interface GenerationResult {
  success: boolean;
  spyDataId: string;
  recipeId?: string;
  error?: string;
  processingTime?: number;
}

export class RecipeGenerationQueue {
  /**
   * Add spy data entries to generation queue
   */
  static async queueForGeneration(requests: GenerationRequest[]): Promise<{
    queued: number;
    failed: number;
    results: Array<{ spyDataId: string; success: boolean; error?: string }>;
  }> {
    const results: Array<{ spyDataId: string; success: boolean; error?: string }> = [];
    let queued = 0;
    let failed = 0;

    for (const request of requests) {
      try {
        // Get the spy data entry
        const spyData = await prisma.pinterestSpyData.findUnique({
          where: { id: request.spyDataId }
        });

        if (!spyData) {
          results.push({ 
            spyDataId: request.spyDataId, 
            success: false, 
            error: 'Spy data not found' 
          });
          failed++;
          continue;
        }

        // Check if already has a generated recipe
        if (spyData.generatedRecipeId) {
          results.push({ 
            spyDataId: request.spyDataId, 
            success: false, 
            error: 'Recipe already generated' 
          });
          failed++;
          continue;
        }

        // Ensure SEO processing is complete (unless skipped)
        if (!request.options?.skipSEOProcessing && !spyData.seoKeyword) {
          // Auto-process SEO if missing
          try {
            console.log(`🔄 Auto-processing SEO for: ${spyData.spyTitle}`);
            const seoMetadata = await SEOExtractionService.extractSEOMetadata({
              spyTitle: spyData.spyTitle,
              spyDescription: spyData.spyDescription,
              spyImageUrl: spyData.spyImageUrl,
              spyArticleUrl: spyData.spyArticleUrl,
              spyPinImage: spyData.spyPinImage || undefined,
              annotation: spyData.annotation || undefined
            });

            await prisma.pinterestSpyData.update({
              where: { id: request.spyDataId },
              data: {
                seoKeyword: seoMetadata.seoKeyword,
                seoTitle: seoMetadata.seoTitle,
                seoDescription: seoMetadata.seoDescription,
                seoProcessedAt: new Date(),
                status: 'SEO_COMPLETED'
              }
            });
          } catch (seoError) {
            console.error(`❌ SEO processing failed for ${request.spyDataId}:`, seoError);
            results.push({ 
              spyDataId: request.spyDataId, 
              success: false, 
              error: `SEO processing failed: ${seoError instanceof Error ? seoError.message : 'Unknown error'}` 
            });
            failed++;
            continue;
          }
        }

        // Update status to ready for generation
        await prisma.pinterestSpyData.update({
          where: { id: request.spyDataId },
          data: {
            status: 'READY_FOR_GENERATION',
            isMarkedForGeneration: true,
            priority: request.priority || 0
          }
        });

        results.push({ spyDataId: request.spyDataId, success: true });
        queued++;
        
        console.log(`✅ Queued for generation: ${spyData.spyTitle}`);
      } catch (error) {
        console.error(`❌ Failed to queue ${request.spyDataId}:`, error);
        results.push({ 
          spyDataId: request.spyDataId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        failed++;
      }
    }

    return { queued, failed, results };
  }

  /**
   * Process the generation queue (generate recipes from spy data)
   */
  static async processGenerationQueue(batchSize: number = 3): Promise<{
    processed: number;
    failed: number;
    results: GenerationResult[];
  }> {
    console.log('🚀 Starting recipe generation queue processing...');

    // Get entries ready for generation, ordered by priority
    const readyEntries = await prisma.pinterestSpyData.findMany({
      where: {
        status: 'READY_FOR_GENERATION',
        isMarkedForGeneration: true,
        generatedRecipeId: null
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      take: batchSize
    });

    if (readyEntries.length === 0) {
      console.log('📭 No entries ready for generation');
      return { processed: 0, failed: 0, results: [] };
    }

    console.log(`📦 Processing ${readyEntries.length} entries for recipe generation`);

    const results: GenerationResult[] = [];
    let processed = 0;
    let failed = 0;

    for (const spyData of readyEntries) {
      const startTime = Date.now();
      
      try {
        console.log(`🔄 Generating recipe for: ${spyData.spyTitle}`);

        // Update status to generating
        await prisma.pinterestSpyData.update({
          where: { id: spyData.id },
          data: { 
            status: 'GENERATING',
            generationAttempts: { increment: 1 }
          }
        });

        // Generate the recipe using AI
        const recipe = await this.generateRecipeFromSpyData(spyData);

        // Save the generated recipe to database
        const createdRecipe = await prisma.recipe.create({
          data: recipe
        });

        // Update spy data with generated recipe reference
        await prisma.pinterestSpyData.update({
          where: { id: spyData.id },
          data: {
            status: 'COMPLETED',
            generatedRecipeId: createdRecipe.id,
            recipeGeneratedAt: new Date(),
            generationError: null,
            isProcessed: true
          }
        });

        const processingTime = Date.now() - startTime;
        results.push({
          success: true,
          spyDataId: spyData.id,
          recipeId: createdRecipe.id,
          processingTime
        });
        
        processed++;
        console.log(`✅ Recipe generated: ${createdRecipe.title} (${processingTime}ms)`);
        
        // Add delay between generations to avoid overwhelming AI APIs
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Recipe generation failed for ${spyData.id}:`, error);
        
        // Update with error
        await prisma.pinterestSpyData.update({
          where: { id: spyData.id },
          data: {
            status: 'FAILED',
            generationError: error instanceof Error ? error.message : 'Unknown error'
          }
        });

        const processingTime = Date.now() - startTime;
        results.push({
          success: false,
          spyDataId: spyData.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime
        });
        
        failed++;
      }
    }

    console.log(`🎉 Queue processing complete: ${processed} success, ${failed} failed`);
    return { processed, failed, results };
  }

  /**
   * Generate a complete recipe from spy data using AI
   */
  private static async generateRecipeFromSpyData(spyData: any): Promise<any> {
    // This would integrate with your existing recipe generation system
    // For now, create a basic recipe structure based on spy data
    
    const slug = this.generateSlug(spyData.seoTitle || spyData.spyTitle);
    
    // Basic recipe structure based on spy data
    const recipe = {
      title: spyData.seoTitle || spyData.spyTitle,
      slug,
      intro: spyData.seoDescription || spyData.spyDescription.substring(0, 200),
      description: spyData.spyDescription,
      shortDescription: spyData.seoDescription || spyData.spyDescription.substring(0, 150),
      story: `Inspired by Pinterest content, this ${spyData.seoKeyword || 'recipe'} brings together the best of home cooking.`,
      testimonial: "A delightful recipe that's perfect for any occasion!",
      
      // Category (could be enhanced with AI classification)
      category: spyData.seoKeyword?.includes('dessert') ? 'desserts' : 
                spyData.seoKeyword?.includes('breakfast') ? 'breakfast' : 
                spyData.seoKeyword?.includes('dinner') ? 'dinner' : 'main-dishes',
      categoryLink: '#main-dishes',
      featuredText: spyData.seoKeyword || 'featured',
      
      // Images
      img: spyData.spyImageUrl,
      heroImage: spyData.spyPinImage || spyData.spyImageUrl,
      images: [spyData.spyImageUrl, spyData.spyPinImage].filter(Boolean),
      
      // Basic recipe components (would be enhanced with AI generation)
      ingredients: [{
        section: 'Main Ingredients',
        items: ['Ingredients will be generated from the content analysis']
      }],
      
      instructions: [{
        step: '1',
        instruction: 'Instructions will be generated from the Pinterest content analysis'
      }],
      
      // Metadata
      timing: {
        prepTime: '15 minutes',
        cookTime: '30 minutes',
        totalTime: '45 minutes'
      },
      
      recipeInfo: {
        difficulty: 'Easy',
        cuisine: 'American',
        servings: '4 servings',
        dietary: ''
      },
      
      // Author (could be assigned based on category or randomly)
      author: {
        name: 'Recipe Bot',
        bio: 'AI-powered recipe creation',
        avatar: spyData.spyImageUrl,
        link: '/authors/recipe-bot'
      },
      
      // Additional fields
      updatedDate: new Date().toISOString(),
      notes: spyData.annotation ? [spyData.annotation] : [],
      tools: [],
      mustKnowTips: [],
      professionalSecrets: [],
      allergyInfo: 'Please check ingredients for allergens',
      nutritionDisclaimer: 'Nutritional information is approximate',
      serving: '4 people',
      storage: 'Store in refrigerator for up to 3 days',
      
      // Status
      status: 'published',
      href: `/recipes/${slug}`
    };

    // Here you would integrate with your AI system to enhance the recipe
    // For example, using the spy data to generate proper ingredients and instructions
    
    return recipe;
  }

  /**
   * Get generation queue status
   */
  static async getQueueStatus(): Promise<{
    readyForGeneration: number;
    generating: number;
    completed: number;
    failed: number;
    totalMarked: number;
  }> {
    const [ready, generating, completed, failed, totalMarked] = await Promise.all([
      prisma.pinterestSpyData.count({
        where: { status: 'READY_FOR_GENERATION' }
      }),
      prisma.pinterestSpyData.count({
        where: { status: 'GENERATING' }
      }),
      prisma.pinterestSpyData.count({
        where: { status: 'COMPLETED' }
      }),
      prisma.pinterestSpyData.count({
        where: { status: 'FAILED' }
      }),
      prisma.pinterestSpyData.count({
        where: { isMarkedForGeneration: true }
      })
    ]);

    return {
      readyForGeneration: ready,
      generating,
      completed,
      failed,
      totalMarked
    };
  }

  /**
   * Helper to generate URL-friendly slug
   */
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}