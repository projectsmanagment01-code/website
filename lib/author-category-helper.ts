import { prisma } from './prisma';

/**
 * Get recommended author ID for a category
 * Priority:
 * 1. Author who has the category NAME, SLUG, or ID in their tags field
 * 2. Author with most recipes in that category
 * 3. Most active author overall (fallback)
 * 
 * @param categoryId - The category ID to find an author for
 * @returns Author ID or null if no authors exist
 */
export async function getAuthorIdByCategory(categoryId: string): Promise<string | null> {
  try {
    // Get category details
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, slug: true }
    });

    if (!category) {
      console.error('Category not found:', categoryId);
      return null;
    }

    // PRIORITY 1: Find authors who have this category in their tags
    // Check for: category ID, category name, or category slug
    const authorByTag = await prisma.author.findFirst({
      where: {
        OR: [
          { tags: { has: categoryId } },                    // Match by ID
          { tags: { has: category.name } },                 // Match by name
          { tags: { has: category.slug } },                 // Match by slug
          { tags: { has: category.name.toLowerCase() } },   // Match by lowercase name
          { tags: { has: category.slug.toLowerCase() } },   // Match by lowercase slug
        ]
      },
      orderBy: {
        recipes: {
          _count: 'desc'
        }
      },
      select: {
        id: true
      }
    });

    if (authorByTag) {
      console.log(`Found author by tag for category ${category.name}:`, authorByTag.id);
      return authorByTag.id;
    }

    // PRIORITY 2: Find the author with the most recipes in this category
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
      console.log(`Found author by recipes for category ${category.name}:`, authorWithRecipes[0].authorId);
      return authorWithRecipes[0].authorId;
    }

    // PRIORITY 3: Fallback to most active author overall
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

    console.log(`Using fallback author for category ${category.name}:`, fallbackAuthor?.id);
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
 * @returns Full author object with recipe count and match method
 */
export async function getAuthorByCategory(categoryId: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, slug: true }
    });

    if (!category) {
      return {
        author: null,
        matchMethod: 'none',
        message: 'Category not found'
      };
    }

    // Check tag-based match (ID, name, or slug)
    const authorByTag = await prisma.author.findFirst({
      where: {
        OR: [
          { tags: { has: categoryId } },
          { tags: { has: category.name } },
          { tags: { has: category.slug } },
          { tags: { has: category.name.toLowerCase() } },
          { tags: { has: category.slug.toLowerCase() } },
        ]
      },
      orderBy: {
        recipes: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: { recipes: true }
        }
      }
    });

    if (authorByTag) {
      // Find which tag matched
      let matchedTag = 'unknown';
      if (authorByTag.tags.includes(categoryId)) matchedTag = `ID: ${categoryId}`;
      else if (authorByTag.tags.includes(category.name)) matchedTag = `name: "${category.name}"`;
      else if (authorByTag.tags.includes(category.slug)) matchedTag = `slug: "${category.slug}"`;
      else if (authorByTag.tags.includes(category.name.toLowerCase())) matchedTag = `name: "${category.name.toLowerCase()}"`;
      else if (authorByTag.tags.includes(category.slug.toLowerCase())) matchedTag = `slug: "${category.slug.toLowerCase()}"`;

      return {
        author: authorByTag,
        matchMethod: 'tag',
        message: `Author "${authorByTag.name}" is tagged for category "${category.name}" (matched by ${matchedTag})`
      };
    }

    // Check recipe-based match
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
      const author = await prisma.author.findUnique({
        where: { id: authorWithRecipes[0].authorId },
        include: {
          _count: {
            select: { recipes: true }
          }
        }
      });

      if (author) {
        return {
          author,
          matchMethod: 'recipes',
          message: `Author "${author.name}" has ${authorWithRecipes[0]._count.authorId} recipes in category "${category.name}"`
        };
      }
    }

    // Fallback to most active author
    const fallbackAuthor = await prisma.author.findFirst({
      orderBy: {
        recipes: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: { recipes: true }
        }
      }
    });

    return {
      author: fallbackAuthor,
      matchMethod: 'fallback',
      message: fallbackAuthor 
        ? `No author assigned to category "${category.name}". Using most active author "${fallbackAuthor.name}". To assign a specific author, add "${category.name}" or "${category.slug}" to their tags.`
        : 'No authors found in the system'
    };

  } catch (error) {
    console.error('Error getting author details by category:', error);
    return {
      author: null,
      matchMethod: 'error',
      message: 'Error retrieving author'
    };
  }
}
