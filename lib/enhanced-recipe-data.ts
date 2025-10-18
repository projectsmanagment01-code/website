/**
 * Enhanced Recipe Data Service with Author Resolution
 * 
 * This service extends the existing data loading to resolve author information
 * for recipes that use the new authorId approach
 */

import { Recipe, Author } from '@/outils/types';
import { getAuthorById } from './author-integration';
import { getAuthorImageUrl } from './author-image';

/**
 * Resolve author data for a recipe
 */
async function resolveRecipeAuthor(recipe: Recipe): Promise<Recipe> {
  // If recipe already has author data (legacy approach), return as-is
  if (recipe.author && !recipe.authorId) {
    return recipe;
  }

  // If recipe has authorId, fetch author data and create embedded author object
  if (recipe.authorId) {
    try {
      const authorEntity = await getAuthorById(recipe.authorId);
      if (authorEntity) {
        // Create embedded author object for backward compatibility
        const author: Author = {
          name: authorEntity.name,
          bio: authorEntity.bio || '',
          avatar: getAuthorImageUrl(authorEntity), // Use helper to get correct URL
          link: authorEntity.link || `/authors/${authorEntity.slug}`
        };

        return {
          ...recipe,
          author // Add resolved author data
        };
      }
    } catch (error) {
      console.error(`Error resolving author for recipe ${recipe.id}:`, error);
    }
  }

  // Fallback: return recipe without author data
  return recipe;
}

/**
 * Resolve authors for multiple recipes in batch
 * ✅ OPTIMIZED: Fetches all unique authors in ONE query instead of N queries
 */
export async function resolveRecipeAuthors(recipes: Recipe[]): Promise<Recipe[]> {
  // Step 1: Get unique author IDs
  const authorIds = [...new Set(
    recipes
      .map(r => r.authorId)
      .filter((id): id is string => id !== null && id !== undefined)
  )];

  if (authorIds.length === 0) {
    return recipes; // No authors to resolve
  }

  // Step 2: Fetch ALL authors in ONE query (instead of N queries)
  const prisma = (await import('@/lib/prisma')).default;
  
  const authors = await prisma.author.findMany({
    where: {
      id: { in: authorIds }
    }
  });

  // Step 3: Create lookup map for O(1) access
  const authorMap = new Map(authors.map((a: any) => [a.id, a]));

  // Step 4: Resolve authors (no additional database queries)
  return recipes.map(recipe => {
    // If recipe already has author data, return as-is
    if (recipe.author && !recipe.authorId) {
      return recipe;
    }

    if (!recipe.authorId) {
      return recipe;
    }
    
    const authorEntity = authorMap.get(recipe.authorId);
    if (!authorEntity) {
      return recipe;
    }

    const author: Author = {
      name: authorEntity.name,
      bio: authorEntity.bio || '',
      avatar: getAuthorImageUrl(authorEntity),
      link: authorEntity.link || `/authors/${authorEntity.slug}`
    };

    return {
      ...recipe,
      author
    };
  });
}

/**
 * Enhanced single recipe loader with author resolution
 */
export async function getRecipeWithAuthor(recipeGetter: () => Promise<Recipe | null>): Promise<Recipe | null> {
  const recipe = await recipeGetter();
  if (!recipe) return null;
  
  return await resolveRecipeAuthor(recipe);
}

/**
 * Enhanced multiple recipes loader with author resolution
 */
export async function getRecipesWithAuthors(recipesGetter: () => Promise<Recipe[]>): Promise<Recipe[]> {
  const recipes = await recipesGetter();
  return await resolveRecipeAuthors(recipes);
}