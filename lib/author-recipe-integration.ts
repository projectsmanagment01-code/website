/**
 * Author-Recipe Integration Service
 * 
 * Handles the transition from embedded author objects to authorId references
 * Provides utilities for fetching author data in recipe components
 */

import { getAuthorById } from './author-integration';
import { Author, AuthorEntity, Recipe } from '@/outils/types';

/**
 * Enhanced author fetching for recipes with caching
 */
const authorCache = new Map<string, AuthorEntity & { recipeCount: number }>();

/**
 * Get author data for a recipe (handles both old and new approaches)
 * @param recipe Recipe object with either embedded author or authorId
 * @returns Author data for display
 */
export async function getRecipeAuthor(recipe: Recipe): Promise<Author | null> {
  // New approach: Use authorId to fetch from database
  if (recipe.authorId) {
    // Check cache first
    if (authorCache.has(recipe.authorId)) {
      const authorEntity = authorCache.get(recipe.authorId)!;
      return convertAuthorEntityToAuthor(authorEntity);
    }

    // Fetch from database
    try {
      const authorEntity = await getAuthorById(recipe.authorId);
      if (authorEntity) {
        // Cache the result
        authorCache.set(recipe.authorId, authorEntity);
        return convertAuthorEntityToAuthor(authorEntity);
      }
    } catch (error) {
      console.error('Error fetching author by ID:', error);
    }
  }

  // Fallback: Use embedded author object (backward compatibility)
  if (recipe.author) {
    return recipe.author;
  }

  return null;
}

/**
 * Convert AuthorEntity to Author format for display
 */
function convertAuthorEntityToAuthor(authorEntity: AuthorEntity & { recipeCount: number }): Author {
  return {
    name: authorEntity.name,
    bio: authorEntity.bio || '',
    avatar: authorEntity.avatar || (authorEntity.img ? `/uploads/authors/${authorEntity.img}` : ''),
    link: authorEntity.link || `/authors/${authorEntity.slug}`
  };
}

/**
 * Get author image URL for a recipe (enhanced version of getAuthorImage)
 */
export async function getRecipeAuthorImage(recipe: Recipe): Promise<string> {
  const author = await getRecipeAuthor(recipe);
  
  if (!author) {
    return '/placeholder-user.jpg';
  }

  // Priority: avatar (external URL) > local image > placeholder
  if (author.avatar) {
    return author.avatar;
  }

  return '/placeholder-user.jpg';
}

/**
 * Batch fetch authors for multiple recipes (for performance)
 */
export async function getAuthorsForRecipes(recipes: Recipe[]): Promise<Map<string, Author>> {
  const authorMap = new Map<string, Author>();
  const authorIds = new Set<string>();

  // Collect unique author IDs
  recipes.forEach(recipe => {
    if (recipe.authorId) {
      authorIds.add(recipe.authorId);
    }
  });

  // Batch fetch authors (this could be optimized with a batch query)
  for (const authorId of authorIds) {
    try {
      const authorEntity = await getAuthorById(authorId);
      if (authorEntity) {
        authorMap.set(authorId, convertAuthorEntityToAuthor(authorEntity));
      }
    } catch (error) {
      console.error(`Error fetching author ${authorId}:`, error);
    }
  }

  return authorMap;
}

/**
 * Clear author cache (useful for development/testing)
 */
export function clearAuthorCache(): void {
  authorCache.clear();
}