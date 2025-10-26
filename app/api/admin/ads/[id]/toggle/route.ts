import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { toggleAdStatus } from '@/lib/ad-service';

// POST - Toggle ad active status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ad = await toggleAdStatus(id);

    return NextResponse.json({ 
      success: true, 
      ad 
    });

  } catch (error) {
    console.error('Error toggling ad status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle ad status' },
      { status: 500 }
    );
  }
}
