import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/authors/by-category?categoryId=xxx
 * Get recommended author for a category based on most recipes in that category
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

    // Find the author with the most recipes in this category
    const authorWithRecipes = await prisma.recipe.groupBy({
      by: ['authorId'],
      where: {
        categoryId: categoryId,
        authorId: { not: null },
        status: 'published'
      },
      _count: {
        authorId: true
      },
      orderBy: {
        _count: {
          authorId: 'desc'
        }
      },
      take: 1
    });

    if (!authorWithRecipes || authorWithRecipes.length === 0 || !authorWithRecipes[0].authorId) {
      // No author found for this category, get the most active author
      const randomAuthor = await prisma.author.findFirst({
        orderBy: {
          recipes: {
            _count: 'desc'
          }
        }
      });

      if (!randomAuthor) {
        return NextResponse.json(
          { error: 'No authors available in the system' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        authorId: randomAuthor.id,
        author: {
          id: randomAuthor.id,
          name: randomAuthor.name,
          slug: randomAuthor.slug,
          bio: randomAuthor.bio,
          img: randomAuthor.img,
          avatar: randomAuthor.avatar,
          link: randomAuthor.link
        },
        categoryRecipeCount: 0,
        fallback: true,
        message: 'No author found for this category. Returning most active author.'
      });
    }

    // Get the full author details
    const topAuthorId = authorWithRecipes[0].authorId;
    const author = await prisma.author.findUnique({
      where: { id: topAuthorId },
      include: {
        _count: {
          select: { recipes: true }
        }
      }
    });

    if (!author) {
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      authorId: author.id,
      author: {
        id: author.id,
        name: author.name,
        slug: author.slug,
        bio: author.bio,
        img: author.img,
        avatar: author.avatar,
        link: author.link,
        tags: author.tags
      },
      categoryRecipeCount: authorWithRecipes[0]._count.authorId,
      totalRecipeCount: author._count.recipes,
      fallback: false
    });

  } catch (error) {
    console.error('Error fetching author by category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch author', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
