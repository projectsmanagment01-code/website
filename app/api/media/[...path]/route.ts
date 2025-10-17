import { NextRequest, NextResponse } from 'next/server';

const MEDIA_SERVER_URL = process.env.MEDIA_SERVER_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${MEDIA_SERVER_URL}/api/media/${path}${searchParams ? `?${searchParams}` : ''}`;

    // Forward authorization header
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Media proxy GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media', message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const url = `${MEDIA_SERVER_URL}/api/media/${path}`;

    // Forward authorization header
    const authHeader = request.headers.get('authorization');
    const contentType = request.headers.get('content-type');
    
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Handle both JSON and FormData
    let body: BodyInit | undefined;
    if (contentType?.includes('application/json')) {
      body = JSON.stringify(await request.json());
      headers['Content-Type'] = 'application/json';
    } else {
      // For file uploads, forward FormData directly
      body = await request.arrayBuffer();
      if (contentType) {
        headers['Content-Type'] = contentType;
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Media proxy POST error:', error);
    return NextResponse.json(
      { error: 'Failed to upload media', message: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const url = `${MEDIA_SERVER_URL}/api/media/${path}`;

    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const body = JSON.stringify(await request.json());

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Media proxy PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update media', message: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const url = `${MEDIA_SERVER_URL}/api/media/${path}`;

    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Media proxy DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete media', message: String(error) },
      { status: 500 }
    );
  }
}
