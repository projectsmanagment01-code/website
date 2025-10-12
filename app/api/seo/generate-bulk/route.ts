/**
 * API Route: Bulk Generate SEO for All Recipes
 * POST /api/seo/generate-bulk
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AISeOEngine } from '@/lib/ai-seo/seo-engine';

const seoEngine = new AISeOEngine();

export async function POST(request: NextRequest) {
  try {
    const { recipeIds } = await request.json();
    
    // If no specific IDs provided, process all recipes
    const recipes = recipeIds 
      ? await prisma.recipe.findMany({ where: { id: { in: recipeIds } } })
      : await prisma.recipe.findMany();

    console.log(`🚀 Starting bulk SEO generation for ${recipes.length} recipes...`);
    
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const recipe of recipes) {
      const startTime = Date.now();
      
      try {
        console.log(`📝 Processing: ${recipe.title}...`);

        // Check if report already exists
        const existingReport = await prisma.sEOEnhancementReport.findFirst({
          where: { recipeId: recipe.id }
        });

        if (existingReport && existingReport.status === 'success') {
          console.log(`⏭️ Skipping ${recipe.title} - already has successful report`);
          results.push({
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            status: 'skipped',
            message: 'Already has successful SEO report'
          });
          continue;
        }

        // Generate enhancements
        let enhancementsCount = 0;
        let metadataGenerated = false;
        let imagesProcessed = 0;
        let linksGenerated = 0;
        let schemaEnhanced = false;
        let seoScore = 0;
        const aiResponses: any = {};

        // Metadata
        try {
          const metadata = await seoEngine.generateMetadataSuggestions(recipe);
          aiResponses.metadata = metadata;
          metadataGenerated = true;
          enhancementsCount++;
          seoScore += 25;
        } catch (error: any) {
          console.error(`Failed to generate metadata for ${recipe.title}:`, error.message);
          aiResponses.metadata = { error: error.message };
        }

        // Images
        try {
          if (recipe.heroImage) {
            const imageAlt = await seoEngine.generateImageAltText(
              recipe.heroImage,
              recipe,
              'hero'
            );
            aiResponses.images = imageAlt;
            imagesProcessed = 1;
            enhancementsCount++;
            seoScore += 20;
          }
        } catch (error: any) {
          console.error(`Failed to generate image alt for ${recipe.title}:`, error.message);
          aiResponses.images = { error: error.message };
        }

        // Internal Links
        try {
          const allRecipes = await prisma.recipe.findMany({
            select: { id: true, title: true, slug: true, category: true }
          });
          const links = await seoEngine.generateInternalLinkSuggestions(
            recipe.description || recipe.intro || '',
            allRecipes as any
          );
          aiResponses.links = links;
          linksGenerated = links.length;
          enhancementsCount++;
          seoScore += 25;
        } catch (error: any) {
          console.error(`Failed to generate links for ${recipe.title}:`, error.message);
          aiResponses.links = { error: error.message };
        }

        // Schema
        try {
          const schema = await seoEngine.generateSchemaEnhancements(recipe);
          aiResponses.schema = schema;
          schemaEnhanced = true;
          enhancementsCount++;
          seoScore += 30;
        } catch (error: any) {
          console.error(`Failed to generate schema for ${recipe.title}:`, error.message);
          aiResponses.schema = { error: error.message };
        }

        const processingTime = Math.round((Date.now() - startTime) / 1000);
        const status = enhancementsCount > 0 ? 'success' : 'failed';

        // Save or update report
        const reportData = {
          recipeId: recipe.id,
          recipeTitle: recipe.title,
          status,
          seoScore,
          enhancementsCount,
          processingTime,
          metadataGenerated,
          imagesProcessed,
          linksGenerated,
          schemaEnhanced,
          aiResponse: aiResponses,
          errorMessage: status === 'failed' ? 'No enhancements generated' : null
        };

        if (existingReport) {
          await prisma.sEOEnhancementReport.update({
            where: { id: existingReport.id },
            data: reportData
          });
        } else {
          await prisma.sEOEnhancementReport.create({
            data: reportData
          });
        }

        console.log(`✅ Completed: ${recipe.title} (Score: ${seoScore}/100)`);
        
        results.push({
          recipeId: recipe.id,
          recipeTitle: recipe.title,
          status,
          seoScore,
          processingTime
        });

        if (status === 'success') successCount++;
        else failedCount++;

      } catch (error: any) {
        console.error(`❌ Failed to process ${recipe.title}:`, error);
        failedCount++;
        
        // Save failed report
        await prisma.sEOEnhancementReport.create({
          data: {
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            status: 'failed',
            seoScore: 0,
            enhancementsCount: 0,
            processingTime: Math.round((Date.now() - startTime) / 1000),
            metadataGenerated: false,
            imagesProcessed: 0,
            linksGenerated: 0,
            schemaEnhanced: false,
            errorMessage: error.message || 'Unknown error',
            aiResponse: { error: error.message }
          }
        });

        results.push({
          recipeId: recipe.id,
          recipeTitle: recipe.title,
          status: 'failed',
          error: error.message
        });
      }
    }

    console.log(`\n🎉 Bulk processing complete!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);

    return NextResponse.json({
      success: true,
      summary: {
        total: recipes.length,
        success: successCount,
        failed: failedCount
      },
      results
    });

  } catch (error: any) {
    console.error('Bulk SEO generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate bulk SEO', details: error.message },
      { status: 500 }
    );
  }
}
