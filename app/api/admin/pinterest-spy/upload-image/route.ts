/**
 * API Route: Upload Generated Image
 * 
 * POST /api/admin/pinterest-spy/upload-image
 * 
 * Uploads a generated image to the server and returns the public URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageData, filename, entryId } = body;

    if (!imageData || !filename || !entryId) {
      return NextResponse.json(
        { error: 'Missing required fields: imageData, filename, entryId' },
        { status: 400 }
      );
    }

    console.log(`📤 Uploading image: ${filename}`);

    // Define upload directory - save to /uploads instead of /public/uploads
    const uploadDir = path.join(process.cwd(), 'uploads', 'generated-recipes');

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
      console.log(`📁 Created directory: ${uploadDir}`);
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(imageData, 'base64');

    // Write file to disk
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Verify file was written
    const fileExists = existsSync(filePath);
    console.log(`✅ Image uploaded to: ${filePath}`);
    console.log(`📁 File exists: ${fileExists}`);
    console.log(`📏 Buffer size: ${buffer.length} bytes`);

    // Generate public URL - use /uploads route which has optimization
    const publicUrl = `/uploads/generated-recipes/${filename}`;
    console.log(`🌐 Public URL: ${publicUrl}`);

    return NextResponse.json({
      success: true,
      entryId,
      filename,
      url: publicUrl,
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
