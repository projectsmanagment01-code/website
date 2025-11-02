/**
 * API Route: Generate Image Prompts
 * 
 * POST /api/admin/pinterest-spy/generate-prompts
 * 
 * Generates 4 image prompts for a Pinterest Spy entry using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { PrismaClient } from '@prisma/client';
import { ImageGenerationService } from '@/automation/image-generation/service';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entryId, customPrompt } = body;

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    console.log(`📝 Generating image prompts for entry: ${entryId}`);

    // Fetch the entry with SEO data
    const entry = await prisma.pinterestSpyData.findUnique({
      where: { id: entryId },
      select: {
        id: true,
        seoTitle: true,
        seoDescription: true,
        seoKeyword: true,
        seoCategory: true,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    if (!entry.seoTitle || !entry.seoDescription || !entry.seoKeyword) {
      return NextResponse.json(
        { error: 'Entry must have SEO data (title, description, keyword) before generating image prompts' },
        { status: 400 }
      );
    }

    // Generate the 4 image prompts
    const prompts = await ImageGenerationService.generateImagePrompts({
      recipeTitle: entry.seoTitle,
      recipeDescription: entry.seoDescription,
      recipeKeyword: entry.seoKeyword,
      recipeCategory: entry.seoCategory || 'Recipe',
    });

    console.log(`✅ Generated 4 prompts for: ${entry.seoTitle}`);

    return NextResponse.json({
      success: true,
      entryId,
      prompts,
    });
  } catch (error) {
    console.error('❌ Error generating image prompts:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate image prompts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
