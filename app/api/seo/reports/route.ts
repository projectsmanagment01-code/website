/**
 * API Route: SEO Enhancement Reports
 * GET /api/seo/reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where = status && status !== 'all' ? { status } : {};

    // Fetch reports from database
    const reports = await prisma.sEOEnhancementReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Calculate stats
    const allReports = await prisma.sEOEnhancementReport.findMany();
    const stats = {
      total: allReports.length,
      success: allReports.filter(r => r.status === 'success').length,
      pending: allReports.filter(r => r.status === 'pending').length,
      processing: allReports.filter(r => r.status === 'processing').length,
      failed: allReports.filter(r => r.status === 'failed').length,
      avgScore: allReports.length > 0 
        ? Math.round(allReports.reduce((sum, r) => sum + (r.seoScore || 0), 0) / allReports.length)
        : 0,
      avgEnhancements: allReports.length > 0
        ? Math.round(allReports.reduce((sum, r) => sum + r.enhancementsCount, 0) / allReports.length)
        : 0
    };

    return NextResponse.json({
      success: true,
      reports,
      stats
    });

  } catch (error: any) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Get detailed report for a specific recipe
 * GET /api/seo/reports/[recipeId]
 */
export async function getRecipeReport(recipeId: string) {
  try {
    // Fetch from database
    const report = {
      recipeId,
      // ... report details
    };

    return { success: true, report };
  } catch (error) {
    console.error('Error fetching recipe report:', error);
    return { success: false, error };
  }
}