/**
 * API Route: Generate SEO enhancements for recipes
 * POST /api/seo/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { AISeOEngine } from '@/lib/ai-seo/seo-engine';
import prisma from '@/lib/prisma';

const seoEngine = new AISeOEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      recipeId,
      recipeData, 
      enhancementTypes = ['metadata', 'images', 'schema'] 
    } = body;

    // Validate input - need either recipeId or recipeData
    if (!recipeId && !recipeData) {
      return NextResponse.json(
        { error: 'Either recipeId or recipeData is required' },
        { status: 400 }
      );
    }

    // Fetch recipe data if only recipeId is provided
    let recipe = recipeData;
    if (!recipe && recipeId) {
      try {
        recipe = await prisma.recipe.findUnique({
          where: { id: recipeId },
          include: {
            author: true,
          }
        });

        if (!recipe) {
          return NextResponse.json(
            { error: `Recipe with ID ${recipeId} not found` },
            { status: 404 }
          );
        }
      } catch (dbError: any) {
        console.error('Database error fetching recipe:', dbError);
        return NextResponse.json(
          { error: 'Failed to fetch recipe from database', details: dbError.message },
          { status: 500 }
        );
      }
    }

    const results: any = {
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      enhancements: {}
    };

    // Generate metadata enhancements
    if (enhancementTypes.includes('metadata')) {
      try {
        const metadata = await seoEngine.generateMetadataSuggestions(recipe);
        results.enhancements.metadata = {
          status: 'generated',
          data: metadata
        };
      } catch (error: any) {
        results.enhancements.metadata = {
          status: 'failed',
          error: error.message || 'Unknown error'
        };
      }
    }

    // Generate image SEO enhancements
    if (enhancementTypes.includes('images') && recipe.heroImage) {
      try {
        const imageSEO = await seoEngine.generateImageAltText(
          recipe.heroImage,
          recipe,
          'hero'
        );
        results.enhancements.images = {
          status: 'generated',
          data: imageSEO
        };
      } catch (error: any) {
        results.enhancements.images = {
          status: 'failed',
          error: error.message || 'Unknown error'
        };
      }
    }

    // Generate schema enhancements
    if (enhancementTypes.includes('schema')) {
      try {
        const schema = await seoEngine.generateSchemaEnhancements(recipe);
        results.enhancements.schema = {
          status: 'generated',
          data: schema
        };
      } catch (error: any) {
        results.enhancements.schema = {
          status: 'failed',
          error: error.message || 'Unknown error'
        };
      }
    }

    // Generate content analysis
    if (enhancementTypes.includes('content-analysis')) {
      try {
        const analysis = await seoEngine.analyzeContentSEO(recipe);
        results.enhancements.contentAnalysis = {
          status: 'generated',
          data: analysis
        };
      } catch (error: any) {
        results.enhancements.contentAnalysis = {
          status: 'failed',
          error: error.message || 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error: any) {
    console.error('SEO generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return available AI SEO services and their status
    return NextResponse.json({
      success: true,
      services: {
        metadata: 'Generate SEO-optimized titles, descriptions, and keywords',
        images: 'Generate alt text and captions for recipe images',
        schema: 'Enhanced structured data with nutrition information',
        contentAnalysis: 'Analyze content for SEO improvements',
        internalLinks: 'Suggest relevant internal links (requires recipe database)'
      },
      usage: {
        endpoint: '/api/seo/generate',
        method: 'POST',
        body: {
          recipeId: 'Recipe ID (will fetch from database) - OR -',
          recipeData: 'Recipe object with title, description, ingredients, etc.',
          enhancementTypes: 'Array of enhancement types to generate (optional, defaults to ["metadata", "images", "schema"])'
        },
        examples: {
          byId: '{ "recipeId": "clx123abc..." }',
          byData: '{ "recipeData": { "title": "...", "description": "..." } }'
        }
      }
    });

  } catch (error: any) {
    console.error('SEO API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}