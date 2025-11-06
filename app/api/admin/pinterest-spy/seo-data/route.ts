/**
 * API Route: Get SEO Processed Data
 * GET /api/admin/pinterest-spy/seo-data
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/api-auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Skip auth in development
    const isDev = process.env.NODE_ENV === 'development' || process.env.SKIP_AUTH === 'true';
    if (!isDev) {
      const authResult = await verifyAuth(req);
      if (!authResult) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Fetch all Pinterest spy data with SEO information
    const entries = await prisma.pinterestSpyData.findMany({
      select: {
        id: true,
        spyTitle: true,
        spyDescription: true,
        seoTitle: true,
        seoDescription: true,
        seoKeyword: true,
        seoCategory: true,
        status: true,
        createdAt: true,
        seoProcessedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      entries
    });

  } catch (error) {
    console.error('❌ Error fetching SEO data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
