/**
 * Category Statistics API - Admin Only
 * 
 * GET /api/admin/categories/stats - Get category statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';
import { getCategoryStats } from '@/lib/category-service-new';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const stats = await getCategoryStats();
    
    return NextResponse.json(stats);

  } catch (error) {
    console.error('❌ Error in GET /api/admin/categories/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}