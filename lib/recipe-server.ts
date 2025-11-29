/**
 * Server-side recipe data fetching
 * Use these functions in Server Components (app directory)
 * They directly query Prisma without HTTP overhead
 */

import prisma from "@/lib/prisma";
import { executeWithRetry } from "@/lib/db-utils";
import { Recipe } from "@/outils/types";
import { resolveRecipeAuthors, getRecipeWithAuthor } from "@/lib/enhanced-recipe-data";

/**
 * Normalize recipe data from Prisma to ensure arrays are properly formatted
 * Prisma sometimes returns JSON fields as objects instead of arrays
 */
function normalizeRecipeData(recipe: any): any {
  const arrayFields = [
    'essIngredientGuide',
    'ingredientGuide',
    'ingredients',
    'instructions',
    'completeProcess',
    'sections',
    'faq',
    'relatedRecipes',
    'mustKnowTips',
    'professionalSecrets',
    'notes',
    'tools',
    'images'
  ];

  const normalized = { ...recipe };

  // Ensure all array fields are actually arrays
  arrayFields.forEach(field => {
    if (normalized[field] !== null && normalized[field] !== undefined) {
      // If it's not an array, wrap it or convert to empty array
      if (!Array.isArray(normalized[field])) {
        console.warn(`Field "${field}" is not an array, converting:`, typeof normalized[field]);
        normalized[field] = [];
      }
    } else {
      // Set to empty array if null/undefined
      normalized[field] = [];
    }
  });

  // Ensure nested objects exist
  if (!normalized.questions || typeof normalized.questions !== 'object') {
    normalized.questions = { items: [] };
  } else if (!Array.isArray(normalized.questions.items)) {
    normalized.questions.items = [];
  }

  return normalized;
}

/**
 * Get a single recipe by slug (server-side)
 * @param slug - Recipe slug
 * @returns Recipe or null if not found
 */
export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  try {
    const recipe = await executeWithRetry(
      async () =>
        await prisma.recipe.findFirst({
          where: {
            slug: {
              equals: slug,
              mode: "insensitive",
            },
          },
        }),
      { maxRetries: 3, retryDelay: 1000, operationName: 'getRecipeBySlug' }
    );

    if (!recipe) {
      return null;
    }

    // Convert Prisma result to Recipe type and ensure arrays are properly formatted
    const normalizedRecipe = normalizeRecipeData(recipe);
    
    // Resolve author
    return await getRecipeWithAuthor(async () => normalizedRecipe as Recipe);
  } catch (error) {
    console.error(`Error fetching recipe by slug "${slug}":`, error);
    return null;
  }
}

/**
 * Get all recipes (server-side)
 * @returns Array of recipes
 */
export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    const recipes = await executeWithRetry(
      () =>
        prisma.recipe.findMany({
          orderBy: { createdAt: "desc" },
        }),
      { maxRetries: 3, retryDelay: 1000, operationName: 'getAllRecipes' }
    );

    // Normalize and resolve authors for all recipes
    const normalizedRecipes = recipes.map(normalizeRecipeData);
    return await resolveRecipeAuthors(normalizedRecipes as Recipe[]);
  } catch (error) {
    console.error("Error fetching all recipes:", error);
    return [];
  }
}

/**
 * Get related recipes by ID (server-side)
 * @param recipeId - Recipe ID
 * @param limit - Number of related recipes to fetch
 * @returns Array of related recipes
 */
export async function getRelatedRecipes(
  recipeId: string,
  limit: number = 4
): Promise<Recipe[]> {
  try {
    // Get the current recipe to find its category
    const currentRecipe = await executeWithRetry(
      () =>
        prisma.recipe.findUnique({
          where: { id: recipeId },
          select: { category: true },
        }),
      { maxRetries: 3, retryDelay: 1000, operationName: 'getRelatedRecipes-findCurrent' }
    );

    if (!currentRecipe?.category) {
      return [];
    }

    // Get related recipes from same category
    const relatedRecipes = await executeWithRetry(
      () =>
        prisma.recipe.findMany({
          where: {
            category: currentRecipe.category,
            id: { not: recipeId },
          },
          take: limit,
          orderBy: { views: "desc" },
        }),
      { maxRetries: 3, retryDelay: 1000, operationName: 'getRelatedRecipes-findMany' }
    );

    // Normalize and resolve authors for related recipes
    const normalizedRecipes = relatedRecipes.map(normalizeRecipeData);
    return await resolveRecipeAuthors(normalizedRecipes as Recipe[]);
  } catch (error) {
    console.error(`Error fetching related recipes for "${recipeId}":`, error);
    return [];
  }
}

/**
 * Get recipe slugs for static generation
 * @returns Array of slugs
 */
export async function getAllRecipeSlugs(): Promise<string[]> {
  try {
    const recipes = await executeWithRetry(
      () =>
        prisma.recipe.findMany({
          select: { slug: true },
        }),
      3,
      1000
    );

    return recipes.map((r) => r.slug).filter((slug): slug is string => Boolean(slug));
  } catch (error) {
    console.error("Error fetching recipe slugs:", error);
    return [];
  }
}
