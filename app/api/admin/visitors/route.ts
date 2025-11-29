import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

// POST - Track visitor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, country, city, latitude, longitude, userAgent } = body;

    // Get IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Store visitor data using Prisma (handles column mapping automatically)
    await executeWithRetry(
      async () => {
        try {
          await prisma.analyticsVisitor.create({
            data: {
              ip,
              country: country || 'Unknown',
              city: city || 'Unknown',
              latitude: latitude || 0,
              longitude: longitude || 0,
              userAgent: userAgent || 'Unknown',
              page,
              visitedAt: new Date(),
            },
          });
        } catch (error: any) {
          // Ignore unique constraint violations (visitor already tracked today)
          if (!error.code || error.code !== 'P2002') {
            throw error;
          }
        }
      },
      { maxRetries: 3, retryDelay: 1000, operationName: 'trackVisitor' }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// GET - Get visitor statistics
export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all visitors from last 30 days using Prisma
    const visitors = await executeWithRetry(
      async () => await prisma.analyticsVisitor.findMany({
        where: {
          visitedAt: {
            gte: thirtyDaysAgo,
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
