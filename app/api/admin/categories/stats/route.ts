/**
 * Category Statistics API - Admin Only
 * 
 * GET /api/admin/categories/stats - Get category statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
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
    
    return jsonResponseNoCache(stats);

  } catch (error) {
    console.error('❌ Error in GET /api/admin/categories/stats:', error);
    return errorResponseNoCache('Internal server error', 500);
  }
}