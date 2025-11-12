/**
 * Test endpoint to verify image generation and file saving
 * POST /api/admin/automation/test-image
 */

import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function POST(req: NextRequest) {
  try {
    console.log('=== TEST IMAGE GENERATION START ===');
    
    // Create a simple test image (100x100 red square)
    const testImageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .png()
    .toBuffer();

    console.log('✅ Test image created in memory');

    // Define upload directory (same as pipeline)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'generated-recipes');
    console.log(`📁 Upload directory: ${uploadDir}`);

    // Create directory
    await fs.mkdir(uploadDir, { recursive: true });
    console.log('✅ Directory created/verified');

    // Verify directory exists
    await fs.access(uploadDir);
    console.log('✅ Directory accessible');

    // Generate unique filename
    const filename = `test-${Date.now()}.webp`;
    const webpPath = path.join(uploadDir, filename);
    console.log(`💾 Saving to: ${webpPath}`);

    // Convert to WebP and save
    await sharp(testImageBuffer)
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    console.log('✅ File written with Sharp');

    // Wait a bit for filesystem
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify file exists
    const stats = await fs.stat(webpPath);
    console.log(`✅ File verified - Size: ${stats.size} bytes`);

    // Verify file is readable
    await fs.access(webpPath, fs.constants.R_OK);
    console.log('✅ File is readable');

    // Try to read the file content
    const fileContent = await fs.readFile(webpPath);
    console.log(`✅ File content read - ${fileContent.length} bytes`);

    // List all files in directory
    const allFiles = await fs.readdir(uploadDir);
    console.log(`📂 Directory contains ${allFiles.length} files`);

    const imageUrl = `/uploads/generated-recipes/${filename}`;

    console.log('=== TEST IMAGE GENERATION SUCCESS ===');

    return NextResponse.json({
      success: true,
      message: 'Test image generated and verified successfully',
      details: {
        filename,
        path: webpPath,
        url: imageUrl,
        size: stats.size,
        uploadDir,
        filesInDirectory: allFiles.length,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      }
    }, { status: 200 });

  } catch (error) {
    console.error('=== TEST IMAGE GENERATION FAILED ===');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
