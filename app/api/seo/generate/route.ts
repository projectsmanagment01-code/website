/**
 * API Route: Generate SEO enhancements for recipes
 * POST /api/seo/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { AISeOEngine } from '@/lib/ai-seo/seo-engine';

const seoEngine = new AISeOEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      recipeData, 
      enhancementTypes = ['metadata', 'images', 'schema'] 
    } = body;

    // Validate input
    if (!recipeData) {
      return NextResponse.json(
        { error: 'Recipe data is required' },
        { status: 400 }
      );
    }

    const results: any = {
      recipeId: recipeData.id,
      recipeTitle: recipeData.title,
      enhancements: {}
    };

    // Generate metadata enhancements
    if (enhancementTypes.includes('metadata')) {
      try {
        const metadata = await seoEngine.generateMetadataSuggestions(recipeData);
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
    if (enhancementTypes.includes('images') && recipeData.heroImage) {
      try {
        const imageSEO = await seoEngine.generateImageAltText(
          recipeData.heroImage,
          recipeData,
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
        const schema = await seoEngine.generateSchemaEnhancements(recipeData);
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
        const analysis = await seoEngine.analyzeContentSEO(recipeData);
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
          recipeData: 'Recipe object with title, description, ingredients, etc.',
          enhancementTypes: 'Array of enhancement types to generate'
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