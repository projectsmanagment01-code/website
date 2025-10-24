import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/internal-links/suggestions
 * Get all link suggestions with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const recipeId = searchParams.get('recipeId');
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build where clause
    const where: any = {};
    
    if (recipeId) {
      where.sourceRecipeId = recipeId;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Get suggestions with recipe details
    const suggestions = await prisma.internalLinkSuggestion.findMany({
      where,
      include: {
        sourceRecipe: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        },
        targetRecipe: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        }
      },
      orderBy: [
        { relevanceScore: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset,
    });
    
    // Get total count
    const total = await prisma.internalLinkSuggestion.count({ where });
    
    // Format response
    const formatted = suggestions.map(s => ({
      id: s.id,
      sourceRecipe: {
        id: s.sourceRecipe.id,
        title: s.sourceRecipe.title,
        slug: s.sourceRecipe.slug,
      },
      targetRecipe: {
        id: s.targetRecipe.id,
        title: s.targetRecipe.title,
        slug: s.targetRecipe.slug,
      },
      anchorText: s.anchorText,
      fieldName: s.fieldName,
      position: s.position,
      relevanceScore: s.relevanceScore,
      context: s.context,
      status: s.status,
      createdAt: s.createdAt,
      appliedAt: s.appliedAt,
    }));
    
    return NextResponse.json({
      success: true,
      suggestions: formatted,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/internal-links/suggestions
 * Update suggestion status
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { suggestionId, status } = body;
    
    if (!suggestionId || !status) {
      return NextResponse.json(
        { error: 'suggestionId and status are required' },
        { status: 400 }
      );
    }
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Update the suggestion
    const updated = await prisma.internalLinkSuggestion.update({
      where: { id: suggestionId },
      data: {
        status,
        ...(status === 'rejected' ? { rejectedAt: new Date() } : {}),
      },
      include: {
        sourceRecipe: {
          select: { title: true, slug: true }
        },
        targetRecipe: {
          select: { title: true, slug: true }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      suggestion: updated,
    });
    
  } catch (error: any) {
    console.error('Error updating suggestion:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update suggestion' },
      { status: 500 }
    );
  }
}
