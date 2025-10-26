import { NextRequest, NextResponse } from 'next/server';
import { 
  recordImpression, 
  recordClick,
  getAdStatistics 
} from '@/lib/ad-service';

// POST - Record impression or click
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action } = body; // 'impression' or 'click'

    if (action === 'impression') {
      await recordImpression(params.id);
      return NextResponse.json({ success: true });
    } else if (action === 'click') {
      await recordClick(params.id);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error recording analytics:', error);
    return NextResponse.json(
      { error: 'Failed to record analytics' },
      { status: 500 }
    );
  }
}

// GET - Get ad statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stats = await getAdStatistics(params.id);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching ad statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
