import { NextRequest, NextResponse } from 'next/server';
import { getAuthorByCategory } from '@/lib/author-category-helper';

/**
 * GET /api/admin/authors/by-category?categoryId=xxx
 * Get recommended author for a category
 * Priority: 1) Tagged authors, 2) Authors with recipes in category, 3) Most active author
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required. Use ?categoryId=xxx' },
        { status: 400 }
      );
    }

    const result = await getAuthorByCategory(categoryId);

    if (!result.author) {
      return NextResponse.json(
        { 
          error: result.message || 'No authors available',
          matchMethod: result.matchMethod
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      authorId: result.author.id,
      author: {
        id: result.author.id,
        name: result.author.name,
        slug: result.author.slug,
        bio: result.author.bio,
        img: result.author.img,
        avatar: result.author.avatar,
        link: result.author.link,
        tags: result.author.tags,
        totalRecipes: result.author._count.recipes
      },
      matchMethod: result.matchMethod,
      message: result.message
    });

  } catch (error) {
    console.error('Error in by-category API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
