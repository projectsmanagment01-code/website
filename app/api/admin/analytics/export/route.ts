import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'visitors';
  const range = searchParams.get('range') || '30d';

  // Calculate date range
  const now = new Date();
  const startDate = new Date();
  
  if (range === '7d') startDate.setDate(now.getDate() - 7);
  else if (range === '30d') startDate.setDate(now.getDate() - 30);
  else if (range === '90d') startDate.setDate(now.getDate() - 90);
  else if (range === 'all') startDate.setTime(0); // Epoch
  else startDate.setDate(now.getDate() - 30); // Default

  let data: any[] = [];
  let csvFields: string[] = [];

  try {
    if (type === 'visitors') {
      data = await prisma.analyticsVisitor.findMany({
        where: { visitedAt: { gte: startDate } },
        orderBy: { visitedAt: 'desc' },
        take: 5000 // Limit to prevent timeout
      });
      csvFields = ['visitedAt', 'page', 'country', 'city', 'deviceType', 'sourceType', 'duration', 'scrollDepth'];
    } else if (type === 'conversions') {
      data = await prisma.conversionEvent.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
        take: 5000
      });
      csvFields = ['createdAt', 'eventType', 'recipeId', 'visitorId', 'meta'];
    } else if (type === 'search') {
      data = await prisma.searchQuery.findMany({
        where: { searchedAt: { gte: startDate } },
        orderBy: { searchedAt: 'desc' },
        take: 5000
      });
      csvFields = ['searchedAt', 'query', 'resultsCount', 'clickedResult'];
    }

    // Convert to CSV
    const csvHeader = csvFields.join(',') + '\n';
    const csvRows = data.map(row => {
      return csvFields.map(field => {
        const val = row[field];
        if (val instanceof Date) return `"${val.toISOString()}"`;
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        return val;
      }).join(',');
    }).join('\n');

    // Ensure we return at least the header if no data
    const csvContent = csvHeader + (csvRows || '');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}-export-${range}.csv"`,
      },
    });

  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
