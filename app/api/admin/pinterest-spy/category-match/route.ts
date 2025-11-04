/**
 * API Route: Get Category Match Preview
 * POST /api/admin/pinterest-spy/category-match
 * 
 * Returns the best matching category and author suggestions for a recipe
 */

import { NextRequest, NextResponse } from 'next/server';
import { CategoryMatcher } from '@/automation/recipe-generation/category-matcher';
import { verifyAuth } from '@/lib/api-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { spyEntryId } = body;

    if (!spyEntryId) {
      return NextResponse.json(
        { error: 'Missing spyEntryId' },
        { status: 400 }
      );
    }

    // Fetch the spy entry
    const spyEntry = await prisma.pinterestSpyData.findUnique({
      where: { id: spyEntryId }
    });

    if (!spyEntry) {
      return NextResponse.json(
        { error: 'Spy entry not found' },
        { status: 404 }
      );
    }

    // Find best matching category
    const categoryMatch = await CategoryMatcher.findBestCategory({
      title: spyEntry.seoTitle || '',
      description: spyEntry.seoDescription || '',
      keyword: spyEntry.seoKeyword || '',
      category: spyEntry.seoCategory || ''
    });

    if (!categoryMatch) {
      return NextResponse.json({
        success: true,
        categoryMatch: null,
        suggestedAuthors: [],
        message: 'No matching category found'
      });
    }

    // Get suggested authors for this category
    const suggestedAuthors = await CategoryMatcher.getSuggestedAuthorsForCategory(
      categoryMatch.categoryId
    );

    return NextResponse.json({
      success: true,
      categoryMatch: {
        id: categoryMatch.categoryId,
        name: categoryMatch.categoryName,
        slug: categoryMatch.categorySlug,
        confidence: categoryMatch.confidence,
        matchReasons: categoryMatch.matchReasons
      },
      suggestedAuthors: suggestedAuthors.map(author => ({
        id: author.id,
        name: author.name,
        matchingTags: author.matchingTags,
        confidence: author.matchingTags.length * 20 // Simple confidence score
      }))
    });

  } catch (error) {
    console.error('❌ Category match error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
