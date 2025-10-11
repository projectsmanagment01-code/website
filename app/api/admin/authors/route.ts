/**
 * Author API Routes - Admin Only
 * 
 * GET  /api/admin/authors - List all authors with pagination
 * POST /api/admin/authors - Create new author
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthor, getAuthors, searchAuthors } from '@/lib/author-service';
import { checkAuthOrRespond } from '@/lib/auth-standard';

export async function GET(request: NextRequest) {
  // Check authentication
  const authCheck = await checkAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    // Handle search query
    if (search) {
      const authors = await searchAuthors(search, limit);
      return NextResponse.json({
        authors,
        total: authors.length,
        currentPage: 1,
        totalPages: 1
      });
    }

    // Handle pagination
    const result = await getAuthors(page, limit);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error in GET /api/admin/authors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const authCheck = await checkAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const { name, bio, img, avatar, link } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Create author
    const author = await createAuthor({
      name,
      bio,
      img,
      avatar,
      link
    });

    console.log(`✅ Author created: ${author.name} (ID: ${author.id})`);

    return NextResponse.json({
      message: 'Author created successfully',
      author
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error in POST /api/admin/authors:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}