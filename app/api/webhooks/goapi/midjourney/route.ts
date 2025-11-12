/**
 * GoAPI Midjourney Webhook Endpoint
 * Receives completed images from Midjourney via GoAPI
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MidjourneyImageProvider } from '@/automation/image-providers/midjourney/service';
import { downloadMultipleImages } from '@/automation/image-providers/midjourney/download';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Parse webhook data (no authentication needed - GoAPI validates on their end)
    const webhookData = await request.json();
    console.log('Received Midjourney webhook:', JSON.stringify(webhookData, null, 2));

    // Process webhook data
    const processedData = MidjourneyImageProvider.processWebhookData(webhookData);
    
    if (!processedData) {
      console.error('Failed to process webhook data');
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
    }

    const { taskId, imageUrls, status } = processedData;

    if (status !== 'completed' || !imageUrls || imageUrls.length === 0) {
      console.log(`Task ${taskId} status: ${status}, no images yet`);
      return NextResponse.json({ 
        message: 'Webhook received but no images available yet',
        taskId,
        status 
      });
    }

    // Find the Pinterest spy record with this task ID
    // Note: You'll need to store the task ID when creating the Midjourney request
    const spyRecord = await prisma.pinterestSpyData.findFirst({
      where: {
        midjourneyTaskId: taskId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!spyRecord) {
      console.error(`No record found for task ID: ${taskId}`);
      return NextResponse.json({ 
        error: 'Record not found',
        taskId 
      }, { status: 404 });
    }

    // Download all 4 images
    const baseFilename = `${spyRecord.id}-${spyRecord.seoTitle?.replace(/\s+/g, '-').toLowerCase() || 'recipe'}`;
    const downloadResults = await downloadMultipleImages(imageUrls, baseFilename);

    // Check if all downloads succeeded
    const failedDownloads = downloadResults.filter(r => !r.success);
    if (failedDownloads.length > 0) {
      console.error('Some image downloads failed:', failedDownloads);
    }

    // Update the record with downloaded image paths
    const successfulPaths = downloadResults
      .filter(r => r.success && r.localPath)
      .map(r => r.localPath!);

    if (successfulPaths.length > 0) {
      await prisma.pinterestSpyData.update({
        where: { id: spyRecord.id },
        data: {
          generatedImages: successfulPaths,
          imageGeneratedAt: new Date(),
          lastSuccessfulStep: 'images' // Update checkpoint
        }
      });

      console.log(`Successfully processed ${successfulPaths.length} images for record ${spyRecord.id}`);
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${successfulPaths.length} images`,
      taskId,
      images: successfulPaths
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'GoAPI Midjourney webhook endpoint',
    status: 'active'
  });
}
