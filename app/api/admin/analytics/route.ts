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
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '24h': startDate.setHours(now.getHours() - 24); break;
      case '7d': startDate.setDate(now.getDate() - 7); break;
      case '90d': startDate.setDate(now.getDate() - 90); break;
      case 'all': startDate.setTime(0); break;
      case '30d': default: startDate.setDate(now.getDate() - 30); break;
    }

    // Fetch all analytics data in parallel
    const [
      totalRecipes,
      publishedRecipes,
      draftRecipes,
      periodViews,
      totalSubscribers,
      activeSubscribers,
      periodSubscribers,
      topRecipes,
      recentRecipes,
      categoryStats,
      visitorsInPeriod,
      subscribersInPeriod,
      trafficSourcesRaw,
      deviceStatsRaw,
      browserStatsRaw,
      activeUsersRaw,
      topSearchQueriesRaw,
      recentActivityRaw,
      avgEngagementRaw,
      conversionEventsRaw,
    ] = await Promise.all([
      // Total recipes
      executeWithRetry(async () => await prisma.recipe.count(), { operationName: 'countRecipes' }),
      // Published recipes
      executeWithRetry(async () => await prisma.recipe.count({ where: { status: 'published' } }), { operationName: 'countPublished' }),
      // Draft recipes
      executeWithRetry(async () => await prisma.recipe.count({ where: { status: 'draft' } }), { operationName: 'countDrafts' }),
      // Period Views (from AnalyticsVisitor)
      executeWithRetry(
        async () => await prisma.analyticsVisitor.count({
          where: { visitedAt: { gte: startDate } }
        }),
        { operationName: 'countPeriodViews' }
      ),
      // Total subscribers
      executeWithRetry(async () => await prisma.subscriber.count(), { operationName: 'countSubscribers' }),
      // Active subscribers
      executeWithRetry(async () => await prisma.subscriber.count({ where: { status: 'active' } }), { operationName: 'countActiveSubscribers' }),
      // Period Subscribers
      executeWithRetry(
        async () => await prisma.subscriber.count({
          where: { subscribedAt: { gte: startDate } }
        }),
        { operationName: 'countPeriodSubscribers' }
      ),
      // Top 10 recipes (Calculated from AnalyticsVisitor for the period)
      executeWithRetry(
        async () => {
          // 1. Get top pages from analytics for the period
          const topPages = await prisma.analyticsVisitor.groupBy({
            by: ['page'],
            where: {
              visitedAt: { gte: startDate },
              page: { startsWith: '/recipes/' }
            },
            _count: {
              page: true
            },
            orderBy: {
              _count: {
                page: 'desc'
              }
            },
            take: 10
          });

          // 2. Extract slugs
          const slugs = topPages.map(p => p.page.split('/').pop() || '').filter(s => s);

          // 3. Fetch recipe details
          const recipes = await prisma.recipe.findMany({
            where: {
              slug: { in: slugs }
            },
            select: {
              id: true, title: true, slug: true, category: true, views: true, img: true, heroImage: true, lastViewedAt: true,
            }
          });

          // 4. Merge and sort
          return topPages.map(p => {
            const slug = p.page.split('/').pop();
            const recipe = recipes.find(r => r.slug === slug);
            if (!recipe) return null;
            return {
              ...recipe,
              views: p._count.page // Override total views with period views
            };
          }).filter(Boolean);
        },
        { operationName: 'getTopRecipes' }
      ),
      // Recent recipes
      executeWithRetry(
        async () => await prisma.recipe.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true, title: true, slug: true, category: true, status: true, createdAt: true, views: true,
          },
        }),
        { operationName: 'getRecentRecipes' }
      ),
      // Category stats
      executeWithRetry(
        async () => await prisma.recipe.groupBy({
          by: ['category'],
          where: { 
            status: 'published',
            category: { not: '' }
          },
          _count: { category: true },
          orderBy: { _count: { category: 'desc' } },
        }),
        { operationName: 'getCategoryStats' }
      ),
      // Visitors for trend and session analysis
      executeWithRetry(
        async () => await prisma.analyticsVisitor.findMany({
          where: { visitedAt: { gte: startDate } },
          orderBy: { visitedAt: 'asc' },
          select: { 
            visitedAt: true,
            sessionId: true,
            page: true,
            sourceType: true,
            deviceType: true,
            browser: true,
            duration: true
          },
        }),
        { operationName: 'getVisitorTrend' }
      ),
      // Subscribers for trend
      executeWithRetry(
        async () => await prisma.subscriber.findMany({
          where: { subscribedAt: { gte: startDate } },
          select: { subscribedAt: true },
        }),
        { operationName: 'getSubscriberTrend' }
      ),
      // Traffic Sources
      executeWithRetry(
        async () => await prisma.analyticsVisitor.groupBy({
          by: ['sourceType'],
          where: { visitedAt: { gte: startDate } },
          _count: { sourceType: true },
          orderBy: { _count: { sourceType: 'desc' } },
        }),
        { operationName: 'getTrafficSources' }
      ),
      // Device Stats
      executeWithRetry(
        async () => await prisma.analyticsVisitor.groupBy({
          by: ['deviceType'],
          where: { visitedAt: { gte: startDate } },
          _count: { deviceType: true },
          orderBy: { _count: { deviceType: 'desc' } },
        }),
        { operationName: 'getDeviceStats' }
      ),
      // Browser Stats
      executeWithRetry(
        async () => await prisma.analyticsVisitor.groupBy({
          by: ['browser'],
          where: { visitedAt: { gte: startDate } },
          _count: { browser: true },
          orderBy: { _count: { browser: 'desc' } },
        }),
        { operationName: 'getBrowserStats' }
      ),
      // Active Users (Last 5 minutes)
      executeWithRetry(
        async () => await prisma.analyticsVisitor.count({
          where: { 
            visitedAt: { 
              gte: new Date(Date.now() - 5 * 60 * 1000) 
            } 
          }
        }),
        { operationName: 'getActiveUsers' }
      ),
      // Top Search Queries
      executeWithRetry(
        async () => {
          // @ts-ignore
          if (!prisma.searchQuery) return [];
          
          return await prisma.searchQuery.groupBy({
            by: ['query'],
            _count: { query: true },
            orderBy: { _count: { query: 'desc' } },
            take: 10,
            where: { searchedAt: { gte: startDate } }
          });
        },
        { operationName: 'getTopSearchQueries' }
      ),
      // Recent Activity (Live Feed)
      executeWithRetry(
        async () => await prisma.analyticsVisitor.findMany({
          take: 10,
          orderBy: { visitedAt: 'desc' },
          select: {
            country: true,
            city: true,
            page: true,
            visitedAt: true,
            deviceType: true
          }
        }),
        { operationName: 'getRecentActivity' }
      ),
      // Avg Engagement
      executeWithRetry(
        async () => await prisma.analyticsVisitor.aggregate({
          _avg: {
            duration: true,
            scrollDepth: true
          },
          where: { visitedAt: { gte: startDate } }
        }),
        { operationName: 'getAvgEngagement' }
      ),
      // Conversion Events
      executeWithRetry(
        async () => {
          // @ts-ignore
          if (!prisma.conversionEvent) return [];
          return await prisma.conversionEvent.groupBy({
            by: ['eventType'],
            _count: { eventType: true },
            where: { createdAt: { gte: startDate } }
          });
        },
        { operationName: 'getConversionEvents' }
      ),
    ]);

    // Calculate average views per day
    const daysDiff = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgViews = Math.round(periodViews / daysDiff);

    // Calculate subscriber growth rate
    const subscriberGrowthRate = totalSubscribers > 0 
      ? Math.round((periodSubscribers / totalSubscribers) * 100) 
      : 0;

    // Process trends
    const isHourly = range === '24h';
    
    // Helper to format date key
    const getKey = (date: Date) => {
      if (isHourly) {
        return `${date.getHours()}:00`;
      }
      return date.toISOString().split('T')[0];
    };

    // Initialize map
    const trendMap = new Map<string, { views: number; subscribers: number }>();
    
    // Fill with data
    visitorsInPeriod.forEach(v => {
      const key = getKey(new Date(v.visitedAt));
      const curr = trendMap.get(key) || { views: 0, subscribers: 0 };
      curr.views++;
      trendMap.set(key, curr);
    });

    subscribersInPeriod.forEach(s => {
      const key = getKey(new Date(s.subscribedAt));
      const curr = trendMap.get(key) || { views: 0, subscribers: 0 };
      curr.subscribers++;
      trendMap.set(key, curr);
    });

    // Convert to array (simplified for now, ideally should fill gaps)
    const viewsTrend = Array.from(trendMap.values()).map(v => v.views);
    const subscribersTrend = Array.from(trendMap.values()).map(v => v.subscribers);

    // @ts-ignore - Types will be fixed after regeneration
    const trafficSources = visitorsInPeriod.length > 0 ? trafficSourcesRaw.map(t => ({
      source: t.sourceType || 'direct',
      count: t._count.sourceType,
      percentage: Math.round((t._count.sourceType / visitorsInPeriod.length) * 100)
    })) : [];

    // @ts-ignore
    const deviceStats = visitorsInPeriod.length > 0 ? deviceStatsRaw.map(d => ({
      device: d.deviceType || 'unknown',
      count: d._count.deviceType,
      percentage: Math.round((d._count.deviceType / visitorsInPeriod.length) * 100)
    })) : [];

    // @ts-ignore
    const browserStats = visitorsInPeriod.length > 0 ? browserStatsRaw.map(b => ({
      browser: b.browser || 'unknown',
      count: b._count.browser,
      percentage: Math.round((b._count.browser / visitorsInPeriod.length) * 100)
    })) : [];

    // @ts-ignore
    const activeUsers = activeUsersRaw || 0;

    // Calculate Session Metrics (Bounce Rate & Exit Pages)
    // @ts-ignore
    const sessions = new Map<string, { pages: string[] }>();
    
    visitorsInPeriod.forEach(v => {
      // @ts-ignore
      if (!v.sessionId) return;
      // @ts-ignore
      if (!sessions.has(v.sessionId)) {
        // @ts-ignore
        sessions.set(v.sessionId, { pages: [] });
      }
      // @ts-ignore
      sessions.get(v.sessionId)!.pages.push(v.page);
    });

    const totalSessions = sessions.size;
    let singlePageSessions = 0;
    const exitPageCounts = new Map<string, number>();

    sessions.forEach(session => {
      if (session.pages.length === 1) singlePageSessions++;
      const exitPage = session.pages[session.pages.length - 1]; 
      exitPageCounts.set(exitPage, (exitPageCounts.get(exitPage) || 0) + 1);
    });

    const bounceRate = totalSessions > 0 ? Math.round((singlePageSessions / totalSessions) * 100) : 0;
    
    // @ts-ignore
    const totalDuration = visitorsInPeriod.reduce((acc, v) => acc + (v.duration || 0), 0);
    const avgDuration = visitorsInPeriod.length > 0 ? Math.round(totalDuration / visitorsInPeriod.length) : 0;

    const topExitPages = Array.from(exitPageCounts.entries())
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Heatmap Processing (Day x Hour)
    const heatmapGrid = Array(7).fill(0).map(() => Array(24).fill(0));
    // @ts-ignore
    visitorsInPeriod.forEach(v => {
      const date = new Date(v.visitedAt);
      const day = date.getDay(); // 0-6
      const hour = date.getHours(); // 0-23
      heatmapGrid[day][hour]++;
    });

    return NextResponse.json({
      overview: {
        totalRecipes,
        publishedRecipes,
        draftRecipes,
        totalViews: periodViews,
        avgViews,
        totalSubscribers,
        activeSubscribers,
        recentSubscribers: periodSubscribers,
        subscriberGrowthRate,
        bounceRate,
        totalSessions,
        activeUsers,
        avgDuration,
        avgScrollDepth: Math.round(avgEngagementRaw._avg.scrollDepth || 0),
      },
      topSearchQueries: topSearchQueriesRaw.map((q: any) => ({ query: q.query, count: q._count.query })),
      recentActivity: recentActivityRaw,
      conversions: conversionEventsRaw.map((c: any) => ({ event: c.eventType, count: c._count.eventType })),
      topExitPages,
      topRecipes,
      recentRecipes,
      categoryStats: categoryStats.map(c => ({
        category: c.category,
        count: c._count.category,
        percentage: totalRecipes > 0 ? Math.round((c._count.category / totalRecipes) * 100) : 0,
      })),
      trends: {
        views: viewsTrend,
        subscribers: subscribersTrend,
      },
      trafficSources,
      deviceStats,
      browserStats,
      heatmap: heatmapGrid,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
