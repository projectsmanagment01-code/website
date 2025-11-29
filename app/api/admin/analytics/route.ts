import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';

// GET - Analytics data
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResponse = await checkHybridAuthOrRespond(request);
    if (!authResponse.authorized) return authResponse.response;

    // Get date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch all analytics data in parallel
    const [
      totalRecipes,
      publishedRecipes,
      draftRecipes,
      totalViews,
      totalSubscribers,
      activeSubscribers,
      recentSubscribers,
      topRecipes,
      recentRecipes,
      categoryStats,
      viewsLast30Days,
      subscribersLast30Days,
    ] = await Promise.all([
      // Total recipes
      executeWithRetry(
        async () => await prisma.recipe.count(),
        { maxRetries: 3, retryDelay: 1000, operationName: 'countRecipes' }
      ),
      // Published recipes
      executeWithRetry(
        async () => await prisma.recipe.count({ where: { status: 'published' } }),
        { maxRetries: 3, retryDelay: 1000, operationName: 'countPublished' }
      ),
      // Draft recipes
      executeWithRetry(
        async () => await prisma.recipe.count({ where: { status: 'draft' } }),
        { maxRetries: 3, retryDelay: 1000, operationName: 'countDrafts' }
      ),
      // Total views
      executeWithRetry(
        async () => {
          const result = await prisma.recipe.aggregate({
            _sum: { views: true },
          });
          return result._sum.views || 0;
        },
        { maxRetries: 3, retryDelay: 1000, operationName: 'sumViews' }
      ),
      // Total subscribers
      executeWithRetry(
        async () => await prisma.subscriber.count(),
        { maxRetries: 3, retryDelay: 1000, operationName: 'countSubscribers' }
      ),
      // Active subscribers
      executeWithRetry(
        async () => await prisma.subscriber.count({ where: { status: 'active' } }),
        { maxRetries: 3, retryDelay: 1000, operationName: 'countActiveSubscribers' }
      ),
      // Recent subscribers (last 7 days)
      executeWithRetry(
        async () => await prisma.subscriber.count({
          where: {
            subscribedAt: { gte: sevenDaysAgo },
          },
        }),
        { maxRetries: 3, retryDelay: 1000, operationName: 'countRecentSubscribers' }
      ),
      // Top 10 recipes by views
      executeWithRetry(
        async () => await prisma.recipe.findMany({
          take: 10,
          orderBy: { views: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            views: true,
            img: true,
            heroImage: true,
            lastViewedAt: true,
          },
        }),
        { maxRetries: 3, retryDelay: 1000, operationName: 'getTopRecipes' }
      ),
      // Recent recipes (last 10)
      executeWithRetry(
        async () => await prisma.recipe.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            status: true,
            createdAt: true,
            views: true,
          },
        }),
        { maxRetries: 3, retryDelay: 1000, operationName: 'getRecentRecipes' }
      ),
      // Category distribution
      executeWithRetry(
        async () => await prisma.recipe.groupBy({
          by: ['category'],
          _count: { category: true },
          orderBy: { _count: { category: 'desc' } },
        }),
        { maxRetries: 3, retryDelay: 1000, operationName: 'getCategoryStats' }
      ),
      // Views trend (last 30 days)
      executeWithRetry(
        async () => await prisma.recipe.findMany({
          where: {
            lastViewedAt: { gte: thirtyDaysAgo },
          },
          select: {
            views: true,
            lastViewedAt: true,
          },
        }),
        { maxRetries: 3, retryDelay: 1000, operationName: 'getViewsTrend' }
      ),
      // Subscribers trend (last 30 days)
      executeWithRetry(
        async () => await prisma.subscriber.findMany({
          where: {
            subscribedAt: { gte: thirtyDaysAgo },
          },
          select: {
            subscribedAt: true,
          },
        }),
        { maxRetries: 3, retryDelay: 1000, operationName: 'getSubscribersTrend' }
      ),
    ]);

    // Calculate average views per recipe
    const avgViews = totalRecipes > 0 ? Math.round(totalViews / totalRecipes) : 0;

    // Calculate subscriber growth rate
    const subscriberGrowthRate = totalSubscribers > 0 
      ? Math.round((recentSubscribers / totalSubscribers) * 100) 
      : 0;

    // Group views by day (last 30 days)
    const viewsByDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      date.setHours(0, 0, 0, 0);
      return {
        date: date.toISOString().split('T')[0],
        views: 0,
      };
    });

    // Group subscribers by day (last 30 days)
    const subscribersByDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      date.setHours(0, 0, 0, 0);
      const count = subscribersLast30Days.filter(s => {
        const subDate = new Date(s.subscribedAt);
        subDate.setHours(0, 0, 0, 0);
        return subDate.getTime() === date.getTime();
      }).length;
      return {
        date: date.toISOString().split('T')[0],
        subscribers: count,
      };
    });

    return NextResponse.json({
      overview: {
        totalRecipes,
        publishedRecipes,
        draftRecipes,
        totalViews,
        avgViews,
        totalSubscribers,
        activeSubscribers,
        recentSubscribers,
        subscriberGrowthRate,
      },
      topRecipes,
      recentRecipes,
      categoryStats: categoryStats.map(c => ({
        category: c.category,
        count: c._count.category,
        percentage: totalRecipes > 0 ? Math.round((c._count.category / totalRecipes) * 100) : 0,
      })),
      trends: {
        views: viewsByDay,
        subscribers: subscribersByDay,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
