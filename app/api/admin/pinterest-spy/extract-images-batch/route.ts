/**
 * Background Image Extraction API
 * 
 * This endpoint handles background image extraction for Pinterest spy entries
 * after successful import, without blocking the import process.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Cache control
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * POST /api/admin/pinterest-spy/extract-images-batch
 * Background image extraction for batch of entries
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await verifyAuth(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { batchId, entries } = body;

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: 'No entries provided' }, { status: 400 });
    }

    console.log(`🖼️ Starting background image extraction for ${entries.length} entries`);

    // Start background extraction process (don't await - run in background)
    setImmediate(async () => {
      await extractImagesInBackground(entries, batchId);
    });

    return NextResponse.json({
      message: `Background image extraction started for ${entries.length} entries`,
      batchId,
      started: true
    });

  } catch (error) {
    console.error('❌ Background image extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to start background extraction' },
      { status: 500 }
    );
  }
}

/**
 * Background image extraction function
 */
async function extractImagesInBackground(entries: any[], batchId?: string) {
  let processed = 0;
  let failed = 0;

  console.log(`🔄 [BATCH] Processing ${entries.length} entries for image extraction in order:`);
  console.log(`🔍 Batch extraction order:`, entries.map((e, i) => `${i + 1}. ${e.spyTitle || e.id}`).join(', '));

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    try {
      // Only process entries with article URLs and no existing image
      if (!entry.spyArticleUrl || entry.spyImageUrl) {
        continue;
      }

      console.log(`🖼️ [BATCH] Extracting image ${i + 1}/${entries.length}: ${entry.spyTitle || entry.id}`);

      // Call the image extraction API (use relative path for server-side calls)
      const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
      const extractResponse = await fetch(`${baseUrl}/api/admin/pinterest-spy/extract-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: entry.spyArticleUrl,
          title: entry.spyTitle,
          entryId: entry.id,
          autoSave: true  // Save directly to database
        })
      });

      if (extractResponse.ok) {
        const extractResult = await extractResponse.json();
        
        if (extractResult.imageUrl) {
          processed++;
          console.log(`✅ Successfully extracted image for: ${entry.spyTitle || entry.id}`);
        } else {
          failed++;
          console.log(`❌ No image found for: ${entry.spyTitle || entry.id}`);
        }
      } else {
        failed++;
        console.log(`❌ Extraction API failed for: ${entry.spyTitle || entry.id}`);
      }

      // Small delay between extractions to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      console.error(`❌ Image extraction failed for ${entry.spyTitle || entry.id}:`, error);
      failed++;
    }
  }

  console.log(`🏁 Background image extraction completed: ${processed} successful, ${failed} failed`);
  
  // Update batch status in database if needed
  if (batchId) {
    try {
      // You could add a batch tracking table here if needed
      console.log(`📊 Batch ${batchId} completed: ${processed}/${processed + failed} images extracted`);
    } catch (error) {
      console.error('Failed to update batch status:', error);
    }
  }
}