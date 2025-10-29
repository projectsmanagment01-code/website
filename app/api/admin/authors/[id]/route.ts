/**
 * Individual Author API Routes - Admin Only
 * 
 * GET    /api/admin/authors/[id] - Get single author
 * PUT    /api/admin/authors/[id] - Update author
 * DELETE /api/admin/authors/[id] - Delete author
 */

import { NextRequest, NextResponse } from 'next/server';
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';
import { getAuthorById, updateAuthor, deleteAuthor } from '@/lib/author-service';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';
import { revalidateAdminPaths } from '@/lib/cache-busting';

// Aggressive cache-busting configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
      return errorResponseNoCache('Author not found', 404);
    }

    return jsonResponseNoCache(author);

  } catch (error) {
    console.error(`❌ Error in GET /api/admin/authors/${params?.id}:`, error);
    return errorResponseNoCache('Internal server error', 500);
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
    const { name, bio, img, avatar, link, tags } = body;

    // Validate tags if provided
    if (tags !== undefined && !Array.isArray(tags)) {
      return errorResponseNoCache('tags must be an array', 400);
    }

    // Update author
    const author = await updateAuthor(id, {
      name,
      bio,
      img,
      avatar,
      link,
      tags
    });

    if (!author) {
      return errorResponseNoCache('Author not found', 404);
    }

    console.log(`✅ Author updated: ${author.name} (ID: ${author.id}) with ${author.tags?.length || 0} tags`);

    // CRITICAL: Revalidate cache after mutation
    await revalidateAdminPaths();

    return jsonResponseNoCache({
      message: 'Author updated successfully',
      author
    });

  } catch (error) {
    console.error(`❌ Error in PUT /api/admin/authors/${params?.id}:`, error);
    
    if (error instanceof Error) {
      return jsonResponseNoCache(
        { error: error.message }, 400);
    }

    return errorResponseNoCache('Internal server error', 500);
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
      return errorResponseNoCache('Author not found', 404);
    }

    console.log(`✅ Author deleted: ID ${id}`);

    // CRITICAL: Revalidate cache after mutation
    await revalidateAdminPaths();

    return jsonResponseNoCache({
      message: 'Author deleted successfully'
    });

  } catch (error) {
    console.error(`❌ Error in DELETE /api/admin/authors/${params?.id}:`, error);
    
    if (error instanceof Error) {
      return jsonResponseNoCache(
        { error: error.message }, 400);
    }

    return errorResponseNoCache('Internal server error', 500);
  }
}