/**
 * API Route: Generate Single Image
 * 
 * POST /api/admin/pinterest-spy/generate-image
 * 
 * Generates a single image using Google Imagen 3
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { ImageGenerationService } from '@/automation/image-generation/service';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, referenceImageUrl, imageNumber, seoKeyword, entryId } = body;

    if (!prompt || !imageNumber || !seoKeyword || !entryId) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, imageNumber, seoKeyword, entryId' },
        { status: 400 }
      );
    }

    console.log(`🖼️ Generating image ${imageNumber}/4 for entry: ${entryId}`);

    // Convert reference image URL to base64 (optional - will be null if not available)
    const referenceImageBase64 = await ImageGenerationService.imageUrlToBase64(referenceImageUrl);

    // Generate the image
    const result = await ImageGenerationService.generateSingleImage(
      prompt,
      referenceImageBase64,
      imageNumber,
      seoKeyword
    );

    console.log(`✅ Generated image ${imageNumber}/4: ${result.filename}`);

    return NextResponse.json({
      success: true,
      entryId,
      imageNumber,
      filename: result.filename,
      imageData: result.imageData, // Base64 image data
    });
  } catch (error) {
    console.error('❌ Error generating image:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
