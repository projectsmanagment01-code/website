/**
 * API Route: Delete Generated Images
 * 
 * DELETE /api/admin/pinterest-spy/delete-images
 * 
 * Deletes generated images from disk and database (bulk or individual)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { PrismaClient } from '@prisma/client';
import { unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entryIds } = body; // Array of entry IDs to delete images for

    if (!entryIds || !Array.isArray(entryIds) || entryIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid entryIds array' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Deleting generated images for ${entryIds.length} entries`);

    let deletedFiles = 0;
    let errors = 0;

    for (const entryId of entryIds) {
      try {
        // Get entry from database
        const entry = await prisma.pinterestSpyData.findUnique({
          where: { id: entryId },
          select: {
            generatedImage1Url: true,
            generatedImage2Url: true,
            generatedImage3Url: true,
            generatedImage4Url: true,
          },
        });

        if (!entry) {
          console.warn(`⚠️ Entry not found: ${entryId}`);
          continue;
        }

        // Extract filenames from URLs and delete files
        const imageUrls = [
          entry.generatedImage1Url,
          entry.generatedImage2Url,
          entry.generatedImage3Url,
          entry.generatedImage4Url,
        ];

        for (const url of imageUrls) {
          if (url) {
            try {
              // Extract filename from URL: /uploads/generated-recipes/filename.jpg
              const filename = url.split('/').pop();
              if (filename) {
                const filePath = path.join(process.cwd(), 'uploads', 'generated-recipes', filename);
                
                if (existsSync(filePath)) {
                  await unlink(filePath);
                  deletedFiles++;
                  console.log(`🗑️ Deleted: ${filename}`);
                } else {
                  console.warn(`⚠️ File not found: ${filePath}`);
                }
              }
            } catch (fileError) {
              console.error(`❌ Error deleting file ${url}:`, fileError);
              errors++;
            }
          }
        }

        // Clear image URLs from database
        await prisma.pinterestSpyData.update({
          where: { id: entryId },
          data: {
            generatedImage1Url: null,
            generatedImage2Url: null,
            generatedImage3Url: null,
            generatedImage4Url: null,
            generatedImagePrompts: null,
            imageGeneratedAt: null,
            status: 'SEO_PROCESSED', // Reset to SEO processed state
          },
        });

        console.log(`✅ Cleared database records for entry: ${entryId}`);
      } catch (entryError) {
        console.error(`❌ Error processing entry ${entryId}:`, entryError);
        errors++;
      }
    }

    console.log(`✅ Deletion complete: ${deletedFiles} files deleted, ${errors} errors`);

    return NextResponse.json({
      success: true,
      deletedFiles,
      errors,
      entriesProcessed: entryIds.length,
    });
  } catch (error) {
    console.error('❌ Error deleting images:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete images',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
