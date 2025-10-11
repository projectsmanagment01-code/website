/**
 * Individual Author API Routes - Admin Only
 * 
 * GET    /api/admin/authors/[id] - Get single author
 * PUT    /api/admin/authors/[id] - Update author
 * DELETE /api/admin/authors/[id] - Delete author
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthorById, updateAuthor, deleteAuthor } from '@/lib/author-service';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication (supports both JWT and API tokens)
  const authCheck = await checkHybridAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }
  try {
    const { id } = await params;
    const author = await getAuthorById(id);

    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(author);

  } catch (error) {
    console.error(`❌ Error in GET /api/admin/authors/${params?.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication (supports both JWT and API tokens)
  const authCheck = await checkHybridAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, bio, img, avatar, link } = body;

    // Update author
    const author = await updateAuthor(id, {
      name,
      bio,
      img,
      avatar,
      link
    });

    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Author updated: ${author.name} (ID: ${author.id})`);

    return NextResponse.json({
      message: 'Author updated successfully',
      author
    });

  } catch (error) {
    console.error(`❌ Error in PUT /api/admin/authors/${params?.id}:`, error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication (supports both JWT and API tokens)
  const authCheck = await checkHybridAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await params;
    const deleted = await deleteAuthor(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Author deleted: ID ${id}`);

    return NextResponse.json({
      message: 'Author deleted successfully'
    });

  } catch (error) {
    console.error(`❌ Error in DELETE /api/admin/authors/${params?.id}:`, error);
    
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