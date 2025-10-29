/**
 * Author Stats API Route - Admin Only
 * 
 * GET /api/admin/authors/stats - Get author statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';
import { getAuthorStats } from '@/lib/author-service';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const stats = await getAuthorStats();
    return jsonResponseNoCache(stats);

  } catch (error) {
    console.error('❌ Error in GET /api/admin/authors/stats:', error);
    return errorResponseNoCache('Internal server error', 500);
  }
}