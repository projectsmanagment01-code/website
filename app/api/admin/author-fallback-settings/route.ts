import { NextRequest, NextResponse } from 'next/server';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/author-fallback-settings
 * Get current system settings for author fallback
 */
export async function GET(request: NextRequest) {
  const authResponse = await checkHybridAuthOrRespond(request);
  if (authResponse) return authResponse;

  try {
    const settings = await prisma.systemSettings.findFirst({
      include: {
        globalFallbackAuthor: true
      }
    });

    // If no settings exist, create defaults
    if (!settings) {
      const defaultSettings = await prisma.systemSettings.create({
        data: {
          id: 'default',
          autoAssignAuthors: true,
          autoReassignOnDelete: true
        },
        include: {
          globalFallbackAuthor: true
        }
      });

      return NextResponse.json({ settings: defaultSettings });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching author fallback settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/author-fallback-settings
 * Update system settings for author fallback
 */
export async function POST(request: NextRequest) {
  const authResponse = await checkHybridAuthOrRespond(request);
  if (authResponse) return authResponse;

  try {
    const body = await request.json();
    const { globalFallbackAuthorId, autoAssignAuthors, autoReassignOnDelete } = body;

    // Validate fallback author exists if provided
    if (globalFallbackAuthorId) {
      const authorExists = await prisma.author.findUnique({
        where: { id: globalFallbackAuthorId }
      });

      if (!authorExists) {
        return NextResponse.json(
          { error: 'Selected fallback author does not exist' },
          { status: 400 }
        );
      }
    }

    // Upsert settings
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {
        globalFallbackAuthorId: globalFallbackAuthorId || null,
        autoAssignAuthors: autoAssignAuthors ?? true,
        autoReassignOnDelete: autoReassignOnDelete ?? true
      },
      create: {
        id: 'default',
        globalFallbackAuthorId: globalFallbackAuthorId || null,
        autoAssignAuthors: autoAssignAuthors ?? true,
        autoReassignOnDelete: autoReassignOnDelete ?? true
      },
      include: {
        globalFallbackAuthor: true
      }
    });

    // Clear cache
    const { clearAuthorResolverCache } = await import('@/lib/author-resolver');
    clearAuthorResolverCache();

    return NextResponse.json({ 
      success: true, 
      settings 
    });
  } catch (error) {
    console.error('Error updating author fallback settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
