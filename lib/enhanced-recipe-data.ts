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
 */
export async function resolveRecipeAuthors(recipes: Recipe[]): Promise<Recipe[]> {
  const resolvedRecipes = await Promise.all(
    recipes.map(recipe => resolveRecipeAuthor(recipe))
  );
  
  return resolvedRecipes;
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