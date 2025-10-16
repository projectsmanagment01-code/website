/**
 * Category Service - Clean Implementation
 * 
 * Handles all category CRUD operations with proper validation and relationships
 */

import { prisma } from './prisma';
import { Category, Recipe } from '@prisma/client';

// ============================================================================
// Type Definitions
// ============================================================================

export interface CategoryWithCount extends Category {
  _count?: {
    recipes: number;
  };
}

export interface CategoryWithRecipes extends Category {
  recipes: Recipe[];
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  image: string;
  icon?: string;
  color?: string;
  order?: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  isActive?: boolean;
}

// ============================================================================
// Slug Generation
// ============================================================================

/**
 * Generate URL-friendly slug from category name
 */
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')          // Spaces to hyphens
    .replace(/-+/g, '-')           // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
}

/**
 * Ensure slug is unique by appending counter if needed
 */
async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await prisma.category.findUnique({
      where: { slug },
      select: { id: true }
    });
    
    // If no match or it's the same category being updated, slug is available
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }
    
    // Try next variant
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new category
 */
export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  // Generate and ensure unique slug
  const baseSlug = generateCategorySlug(input.name);
  const slug = await ensureUniqueSlug(baseSlug);
  
  try {
    const category = await prisma.category.create({
      data: {
        name: input.name,
        slug,
        description: input.description || `Explore our collection of ${input.name} recipes`,
        image: input.image,
        icon: input.icon,
        color: input.color,
        order: input.order ?? 0,
        metaTitle: input.metaTitle || `${input.name} Recipes`,
        metaDescription: input.metaDescription || `Discover delicious ${input.name} recipes with step-by-step instructions`,
        isActive: true,
      }
    });
    
    console.log(`✅ Created category: ${category.name} (${category.slug})`);
    return category;
  } catch (error) {
    console.error('❌ Error creating category:', error);
    throw new Error(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(
  id: string, 
  input: UpdateCategoryInput
): Promise<Category> {
  try {
    // If name is being changed, regenerate slug
    let slug: string | undefined;
    if (input.name) {
      const baseSlug = generateCategorySlug(input.name);
      slug = await ensureUniqueSlug(baseSlug, id);
    }
    
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(slug && { slug }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.image && { image: input.image }),
        ...(input.icon !== undefined && { icon: input.icon }),
        ...(input.color !== undefined && { color: input.color }),
        ...(input.order !== undefined && { order: input.order }),
        ...(input.metaTitle !== undefined && { metaTitle: input.metaTitle }),
        ...(input.metaDescription !== undefined && { metaDescription: input.metaDescription }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      }
    });
    
    console.log(`✅ Updated category: ${category.name}`);
    return category;
  } catch (error) {
    console.error('❌ Error updating category:', error);
    throw new Error(`Failed to update category: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a category (with safety checks)
 */
export async function deleteCategory(id: string, force: boolean = false): Promise<void> {
  try {
    // Check if category has recipes
    const recipeCount = await prisma.recipe.count({
      where: { categoryId: id }
    });
    
    if (recipeCount > 0 && !force) {
      throw new Error(
        `Cannot delete category: ${recipeCount} recipe(s) are assigned to it. ` +
        `Please reassign recipes first or use force=true to set recipes to null.`
      );
    }
    
    // If forcing, set all recipe categoryIds to null
    if (force && recipeCount > 0) {
      await prisma.recipe.updateMany({
        where: { categoryId: id },
        data: { categoryId: null }
      });
      console.log(`⚠️ Removed category from ${recipeCount} recipe(s)`);
    }
    
    await prisma.category.delete({
      where: { id }
    });
    
    console.log(`✅ Deleted category: ${id}`);
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    throw new Error(`Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get all categories with optional filtering and recipe counts
 */
export async function getCategories(options: {
  includeInactive?: boolean;
  includeCount?: boolean;
  orderBy?: 'name' | 'order' | 'createdAt' | 'recipeCount';
  orderDirection?: 'asc' | 'desc';
} = {}): Promise<CategoryWithCount[]> {
  const {
    includeInactive = false,
    includeCount = true,
    orderBy = 'order',
    orderDirection = 'asc'
  } = options;
  
  try {
    const categories = await prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: includeCount ? {
        _count: {
          select: { recipes: true }
        }
      } : undefined,
      orderBy: orderBy === 'recipeCount' 
        ? undefined // Will sort manually
        : { [orderBy]: orderDirection }
    });
    
    // Manual sort for recipe count
    if (orderBy === 'recipeCount' && includeCount) {
      categories.sort((a, b) => {
        const countA = a._count?.recipes || 0;
        const countB = b._count?.recipes || 0;
        return orderDirection === 'asc' ? countA - countB : countB - countA;
      });
    }
    
    return categories;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(
  slug: string,
  includeRecipes: boolean = false
): Promise<CategoryWithRecipes | Category | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: includeRecipes ? {
        recipes: {
          where: { status: 'published' },
          orderBy: { createdAt: 'desc' },
          take: 50 // Limit for performance
        }
      } : undefined
    });
    
    return category;
  } catch (error) {
    console.error('❌ Error fetching category by slug:', error);
    return null;
  }
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(
  id: string,
  includeRecipes: boolean = false
): Promise<CategoryWithRecipes | Category | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: includeRecipes ? {
        recipes: {
          where: { status: 'published' },
          orderBy: { createdAt: 'desc' }
        }
      } : undefined
    });
    
    return category;
  } catch (error) {
    console.error('❌ Error fetching category by ID:', error);
    return null;
  }
}

/**
 * Search categories by name
 */
export async function searchCategories(query: string): Promise<CategoryWithCount[]> {
  try {
    const categories = await prisma.category.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { slug: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      include: {
        _count: {
          select: { recipes: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return categories;
  } catch (error) {
    console.error('❌ Error searching categories:', error);
    return [];
  }
}

/**
 * Get categories with pagination
 */
export async function getCategoriesPaginated(
  page: number = 1,
  limit: number = 20,
  includeInactive: boolean = false
) {
  const skip = (page - 1) * limit;
  
  try {
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where: includeInactive ? {} : { isActive: true },
        include: {
          _count: {
            select: { recipes: true }
          }
        },
        orderBy: { order: 'asc' },
        skip,
        take: limit
      }),
      prisma.category.count({
        where: includeInactive ? {} : { isActive: true }
      })
    ]);
    
    return {
      categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('❌ Error fetching paginated categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Reorder categories
 */
export async function reorderCategories(orderedIds: string[]): Promise<void> {
  try {
    const updates = orderedIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { order: index }
      })
    );
    
    await prisma.$transaction(updates);
    console.log(`✅ Reordered ${orderedIds.length} categories`);
  } catch (error) {
    console.error('❌ Error reordering categories:', error);
    throw new Error('Failed to reorder categories');
  }
}

/**
 * Get category statistics
 */
export async function getCategoryStats() {
  try {
    const [total, active, inactive, withRecipes] = await Promise.all([
      prisma.category.count(),
      prisma.category.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: false } }),
      prisma.category.count({
        where: {
          recipes: {
            some: {}
          }
        }
      })
    ]);
    
    return {
      total,
      active,
      inactive,
      withRecipes,
      empty: total - withRecipes
    };
  } catch (error) {
    console.error('❌ Error fetching category stats:', error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      withRecipes: 0,
      empty: 0
    };
  }
}
