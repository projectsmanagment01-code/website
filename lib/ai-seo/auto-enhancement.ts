/**
 * Automatic SEO Enhancement Trigger System
 * 
 * Automatically triggers AI SEO enhancements when recipes are created or updated
 * Runs in the background and stores results for admin review
 */

import { AISeOEngine } from '@/lib/ai-seo/seo-engine';
import { prisma } from '@/lib/prisma';

const seoEngine = new AISeOEngine();

interface RecipeData {
  id: string;
  title: string;
  description: string;
  category: string;
  cuisine?: string;
  heroImage?: string;
  images?: string[];
  ingredients?: string[];
  instructions?: string[];
  prepTime?: string;
  cookTime?: string;
  difficulty?: string;
}

interface AutoEnhancementResult {
  recipeId: string;
  recipeTitle: string;
  status: 'success' | 'partial' | 'failed';
  enhancementsGenerated: number;
  enhancementDetails: {
    metadata?: { status: string; confidence: number; data: any };
    images?: { status: string; confidence: number; data: any[] };
    internalLinks?: { status: string; confidence: number; data: any[] };
    schema?: { status: string; confidence: number; data: any };
  };
  errors?: string[];
  processingTime: number;
  createdAt: Date;
}

/**
 * Main auto-enhancement function
 * Called when a recipe is created or updated
 */
export async function triggerAutoSEOEnhancement(
  recipe: RecipeData,
  options: {
    autoApply?: boolean; // If true, applies changes immediately without review
    priority?: 'high' | 'medium' | 'low';
    notifyAdmin?: boolean;
  } = {}
): Promise<AutoEnhancementResult> {
  const startTime = Date.now();
  const result: AutoEnhancementResult = {
    recipeId: recipe.id,
    recipeTitle: recipe.title,
    status: 'success',
    enhancementsGenerated: 0,
    enhancementDetails: {},
    errors: [],
    processingTime: 0,
    createdAt: new Date()
  };

  try {
    console.log(`🤖 Auto-SEO: Processing recipe "${recipe.title}" (ID: ${recipe.id})`);

    // 1. Generate Metadata Enhancement
    try {
      const metadata = await seoEngine.generateMetadataSuggestions(recipe);
      
      // Save to database
      const savedMetadata = await prisma.sEOEnhancement.create({
        data: {
          type: 'metadata',
          recipeId: recipe.id,
          status: options.autoApply ? 'applied' : 'pending',
          confidence: 0.85,
          suggestedContent: JSON.stringify(metadata),
          reasoning: 'Auto-generated SEO metadata on recipe creation',
          keywords: metadata.keywords,
          estimatedImpact: 'high',
          originalContent: JSON.stringify({
            title: recipe.title,
            description: recipe.description
          })
        }
      });

      result.enhancementDetails.metadata = {
        status: 'success',
        confidence: 0.85,
        data: metadata
      };
      result.enhancementsGenerated++;

      // Auto-apply if enabled
      if (options.autoApply) {
        await applyMetadataEnhancement(recipe.id, metadata);
      }

      console.log(`✅ Metadata enhancement generated for "${recipe.title}"`);
    } catch (error: any) {
      console.error(`❌ Metadata enhancement failed:`, error);
      result.errors?.push(`Metadata: ${error.message}`);
      result.enhancementDetails.metadata = {
        status: 'failed',
        confidence: 0,
        data: null
      };
    }

    // 2. Generate Image SEO Enhancements
    if (recipe.heroImage || recipe.images?.length) {
      try {
        const imageEnhancements = [];
        const imagesToProcess = [
          ...(recipe.heroImage ? [{ url: recipe.heroImage, context: 'hero' }] : []),
          ...(recipe.images?.slice(0, 5).map(img => ({ url: img, context: 'gallery' })) || [])
        ];

        for (const image of imagesToProcess) {
          try {
            const imageSEO = await seoEngine.generateImageAltText(
              image.url,
              recipe,
              image.context
            );

            // Save to database
            await prisma.sEOImageData.create({
              data: {
                imageUrl: image.url,
                aiAltText: imageSEO.altText,
                aiCaption: imageSEO.caption,
                aiTitle: imageSEO.title,
                aiStructuredData: imageSEO.structuredData,
                pageType: 'recipe',
                pageId: recipe.id,
                imageContext: image.context,
                recipeId: recipe.id
              }
            });

            imageEnhancements.push(imageSEO);

            // Also save as enhancement for tracking
            await prisma.sEOEnhancement.create({
              data: {
                type: 'image',
                recipeId: recipe.id,
                status: options.autoApply ? 'applied' : 'pending',
                confidence: 0.8,
                suggestedContent: JSON.stringify(imageSEO),
                reasoning: `Auto-generated ${image.context} image SEO on recipe creation`,
                keywords: [],
                estimatedImpact: 'medium'
              }
            });

            // Small delay between images
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error: any) {
            console.error(`Failed to process image ${image.url}:`, error);
            result.errors?.push(`Image ${image.context}: ${error.message}`);
          }
        }

        result.enhancementDetails.images = {
          status: imageEnhancements.length > 0 ? 'success' : 'failed',
          confidence: 0.8,
          data: imageEnhancements
        };
        result.enhancementsGenerated += imageEnhancements.length;

        console.log(`✅ ${imageEnhancements.length} image enhancement(s) generated`);
      } catch (error: any) {
        console.error(`❌ Image enhancement failed:`, error);
        result.errors?.push(`Images: ${error.message}`);
      }
    }

    // 3. Generate Internal Link Suggestions
    try {
      // Get related recipes for context
      const relatedRecipes = await prisma.recipe.findMany({
        where: {
          OR: [
            { category: recipe.category },
            { cuisine: recipe.cuisine }
          ],
          id: { not: recipe.id }
        },
        take: 20,
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          cuisine: true
        }
      });

      const categories = await prisma.category.findMany({
        select: { name: true, slug: true }
      });

      const content = `${recipe.description} ${recipe.instructions?.join(' ') || ''}`;
      const linkSuggestions = await seoEngine.generateInternalLinkSuggestions(
        content,
        recipe,
        relatedRecipes,
        categories.map(c => c.name)
      );

      if (linkSuggestions.length > 0) {
        // Save internal link suggestions
        for (const link of linkSuggestions) {
          await prisma.sEOInternalLink.create({
            data: {
              sourcePage: `/recipes/${recipe.id}`,
              sourcePageType: 'recipe',
              sourcePageId: recipe.id,
              targetPage: link.targetUrl,
              targetPageType: 'recipe',
              targetPageId: link.targetUrl.split('/').pop() || '',
              targetPageTitle: link.targetPageTitle,
              anchorText: link.anchorText,
              contextBefore: link.contextBefore,
              contextAfter: link.contextAfter,
              linkType: link.linkType,
              relevanceScore: link.relevanceScore,
              status: options.autoApply ? 'applied' : 'pending'
            }
          });

          // Also save as enhancement
          await prisma.sEOEnhancement.create({
            data: {
              type: 'internal-link',
              recipeId: recipe.id,
              status: options.autoApply ? 'applied' : 'pending',
              confidence: link.relevanceScore,
              suggestedContent: JSON.stringify(link),
              reasoning: 'Auto-generated internal link suggestion',
              keywords: [link.anchorText],
              estimatedImpact: link.relevanceScore > 0.8 ? 'high' : 'medium'
            }
          });
        }

        result.enhancementDetails.internalLinks = {
          status: 'success',
          confidence: 0.75,
          data: linkSuggestions
        };
        result.enhancementsGenerated += linkSuggestions.length;

        console.log(`✅ ${linkSuggestions.length} internal link(s) suggested`);
      }
    } catch (error: any) {
      console.error(`❌ Internal links generation failed:`, error);
      result.errors?.push(`Internal Links: ${error.message}`);
    }

    // 4. Generate Enhanced Schema
    try {
      const schema = await seoEngine.generateSchemaEnhancements(recipe);

      await prisma.sEOEnhancement.create({
        data: {
          type: 'schema',
          recipeId: recipe.id,
          status: options.autoApply ? 'applied' : 'pending',
          confidence: 0.9,
          suggestedContent: JSON.stringify(schema),
          reasoning: 'Auto-generated enhanced schema with nutrition info',
          keywords: [],
          estimatedImpact: 'high'
        }
      });

      result.enhancementDetails.schema = {
        status: 'success',
        confidence: 0.9,
        data: schema
      };
      result.enhancementsGenerated++;

      console.log(`✅ Schema enhancement generated`);
    } catch (error: any) {
      console.error(`❌ Schema enhancement failed:`, error);
      result.errors?.push(`Schema: ${error.message}`);
    }

    // 5. Update recipe with SEO analysis timestamp and score
    const seoScore = calculateSEOScore(result);
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        lastSEOAnalysis: new Date(),
        seoScore: seoScore,
        aiEnhancementsCount: result.enhancementsGenerated
      }
    });

    // 6. Create auto-enhancement report
    await createEnhancementReport(result);

    // Determine final status
    if (result.enhancementsGenerated === 0) {
      result.status = 'failed';
    } else if (result.errors && result.errors.length > 0) {
      result.status = 'partial';
    }

    result.processingTime = Date.now() - startTime;

    console.log(`✨ Auto-SEO completed for "${recipe.title}": ${result.enhancementsGenerated} enhancements in ${result.processingTime}ms`);

    // 7. Notify admin if requested
    if (options.notifyAdmin) {
      await notifyAdminOfEnhancements(result);
    }

  } catch (error: any) {
    console.error(`❌ Fatal error in auto-SEO:`, error);
    result.status = 'failed';
    result.errors?.push(`Fatal: ${error.message}`);
    result.processingTime = Date.now() - startTime;
  }

  return result;
}

/**
 * Helper function to apply metadata enhancements automatically
 */
async function applyMetadataEnhancement(recipeId: string, metadata: any) {
  try {
    // Update SEOMetadata table
    await prisma.sEOMetadata.upsert({
      where: { pageId: recipeId },
      update: {
        aiTitle: metadata.title,
        aiDescription: metadata.description,
        aiKeywords: metadata.keywords,
        aiOgTitle: metadata.ogTitle,
        aiOgDescription: metadata.ogDescription,
        currentTitle: metadata.title,
        currentDescription: metadata.description,
        currentKeywords: metadata.keywords,
        lastApplied: new Date()
      },
      create: {
        pageType: 'recipe',
        pageId: recipeId,
        slug: recipeId,
        aiTitle: metadata.title,
        aiDescription: metadata.description,
        aiKeywords: metadata.keywords,
        aiOgTitle: metadata.ogTitle,
        aiOgDescription: metadata.ogDescription,
        currentTitle: metadata.title,
        currentDescription: metadata.description,
        currentKeywords: metadata.keywords,
        recipeId: recipeId,
        lastApplied: new Date()
      }
    });
  } catch (error) {
    console.error('Error applying metadata:', error);
  }
}

/**
 * Calculate SEO score based on enhancements
 */
function calculateSEOScore(result: AutoEnhancementResult): number {
  let score = 50; // Base score

  // Metadata (25 points)
  if (result.enhancementDetails.metadata?.status === 'success') {
    score += 25;
  }

  // Images (15 points)
  if (result.enhancementDetails.images?.status === 'success') {
    const imageCount = result.enhancementDetails.images.data?.length || 0;
    score += Math.min(15, imageCount * 3);
  }

  // Internal Links (10 points)
  if (result.enhancementDetails.internalLinks?.status === 'success') {
    const linkCount = result.enhancementDetails.internalLinks.data?.length || 0;
    score += Math.min(10, linkCount * 2);
  }

  // Schema (10 points)
  if (result.enhancementDetails.schema?.status === 'success') {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Create detailed enhancement report
 */
async function createEnhancementReport(result: AutoEnhancementResult) {
  try {
    // Store in a reports table for admin dashboard
    await prisma.$executeRaw`
      INSERT INTO seo_enhancement_reports 
      (recipe_id, recipe_title, status, enhancements_count, details, errors, processing_time, created_at)
      VALUES (
        ${result.recipeId},
        ${result.recipeTitle},
        ${result.status},
        ${result.enhancementsGenerated},
        ${JSON.stringify(result.enhancementDetails)},
        ${JSON.stringify(result.errors)},
        ${result.processingTime},
        ${result.createdAt}
      )
    `;
  } catch (error) {
    console.error('Error creating enhancement report:', error);
  }
}

/**
 * Notify admin of new enhancements
 */
async function notifyAdminOfEnhancements(result: AutoEnhancementResult) {
  // This could send email, create notification, etc.
  console.log(`📧 Admin notification: ${result.enhancementsGenerated} enhancements for "${result.recipeTitle}"`);
  
  // Example: Create in-app notification
  try {
    await prisma.notification.create({
      data: {
        type: 'seo_enhancement',
        title: `New SEO Enhancements: ${result.recipeTitle}`,
        message: `${result.enhancementsGenerated} AI-generated enhancements ready for review`,
        data: JSON.stringify(result),
        read: false,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Background job to process recipes without SEO analysis
 */
export async function processUnanalyzedRecipes(batchSize: number = 10) {
  console.log(`🔄 Starting batch SEO analysis for ${batchSize} recipes...`);

  const recipes = await prisma.recipe.findMany({
    where: {
      OR: [
        { lastSEOAnalysis: null },
        { 
          lastSEOAnalysis: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Older than 30 days
          }
        }
      ]
    },
    take: batchSize,
    orderBy: { createdAt: 'desc' }
  });

  const results = [];

  for (const recipe of recipes) {
    try {
      const result = await triggerAutoSEOEnhancement(recipe, {
        autoApply: false,
        priority: 'medium',
        notifyAdmin: false
      });
      results.push(result);

      // Delay between recipes to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error processing recipe ${recipe.id}:`, error);
    }
  }

  console.log(`✅ Batch processing complete: ${results.length} recipes analyzed`);
  return results;
}

export default triggerAutoSEOEnhancement;