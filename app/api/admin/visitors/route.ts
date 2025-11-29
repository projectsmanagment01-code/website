import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

// Helper functions for analytics
function getSourceType(referrer: string, currentHost: string): string {
  if (!referrer) return 'direct';
  
  try {
    const refUrl = new URL(referrer);
    if (refUrl.hostname.includes(currentHost)) return 'internal';
    
    const socialDomains = ['facebook.com', 'twitter.com', 't.co', 'instagram.com', 'pinterest.com', 'linkedin.com', 'reddit.com', 'tiktok.com'];
    if (socialDomains.some(d => refUrl.hostname.includes(d))) return 'social';
    
    const searchDomains = ['google.', 'bing.com', 'yahoo.com', 'duckduckgo.com', 'baidu.com', 'yandex.com'];
    if (searchDomains.some(d => refUrl.hostname.includes(d))) return 'organic';
    
    return 'referral';
  } catch {
    return 'direct';
  }
}

function getDeviceType(ua: string): string {
  ua = ua.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
  return 'desktop';
}

function getBrowser(ua: string): string {
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Trident')) return 'Internet Explorer';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Unknown';
}

function getOS(ua: string): string {
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
}

// POST - Track visitor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, country, city, latitude, longitude, userAgent, referrer, sessionId } = body;

    // Get IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const host = request.headers.get('host') || '';

    // Parse analytics data
    const sourceType = getSourceType(referrer, host);
    const deviceType = getDeviceType(userAgent || '');
    const browser = getBrowser(userAgent || '');
    const os = getOS(userAgent || '');

    // Store visitor data using Prisma (handles column mapping automatically)
    let visitId = '';
    
    await executeWithRetry(
      async () => {
        try {
          // @ts-ignore - Ignore type errors until Prisma client is regenerated
          const visitor = await prisma.analyticsVisitor.create({
            data: {
              ip,
              country: country || 'Unknown',
              city: city || 'Unknown',
              latitude: latitude || 0,
              longitude: longitude || 0,
              userAgent: userAgent || 'Unknown',
              page,
              visitedAt: new Date(),
              // New fields
              referrer: referrer || null,
              sourceType,
              deviceType,
              browser,
              os,
              sessionId: sessionId || null,
            },
          });
          visitId = visitor.id;
        } catch (error: any) {
          // Ignore unique constraint violations (visitor already tracked today)
          if (!error.code || error.code !== 'P2002') {
            throw error;
          }
        }
      },
      { maxRetries: 3, retryDelay: 1000, operationName: 'trackVisitor' }
    );

    return NextResponse.json({ success: true, id: visitId });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// PUT - Update visitor duration (Heartbeat)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, duration, scrollDepth } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
    }

    await executeWithRetry(
      async () => {
        const updateData: any = {};
        if (typeof duration === 'number') updateData.duration = duration;
        if (typeof scrollDepth === 'number') updateData.scrollDepth = scrollDepth;

        if (Object.keys(updateData).length > 0) {
          await prisma.analyticsVisitor.update({
            where: { id },
            data: updateData,
          });
        }
      },
      { maxRetries: 3, retryDelay: 1000, operationName: 'updateVisitorDuration' }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    // console.error('Error updating visitor duration:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// GET - Get visitor statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    const startDate = new Date();
    switch (range) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate.setTime(0);
        break;
      case '30d':
      default:
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    // Get all visitors from selected range using Prisma
    const visitors = await executeWithRetry(
      async () => await prisma.analyticsVisitor.findMany({
        where: {
          visitedAt: {
            gte: startDate,
          },
        },
        select: {
          ip: true,
          country: true,
          city: true,
          latitude: true,
          longitude: true,
          visitedAt: true,
        },
      }),
      { maxRetries: 3, retryDelay: 1000, operationName: 'getVisitors' }
    );

    // Calculate statistics in JavaScript
    const uniqueIPs = new Set(visitors.map(v => v.ip));
    const totalVisitors = uniqueIPs.size;

    // Count by country
    const countryMap = new Map<string, Set<string>>();
    visitors.forEach(v => {
      if (!countryMap.has(v.country)) {
        countryMap.set(v.country, new Set());
      }
      countryMap.get(v.country)!.add(v.ip);
    });

    const visitorsByCountry = Array.from(countryMap.entries())
      .map(([country, ips]) => ({
        country,
        visitors: ips.size,
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 20);

    // Count by day
    const dayMap = new Map<string, Set<string>>();
    visitors.forEach(v => {
      const day = v.visitedAt.toISOString().split('T')[0];
      if (!dayMap.has(day)) {
        dayMap.set(day, new Set());
      }
      dayMap.get(day)!.add(v.ip);
    });

    const dailyVisitors = Array.from(dayMap.entries())
      .map(([date, ips]) => ({
        date,
        visitors: ips.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get unique visitor locations (for world map)
    const locationMap = new Map<string, { latitude: number; longitude: number; country: string; city: string }>();
    visitors.forEach(v => {
      if (v.latitude !== 0 || v.longitude !== 0) {
        const key = `${v.latitude},${v.longitude}`;
        if (!locationMap.has(key)) {
          locationMap.set(key, {
            latitude: v.latitude,
            longitude: v.longitude,
            country: v.country,
            city: v.city,
          });
        }
      }
    });

    const visitorLocations = Array.from(locationMap.values());

    return NextResponse.json({
      totalVisitors,
      visitorsByCountry,
      dailyVisitors,
      visitorLocations,
    });
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitor stats' },
      { status: 500 }
    );
  }
}
