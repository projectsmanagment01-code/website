import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { 
  getAllAds, 
  createAd, 
  getAdStatistics 
} from '@/lib/ad-service';

// GET - List all ads (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ads = await getAllAds();
    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    );
  }
}

// POST - Create new ad (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, placement, content, imageUrl, linkUrl, width, height, priority, isActive, startDate, endDate } = body;

    // Validation
    if (!name || !type || !placement) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, placement' },
        { status: 400 }
      );
    }

    // Validate based on type
    if (type === 'IMAGE' && !imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required for image ads' },
        { status: 400 }
      );
    }

    if ((type === 'GOOGLE_ADSENSE' || type === 'CUSTOM_HTML') && !content) {
      return NextResponse.json(
        { error: 'Content is required for AdSense and Custom HTML ads' },
        { status: 400 }
      );
    }

    const createdBy = authResult.payload?.email || 'admin';
    const ad = await createAd({
      name,
      type,
      placement,
      content: content || '',
      imageUrl,
      linkUrl,
      width,
      height,
      priority: priority || 0,
      isActive: isActive !== undefined ? isActive : true,
      startDate,
      endDate,
    }, createdBy);

    return NextResponse.json({ 
      success: true, 
      ad 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { error: 'Failed to create ad' },
      { status: 500 }
    );
  }
}
