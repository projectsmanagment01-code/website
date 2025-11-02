/**
 * API Route: Save Generated Images
 * 
 * POST /api/admin/pinterest-spy/save-images
 * 
 * Saves the generated image URLs and prompts to the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entryId, imageUrls, prompts } = body;

    if (!entryId || !imageUrls || !prompts) {
      return NextResponse.json(
        { error: 'Missing required fields: entryId, imageUrls, prompts' },
        { status: 400 }
      );
    }

    console.log(`💾 Saving 4 generated images for entry: ${entryId}`);

    // Update database with image URLs and prompts
    await prisma.pinterestSpyData.update({
      where: { id: entryId },
      data: {
        generatedImage1Url: imageUrls.image1,
        generatedImage2Url: imageUrls.image2,
        generatedImage3Url: imageUrls.image3,
        generatedImage4Url: imageUrls.image4,
        generatedImagePrompts: prompts,
        imageGeneratedAt: new Date(),
        status: 'READY_FOR_GENERATION', // Ready for recipe generation
      },
    });

    console.log(`✅ Saved 4 image URLs to database for entry: ${entryId}`);

    return NextResponse.json({
      success: true,
      entryId,
      message: 'Image URLs saved successfully',
    });
  } catch (error) {
    console.error('❌ Error saving image URLs:', error);
    return NextResponse.json(
      {
        error: 'Failed to save image URLs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
