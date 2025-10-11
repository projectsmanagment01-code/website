/**
 * Author Stats API Route - Admin Only
 * 
 * GET /api/admin/authors/stats - Get author statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthorStats } from '@/lib/author-service';

export async function GET(request: NextRequest) {
  try {
    const stats = await getAuthorStats();
    return NextResponse.json(stats);

  } catch (error) {
    console.error('❌ Error in GET /api/admin/authors/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}