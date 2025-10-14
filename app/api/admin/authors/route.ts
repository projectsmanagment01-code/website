/**
 * Author API Routes - Admin Only
 * 
 * GET  /api/admin/authors - List all authors with pagination
 * GET  /api/admin/authors?tag=Seafood - Filter authors by tag
 * POST /api/admin/authors - Create new author
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthor, getAuthors, searchAuthors } from '@/lib/author-service';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Check authentication (supports both JWT and API tokens)
  const authCheck = await checkHybridAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    // Handle tag filter
    if (tag) {
      try {
        // Get all authors and filter by tag in JavaScript
        // This is a workaround until Prisma types are regenerated
        const allAuthors = await prisma.$queryRaw`
          SELECT 
            a.id,
            a.name,
            a.bio,
            a.img,
            a.avatar,
            a.slug,
            a.link,
            a.tags,
            a."createdAt",
            a."updatedAt",
            COUNT(r.id)::int as "recipeCount"
          FROM authors a
          LEFT JOIN recipes r ON r."authorId" = a.id
          GROUP BY a.id, a.name, a.bio, a.img, a.avatar, a.slug, a.link, a.tags, a."createdAt", a."updatedAt"
          ORDER BY a."createdAt" DESC
        ` as any[];

        // Filter by tag in JavaScript
        const filteredAuthors = allAuthors.filter((author: any) => 
          author.tags && Array.isArray(author.tags) && author.tags.includes(tag)
        ).slice(0, limit);

        const authorsWithCount = filteredAuthors.map((author: any) => ({
          id: author.id,
          name: author.name,
          bio: author.bio || undefined,
          img: author.img || undefined,
          avatar: author.avatar || undefined,
          slug: author.slug,
          link: author.link || undefined,
          tags: author.tags || [],
          createdAt: new Date(author.createdAt),
          updatedAt: new Date(author.updatedAt),
          recipeCount: author.recipeCount
        }));

        return NextResponse.json({
          authors: authorsWithCount,
          total: authorsWithCount.length,
          currentPage: 1,
          totalPages: 1,
          tag
        });
      } catch (tagError) {
        console.error('❌ Error filtering authors by tag:', tagError);
        return NextResponse.json(
          { error: 'Failed to filter authors by tag', details: tagError instanceof Error ? tagError.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

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
  // Check authentication (supports both JWT and API tokens)
  const authCheck = await checkHybridAuthOrRespond(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const { name, bio, img, avatar, link, tags } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Validate tags if provided
    if (tags && !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'tags must be an array' },
        { status: 400 }
      );
    }

    // Create author
    const author = await createAuthor({
      name,
      bio,
      img,
      avatar,
      link,
      tags: tags || []
    });

    console.log(`✅ Author created: ${author.name} (ID: ${author.id}) with ${author.tags?.length || 0} tags`);

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