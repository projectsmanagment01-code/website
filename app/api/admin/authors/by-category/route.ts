import { NextRequest, NextResponse } from 'next/server';
import { checkHybridAuthOrRespond } from '@/lib/auth-standard';
import { getAuthorByCategory } from '@/lib/author-category-helper';
import { jsonResponseNoCache, errorResponseNoCache } from '@/lib/api-response-helpers';

// Disable caching completely
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/authors/by-category?categoryId=xxx
 * Get recommended author for a category
 * Priority: 1) Tagged authors, 2) Authors with recipes in category, 3) Most active author
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return errorResponseNoCache('Category ID is required. Use ?categoryId=xxx', 400);
    }

    const result = await getAuthorByCategory(categoryId);

    if (!result.author) {
      return jsonResponseNoCache({ 
        error: result.message || 'No authors available',
        matchMethod: result.matchMethod
      }, 404);
    }

    return jsonResponseNoCache({
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
    return errorResponseNoCache('Internal server error', 500);
  }
}
