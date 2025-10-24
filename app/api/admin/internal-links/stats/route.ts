import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/internal-links/stats
 * Get statistics about internal linking system
 */
export async function GET() {
  try {
    // Get suggestion counts by status
    const suggestionCounts = await prisma.internalLinkSuggestion.groupBy({
      by: ['status'],
      _count: true,
    });
    
    const countsByStatus: Record<string, number> = {};
    suggestionCounts.forEach(item => {
      countsByStatus[item.status] = item._count;
    });
    
    // Get total suggestions
    const totalSuggestions = await prisma.internalLinkSuggestion.count();
    
    // Get orphan page statistics
    const orphanStats = await prisma.orphanPage.aggregate({
      _count: true,
      _avg: {
        incomingLinks: true,
        outgoingLinks: true,
      },
      where: {
        isOrphan: true,
      }
    });
    
    // Get top recipes with most suggestions
    const topSourceRecipes = await prisma.internalLinkSuggestion.groupBy({
      by: ['sourceRecipeId'],
      _count: true,
      orderBy: {
        _count: {
          sourceRecipeId: 'desc'
        }
      },
      take: 10,
    });
    
    // Get recipe details for top sources
    const sourceRecipeIds = topSourceRecipes.map(r => r.sourceRecipeId);
    const sourceRecipes = await prisma.recipe.findMany({
      where: { id: { in: sourceRecipeIds } },
      select: { id: true, title: true, slug: true }
    });
    
    const topSources = topSourceRecipes.map(item => {
      const recipe = sourceRecipes.find(r => r.id === item.sourceRecipeId);
      return {
        recipeId: item.sourceRecipeId,
        recipeTitle: recipe?.title || 'Unknown',
        recipeSlug: recipe?.slug || '',
        suggestionCount: item._count,
      };
    });
    
    // Get top target recipes (most linked to)
    const topTargetRecipes = await prisma.internalLinkSuggestion.groupBy({
      by: ['targetRecipeId'],
      _count: true,
      where: {
        status: 'applied',
      },
      orderBy: {
        _count: {
          targetRecipeId: 'desc'
        }
      },
      take: 10,
    });
    
    const targetRecipeIds = topTargetRecipes.map(r => r.targetRecipeId);
    const targetRecipes = await prisma.recipe.findMany({
      where: { id: { in: targetRecipeIds } },
      select: { id: true, title: true, slug: true }
    });
    
    const topTargets = topTargetRecipes.map(item => {
      const recipe = targetRecipes.find(r => r.id === item.targetRecipeId);
      return {
        recipeId: item.targetRecipeId,
        recipeTitle: recipe?.title || 'Unknown',
        recipeSlug: recipe?.slug || '',
        linkCount: item._count,
      };
    });
    
    // Get last scan time
    const lastScan = await prisma.orphanPage.findFirst({
      orderBy: { lastChecked: 'desc' },
      select: { lastChecked: true }
    });
    
    // Calculate average relevance score
    const avgRelevanceScore = await prisma.internalLinkSuggestion.aggregate({
      _avg: {
        relevanceScore: true,
      }
    });
    
    return NextResponse.json({
      success: true,
      stats: {
        suggestions: {
          total: totalSuggestions,
          pending: countsByStatus['pending'] || 0,
          approved: countsByStatus['approved'] || 0,
          rejected: countsByStatus['rejected'] || 0,
          applied: countsByStatus['applied'] || 0,
          avgRelevanceScore: avgRelevanceScore._avg.relevanceScore || 0,
        },
        orphans: {
          total: orphanStats._count || 0,
          avgIncomingLinks: orphanStats._avg.incomingLinks || 0,
          avgOutgoingLinks: orphanStats._avg.outgoingLinks || 0,
        },
        topSourceRecipes: topSources,
        topTargetRecipes: topTargets,
        lastScanDate: lastScan?.lastChecked || null,
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
