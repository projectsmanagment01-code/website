/**
 * Category Service
 * 
 * Business logic for Category CRUD operations
 * Following project context and admin authentication patterns
 */

import { prisma } from './prisma';

export interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
  description: string;
  href: string;
  image: string;
  alt: string;
  sizes?: string;
}

export interface CreateCategoryData {
  name: string;
  description: string;
  href: string;
  image: string;
  alt: string;
  sizes?: string;
}

/**
 * Generate URL-friendly slug from category name
 */
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Create a new category
 */
export async function createCategory(data: CreateCategoryData): Promise<CategoryEntity> {
  // Generate slug from name
  let slug = generateCategorySlug(data.name);
  
  // Ensure slug is unique
  let counter = 1;
  let uniqueSlug = slug;
  
  while (await prisma.category.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: uniqueSlug,
        description: data.description,
        type: data.type,
        img: data.img,
        avatar: data.avatar,
        color: data.color,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        featuredText: data.featuredText
      }
    });

    return {
      id: category.id,
      name: (category as any).name || (category as any).title,
      slug: category.slug,
      description: category.description,
      type: (category as any).type || 'OTHER',
      img: (category as any).img || (category as any).image,
      avatar: (category as any).avatar,
      color: (category as any).color,
      isActive: (category as any).isActive !== false,
      seoTitle: (category as any).seoTitle,
      seoDescription: (category as any).seoDescription,
      featuredText: (category as any).featuredText,
      createdAt: (category as any).createdAt,
      updatedAt: (category as any).updatedAt
    };
  } catch (error) {
    console.error('❌ Error creating category:', error);
    throw new Error(`Failed to create category: ${error}`);
  }
}

/**
 * Get categories with pagination
 */
export async function getCategories(
  page: number = 1, 
  limit: number = 20,
  options: {
    type?: CategoryType;
    isActive?: boolean;
    search?: string;
  } = {}
): Promise<{
  categories: CategoryEntity[];
  total: number;
  currentPage: number;
  totalPages: number;
}> {
  const { type, isActive, search } = options;

  const where: any = {};

  if (type) {
    where.type = type;
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Get total count for pagination
  const total = await prisma.category.count({ where });

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  const categories = await prisma.category.findMany({
    where,
    orderBy: [
      { title: 'asc' }
    ],
    skip,
    take: limit
  });

  const categoriesData = categories.map(category => ({
    id: category.id,
    name: (category as any).name || (category as any).title,
    slug: category.slug,
    description: category.description,
    type: (category as any).type || 'OTHER',
    img: (category as any).img || (category as any).image,
    avatar: (category as any).avatar,
    color: (category as any).color,
    isActive: (category as any).isActive !== false,
    seoTitle: (category as any).seoTitle,
    seoDescription: (category as any).seoDescription,
    featuredText: (category as any).featuredText,
    createdAt: (category as any).createdAt,
    updatedAt: (category as any).updatedAt,
    // Legacy compatibility
    title: (category as any).title || (category as any).name,
    href: (category as any).href || `/categories/${category.slug}`,
    image: (category as any).image || (category as any).img,
    alt: (category as any).alt || `${(category as any).name || (category as any).title} recipes`,
    sizes: (category as any).sizes
  }));

  return {
    categories: categoriesData,
    total,
    currentPage: page,
    totalPages
  };
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryEntity | null> {
  const category = await prisma.category.findUnique({
    where: { slug }
  });

  if (!category) {
    return null;
  }

  return {
    id: category.id,
    name: (category as any).name || (category as any).title,
    slug: category.slug,
    description: category.description,
    type: (category as any).type || 'OTHER',
    img: (category as any).img || (category as any).image,
    avatar: (category as any).avatar,
    color: (category as any).color,
    isActive: (category as any).isActive !== false,
    seoTitle: (category as any).seoTitle,
    seoDescription: (category as any).seoDescription,
    featuredText: (category as any).featuredText,
    createdAt: (category as any).createdAt,
    updatedAt: (category as any).updatedAt
  };
}

/**
 * Search categories by name or description
 */
export async function searchCategories(
  query: string, 
  limit: number = 20
): Promise<CategoryEntity[]> {
  const result = await getCategories(1, limit, { search: query });
  return result.categories;
}

/**
 * Get category statistics
 */
export async function getCategoryStats(): Promise<{
  totalCategories: number;
  activeCategories: number;
  categoriesByType: Record<CategoryType, number>;
  topCategories: Array<{ name: string; recipeCount: number; type: CategoryType }>;
}> {
  try {
    const [
      totalCategories,
      activeCategories,
      allCategories
    ] = await Promise.all([
      prisma.category.count(),
      prisma.category.count({ where: { isActive: true } }),
      prisma.category.findMany({ 
        select: { type: true }
      })
    ]);

    // Count categories by type
    const typeStats = {} as Record<CategoryType, number>;
    
    // Initialize all types with 0
    Object.values(CategoryType).forEach(type => {
      typeStats[type as CategoryType] = 0;
    });

    // Count actual categories
    allCategories.forEach(category => {
      if (category.type && category.type in typeStats) {
        typeStats[category.type as CategoryType]++;
      }
    });

    return {
      totalCategories,
      activeCategories,
      categoriesByType: typeStats,
      topCategories: [] // TODO: Implement when we have recipe relationships
    };
  } catch (error) {
    console.error('❌ Error getting category stats:', error);
    return {
      totalCategories: 0,
      activeCategories: 0,
      categoriesByType: {} as Record<CategoryType, number>,
      topCategories: []
    };
  }
}

// Simple function to get all categories
export async function getAllCategories() {
  try {
    console.log('📂 Getting all categories...');
    
    const categories = await prisma.category.findMany({
      orderBy: [
        { title: 'asc' }
      ]
    });
    
    console.log(`✅ Found ${categories.length} categories`);
    return categories.map(category => ({
      id: category.id,
      name: category.title,
      slug: category.slug,
      href: category.href,
      description: category.description,
      image: category.image,
      alt: category.alt,
      sizes: category.sizes
    }));
  } catch (error) {
    console.error('❌ Error getting all categories:', error);
    return [];
  }
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string) {
  try {
    console.log(`📂 Getting category by ID: ${id}`);
    
    const category = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!category) {
      console.log(`❌ Category not found: ${id}`);
      return null;
    }
    
    console.log(`✅ Found category: ${category.title}`);
    return {
      id: category.id,
      name: category.title,
      slug: category.slug,
      href: category.href,
      description: category.description,
      image: category.image,
      alt: category.alt,
      sizes: category.sizes
    };
  } catch (error) {
    console.error('❌ Error getting category by ID:', error);
    return null;
  }
}

/**
 * Update category
 */
export async function updateCategory(id: string, data: any) {
  try {
    console.log(`📝 Updating category: ${id}`);
    
    const category = await prisma.category.update({
      where: { id },
      data: {
        title: data.name,
        slug: data.slug || generateCategorySlug(data.name),
        description: data.description,
        image: data.image,
        alt: data.alt,
        sizes: data.sizes,
        href: data.href
      }
    });
    
    console.log(`✅ Updated category: ${category.title}`);
    return {
      id: category.id,
      name: category.title,
      slug: category.slug,
      href: category.href,
      description: category.description,
      image: category.image,
      alt: category.alt,
      sizes: category.sizes
    };
  } catch (error) {
    console.error('❌ Error updating category:', error);
    throw error;
  }
}

/**
 * Delete category
 */
export async function deleteCategory(id: string) {
  try {
    console.log(`🗑️ Deleting category: ${id}`);
    
    await prisma.category.delete({
      where: { id }
    });
    
    console.log(`✅ Deleted category: ${id}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    throw error;
  }
}