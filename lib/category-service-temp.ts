/**
 * Temporary Category Service 
 * Simple implementation to get the admin interface working
 */

// Using legacy data structure for now
export interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: string;
  isActive: boolean;
}

// Mock CategoryType enum
export enum CategoryType {
  CUISINE = 'CUISINE',
  DIET = 'DIET', 
  MEAL_TYPE = 'MEAL_TYPE',
  COOKING_METHOD = 'COOKING_METHOD',
  DIFFICULTY = 'DIFFICULTY',
  SEASON = 'SEASON'
}

// Mock data for now
const mockCategories: CategoryEntity[] = [
  {
    id: '1',
    name: 'Italian',
    slug: 'italian',
    description: 'Traditional Italian cuisine',
    type: CategoryType.CUISINE,
    isActive: true
  },
  {
    id: '2', 
    name: 'Vegetarian',
    slug: 'vegetarian',
    description: 'Plant-based recipes',
    type: CategoryType.DIET,
    isActive: true
  },
  {
    id: '3',
    name: 'Breakfast',
    slug: 'breakfast', 
    description: 'Morning meal recipes',
    type: CategoryType.MEAL_TYPE,
    isActive: true
  }
];

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
  let filteredCategories = [...mockCategories];

  // Apply filters
  if (options.type) {
    filteredCategories = filteredCategories.filter(cat => cat.type === options.type);
  }

  if (options.isActive !== undefined) {
    filteredCategories = filteredCategories.filter(cat => cat.isActive === options.isActive);
  }

  if (options.search) {
    const searchLower = options.search.toLowerCase();
    filteredCategories = filteredCategories.filter(cat => 
      cat.name.toLowerCase().includes(searchLower) ||
      (cat.description && cat.description.toLowerCase().includes(searchLower))
    );
  }

  // Pagination
  const total = filteredCategories.length;
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;
  const categories = filteredCategories.slice(skip, skip + limit);

  return {
    categories,
    total,
    currentPage: page,
    totalPages
  };
}

export async function searchCategories(
  query: string,
  limit: number = 20
): Promise<CategoryEntity[]> {
  const result = await getCategories(1, limit, { search: query });
  return result.categories;
}

export async function getCategoryStats(): Promise<{
  totalCategories: number;
  activeCategories: number;
  categoriesByType: Record<CategoryType, number>;
  topCategories: Array<{ name: string; recipeCount: number; type: CategoryType }>;
}> {
  const activeCategories = mockCategories.filter(cat => cat.isActive);
  
  const categoriesByType = {} as Record<CategoryType, number>;
  Object.values(CategoryType).forEach(type => {
    categoriesByType[type] = mockCategories.filter(cat => cat.type === type).length;
  });

  return {
    totalCategories: mockCategories.length,
    activeCategories: activeCategories.length,
    categoriesByType,
    topCategories: []
  };
}

export async function createCategory(data: {
  name: string;
  description?: string;
  type: CategoryType;
}): Promise<CategoryEntity> {
  const newCategory: CategoryEntity = {
    id: Date.now().toString(),
    name: data.name,
    slug: data.name.toLowerCase().replace(/\s+/g, '-'),
    description: data.description,
    type: data.type,
    isActive: true
  };
  
  mockCategories.push(newCategory);
  return newCategory;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryEntity | null> {
  return mockCategories.find(cat => cat.slug === slug) || null;
}

export function generateCategorySlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}