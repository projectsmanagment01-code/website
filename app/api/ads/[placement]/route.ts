import { NextRequest, NextResponse } from 'next/server';
import { getAdsForPlacement } from '@/lib/ad-service';

// GET - Get ads for a specific placement (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: { placement: string } }
) {
  try {
    const placement = params.placement.toUpperCase();
    
    // Validate placement
    const validPlacements = [
      'RECIPE_SIDEBAR',
      'RECIPE_BELOW_IMAGE',
      'RECIPE_IN_CONTENT',
      'RECIPE_CARD',
      'HERO_BELOW',
      'ARTICLE_SIDEBAR',
      'ARTICLE_IN_CONTENT'
    ];

    if (!validPlacements.includes(placement)) {
      return NextResponse.json(
        { error: 'Invalid placement' },
        { status: 400 }
      );
    }

    const ads = await getAdsForPlacement(placement as any);

    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Error fetching ads for placement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    );
  }
}
