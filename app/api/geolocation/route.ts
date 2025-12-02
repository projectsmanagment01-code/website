import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '8.8.8.8';

    // Fetch geolocation from ipapi.co server-side (no CORS issues)
    const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!geoResponse.ok) {
      return NextResponse.json({ country: 'Unknown', city: 'Unknown' });
    }

    const geoData = await geoResponse.json();
    
    const response = NextResponse.json({
      country: geoData.country_name || 'Unknown',
      city: geoData.city || 'Unknown',
      countryCode: geoData.country_code || 'XX',
      latitude: geoData.latitude || 0,
      longitude: geoData.longitude || 0,
    });

    // Prevent any caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Geolocation error:', error);
    return NextResponse.json({ country: 'Unknown', city: 'Unknown' });
  }
}
