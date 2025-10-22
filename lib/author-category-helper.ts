import { prisma } from './prisma';

/**
 * Get recommended author ID for a category
 * Returns the author with most recipes in that category
 * Falls back to most active author if no match found
 * 
 * @param categoryId - The category ID to find an author for
 * @returns Author ID or null if no authors exist
 */
export async function getAuthorIdByCategory(categoryId: string): Promise<string | null> {
  try {
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

    if (authorWithRecipes && authorWithRecipes.length > 0 && authorWithRecipes[0].authorId) {
      return authorWithRecipes[0].authorId;
    }

    // Fallback: Get the most active author overall
    const fallbackAuthor = await prisma.author.findFirst({
      orderBy: {
        recipes: {
          _count: 'desc'
        }
      },
      select: {
        id: true
      }
    });

    return fallbackAuthor?.id || null;

  } catch (error) {
    console.error('Error getting author by category:', error);
    return null;
  }
}

/**
 * Get full author details by category ID
 * 
 * @param categoryId - The category ID to find an author for
 * @returns Full author object with recipe count or null
 */
export async function getAuthorByCategory(categoryId: string) {
  try {
    const authorId = await getAuthorIdByCategory(categoryId);
    
    if (!authorId) {
      return null;
    }

    const author = await prisma.author.findUnique({
      where: { id: authorId },
      include: {
        _count: {
          select: { recipes: true }
        }
      }
    });

    return author;

  } catch (error) {
    console.error('Error getting author details by category:', error);
    return null;
  }
}
