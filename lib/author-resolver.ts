/**
 * Author Resolver Service
 * 
 * Handles automatic author resolution for recipes using a fallback chain:
 * 1. Recipe's assigned author (authorRef)
 * 2. Category's default author
 * 3. Global fallback author
 * 4. Best-matching author based on category specialization
 */

import prisma from './prisma';
import { Author as PrismaAuthor } from '@prisma/client';

export interface ResolvedAuthor {
  id: string;
  name: string;
  bio: string | null;
  img: string | null;
  avatar: string | null;
  slug: string;
  link: string | null;
  source: 'recipe' | 'category-default' | 'global-fallback' | 'specialization' | 'none';
}

/**
 * Get system settings (cached)
 */
let systemSettingsCache: any = null;
let systemSettingsCacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

async function getSystemSettings() {
  const now = Date.now();
  if (systemSettingsCache && (now - systemSettingsCacheTime) < CACHE_TTL) {
    return systemSettingsCache;
  }

  const settings = await prisma.systemSettings.findFirst({
    include: {
      globalFallbackAuthor: true
    }
  });

  systemSettingsCache = settings;
  systemSettingsCacheTime = now;
  return settings;
}

/**
 * Resolve author for a recipe using fallback chain
 */
export async function resolveRecipeAuthor(
  recipe: {
    authorId?: string | null;
    authorRef?: PrismaAuthor | null;
    categoryId?: string | null;
    categoryRef?: {
      id: string;
      defaultAuthorId?: string | null;
      defaultAuthor?: PrismaAuthor | null;
    } | null;
  }
): Promise<ResolvedAuthor | null> {
  // 1. Recipe has assigned author
  if (recipe.authorRef) {
    return {
      ...recipe.authorRef,
      source: 'recipe'
    };
  }

  // 2. Category has default author
  if (recipe.categoryRef?.defaultAuthor) {
    return {
      ...recipe.categoryRef.defaultAuthor,
      source: 'category-default'
    };
  }

  // If we have categoryId but no defaultAuthor loaded, fetch it
  if (recipe.categoryId && !recipe.categoryRef?.defaultAuthor) {
    const category = await prisma.category.findUnique({
      where: { id: recipe.categoryId },
      include: { defaultAuthor: true }
    });

    if (category?.defaultAuthor) {
      return {
        ...category.defaultAuthor,
        source: 'category-default'
      };
    }
  }

  // 3. Global fallback author
  const settings = await getSystemSettings();
  if (settings?.globalFallbackAuthor) {
    return {
      ...settings.globalFallbackAuthor,
      source: 'global-fallback'
    };
  }

  // 4. Best matching author based on category specialization
  if (recipe.categoryId) {
    const specialization = await prisma.authorCategorySpecialization.findFirst({
      where: { categoryId: recipe.categoryId },
      orderBy: { count: 'desc' },
      include: { author: true }
    });

    if (specialization?.author) {
      return {
        ...specialization.author,
        source: 'specialization'
      };
    }
  }

  // No author found
  return null;
}

/**
 * Get or create global fallback author
 */
export async function ensureGlobalFallbackAuthor(): Promise<PrismaAuthor> {
  const settings = await getSystemSettings();
  
  if (settings?.globalFallbackAuthor) {
    return settings.globalFallbackAuthor;
  }

  // Create default system author
  const systemAuthor = await prisma.author.upsert({
    where: { slug: 'system-default' },
    update: {},
    create: {
      name: 'FlavorFable Team',
      slug: 'system-default',
      bio: 'A collection of recipes from our talented culinary community.',
      avatar: '/placeholder-user.jpg',
      link: '/authors'
    }
  });

  // Update system settings
  await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: { globalFallbackAuthorId: systemAuthor.id },
    create: {
      id: 'default',
      globalFallbackAuthorId: systemAuthor.id,
      autoAssignAuthors: true,
      autoReassignOnDelete: true
    }
  });

  // Clear cache
  systemSettingsCache = null;

  return systemAuthor;
}

/**
 * Auto-assign author to recipe based on category
 */
export async function autoAssignAuthor(recipeId: string): Promise<PrismaAuthor | null> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      categoryRef: {
        include: { defaultAuthor: true }
      }
    }
  });

  if (!recipe) return null;

  // Don't override if recipe already has an author
  if (recipe.authorId) return null;

  // Try category default first
  if (recipe.categoryRef?.defaultAuthorId) {
    await prisma.recipe.update({
      where: { id: recipeId },
      data: { authorId: recipe.categoryRef.defaultAuthorId }
    });
    return recipe.categoryRef.defaultAuthor;
  }

  // Try specialization
  if (recipe.categoryId) {
    const specialization = await prisma.authorCategorySpecialization.findFirst({
      where: { categoryId: recipe.categoryId },
      orderBy: { count: 'desc' },
      include: { author: true }
    });

    if (specialization) {
      await prisma.recipe.update({
        where: { id: recipeId },
        data: { authorId: specialization.authorId }
      });
      return specialization.author;
    }
  }

  // Use global fallback
  const fallbackAuthor = await ensureGlobalFallbackAuthor();
  await prisma.recipe.update({
    where: { id: recipeId },
    data: { authorId: fallbackAuthor.id }
  });

  return fallbackAuthor;
}

/**
 * Reassign recipes when author is deleted
 */
export async function reassignOrphanedRecipes(
  deletedAuthorId: string,
  options: { dryRun?: boolean } = {}
): Promise<{
  totalRecipes: number;
  assignments: Array<{ recipeId: string; newAuthorId: string; source: string }>;
}> {
  const settings = await getSystemSettings();
  
  if (!settings?.autoReassignOnDelete && !options.dryRun) {
    // Just set to null if auto-reassign is disabled
    await prisma.recipe.updateMany({
      where: { authorId: deletedAuthorId },
      data: { authorId: null }
    });
    return { totalRecipes: 0, assignments: [] };
  }

  const recipes = await prisma.recipe.findMany({
    where: { authorId: deletedAuthorId },
    include: {
      categoryRef: {
        include: { defaultAuthor: true }
      }
    }
  });

  const assignments: Array<{ recipeId: string; newAuthorId: string; source: string }> = [];

  for (const recipe of recipes) {
    let newAuthorId: string | null = null;
    let source = 'none';

    // Try category default
    if (recipe.categoryRef?.defaultAuthorId) {
      newAuthorId = recipe.categoryRef.defaultAuthorId;
      source = 'category-default';
    }
    // Try specialization
    else if (recipe.categoryId) {
      const specialization = await prisma.authorCategorySpecialization.findFirst({
        where: { 
          categoryId: recipe.categoryId,
          authorId: { not: deletedAuthorId } // Don't assign back to deleted author
        },
        orderBy: { count: 'desc' }
      });

      if (specialization) {
        newAuthorId = specialization.authorId;
        source = 'specialization';
      }
    }
    // Use global fallback
    if (!newAuthorId && settings?.globalFallbackAuthorId) {
      newAuthorId = settings.globalFallbackAuthorId;
      source = 'global-fallback';
    }
    // Last resort: create fallback
    if (!newAuthorId) {
      const fallback = await ensureGlobalFallbackAuthor();
      newAuthorId = fallback.id;
      source = 'global-fallback';
    }

    if (newAuthorId && !options.dryRun) {
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { authorId: newAuthorId }
      });
    }

    if (newAuthorId) {
      assignments.push({
        recipeId: recipe.id,
        newAuthorId,
        source
      });
    }
  }

  return {
    totalRecipes: recipes.length,
    assignments
  };
}

/**
 * Update category specialization counts
 */
export async function updateCategorySpecialization(categoryId: string): Promise<void> {
  // Get all recipes in this category grouped by author
  const recipes = await prisma.recipe.groupBy({
    by: ['authorId'],
    where: {
      categoryId,
      authorId: { not: null }
    },
    _count: true
  });

  // Update specialization records
  for (const group of recipes) {
    if (!group.authorId) continue;

    await prisma.authorCategorySpecialization.upsert({
      where: {
        authorId_categoryId: {
          authorId: group.authorId,
          categoryId
        }
      },
      update: {
        count: group._count
      },
      create: {
        authorId: group.authorId,
        categoryId,
        count: group._count
      }
    });
  }

  // Remove specializations with zero recipes
  await prisma.authorCategorySpecialization.deleteMany({
    where: {
      categoryId,
      count: 0
    }
  });
}

/**
 * Clear system settings cache
 */
export function clearAuthorResolverCache(): void {
  systemSettingsCache = null;
  systemSettingsCacheTime = 0;
}
