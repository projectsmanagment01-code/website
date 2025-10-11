import { Article, Recipe, Category } from "@/outils/types";
import latestArticles from "./articles";
import { resolveRecipeAuthors, getRecipeWithAuthor } from "../lib/enhanced-recipe-data";

// ============================================================================
// CONFIGURATION
// ============================================================================

const MOCK_MODE = process.env.MOCK === "true";

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generates dummy recipe data for testing
 * Enhanced with author data resolution
 */
export async function getDummyData(length: number): Promise<Recipe[]> {
  const data = (await import("../data/recipe.json")).default as Recipe;

  const dummyData: Recipe[] = [data];

  for (let i = 0; i < length; i++) {
    dummyData.push({
      ...data,
      id: (i + 1).toString(),
      slug: `${data.slug}-mock-${i}`,
      title: `${data.title} Mock ${i}`,
      shortDescription: `${data.shortDescription} - Mock Recipe ${i}`,
      href: `/recipes/${data.slug}-mock-${i}`,
    });
  }

  // Resolve authors for all dummy data
  return await resolveRecipeAuthors(dummyData);
}

/**
 * Generates dummy article data for testing
 */
export async function getDummyDataArticles(): Promise<Article[]> {
  return latestArticles;
}

// ============================================================================
// MAIN DATA FUNCTIONS
// ============================================================================

/**
 * Gets all recipes - either from API or mock data
 * Enhanced with author data resolution
 */
export async function getData(): Promise<Recipe[]> {
  if (MOCK_MODE) {
    const mockRecipes = await getDummyData(10);
    return await resolveRecipeAuthors(mockRecipes);
  }

  const response = await fetch("/api/recipe");

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const recipes = (await response.json()) as Recipe[];
  return await resolveRecipeAuthors(recipes);
}

/**
 * Gets a single recipe by slug
 * Enhanced with author data resolution
 */
export async function getRecipe(slug: string): Promise<Recipe | null> {
  if (MOCK_MODE) {
    const recipes = await getDummyData(10);
    const recipe = recipes.find((recipe: Recipe) => recipe.slug === slug) || null;
    if (!recipe) return null;
    return await getRecipeWithAuthor(async () => recipe);
  }

  const response = await fetch(`/api/recipe?slug=${encodeURIComponent(slug)}`);

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Failed to fetch recipe");
  }

  const recipe = (await response.json()) as Recipe;
  return await getRecipeWithAuthor(async () => recipe);
}

/**
 * Gets all recipes (alias for getData for clarity)
 */
export async function getRecipes(): Promise<Recipe[]> {
  return await getData();
}

// ============================================================================
// SPECIALIZED RECIPE QUERIES
// ============================================================================

/**
 * Gets trending recipes
 */
export async function getTrending(limit: number = 10): Promise<Recipe[]> {
  if (MOCK_MODE) {
    const recipes = await getDummyData(20);
    return recipes
      .sort(() => Math.random() - 0.5) // Random sort for trending simulation
      .slice(0, limit)
      .map((recipe: Recipe) => ({
        ...recipe,
        featuredText: "Trending Now",
      }));
  }

  const response = await fetch(`/api/recipe/trending?limit=${limit}`);

  if (!response.ok) {
    throw new Error("Failed to fetch trending recipes");
  }

  return (await response.json()) as Recipe[];
}

/**
 * Gets related recipes for a specific recipe
 */
export async function getRelated(
  recipeId: string,
  limit: number = 6
): Promise<Recipe[]> {
  if (MOCK_MODE) {
    const recipes = await getDummyData(15);
    return recipes
      .filter((recipe: Recipe) => recipe.id !== recipeId)
      .slice(0, limit)
      .map((recipe: Recipe) => ({
        ...recipe,
        featuredText: "Related Recipe",
      }));
  }

  const response = await fetch(
    `/api/recipe/related?id=${recipeId}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch related recipes");
  }

  return (await response.json()) as Recipe[];
}

/**
 * Gets latest recipes
 */
export async function getLatest(limit: number = 12): Promise<Recipe[]> {
  if (MOCK_MODE) {
    const recipes = await getDummyData(20);
    return recipes
      .sort((a: Recipe, b: Recipe) => {
        const aDate = a.updatedDate ? new Date(a.updatedDate).getTime() : 0;
        const bDate = b.updatedDate ? new Date(b.updatedDate).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, limit)
      .map((recipe: Recipe) => ({
        ...recipe,
        featuredText: "Latest Recipe",
      }));
  }

  const response = await fetch(`/api/recipe/latest?limit=${limit}`);

  if (!response.ok) {
    throw new Error("Failed to fetch latest recipes");
  }

  return (await response.json()) as Recipe[];
}

/**
 * Gets recipes by category
 */
export async function getRecipesByCategory(
  category: string,
  limit?: number
): Promise<Recipe[]> {
  if (MOCK_MODE) {
    const recipes = await getDummyData(20);
    const filteredRecipes = recipes.filter(
      (recipe: Recipe) =>
        recipe?.category?.toLowerCase() === category.toLowerCase()
    );

    return limit ? filteredRecipes.slice(0, limit) : filteredRecipes;
  }

  const url = `/api/recipe/category/${encodeURIComponent(category)}${
    limit ? `?limit=${limit}` : ""
  }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch recipes for category: ${category}`);
  }

  return (await response.json()) as Recipe[];
}

// ============================================================================
// CATEGORY FUNCTIONS
// ============================================================================

/**
 * Helper function to create category object from category name and recipes
 */
async function createCategoryFromName(
  categoryName: string,
  allRecipes?: Recipe[]
): Promise<Category> {
  // Create slug from category name - use the raw category name as slug
  const slug = categoryName;

  // Find first recipe in this category to get its image
  let categoryImage = `/images/categories/default.jpg`; // Default fallback

  if (allRecipes) {
    const firstRecipeInCategory = allRecipes.find(
      (recipe: Recipe) => recipe.category === categoryName
    );

    if (
      firstRecipeInCategory &&
      firstRecipeInCategory.images &&
      firstRecipeInCategory.images.length > 0
    ) {
      categoryImage = firstRecipeInCategory.images[0];
    }
  }

  return {
    id: slug,
    slug: slug,
    title: categoryName,
    href: `/category/${slug}`,
    description: `Discover delicious ${categoryName.toLowerCase()} recipes`,
    image: categoryImage,
    alt: `${categoryName} recipes`,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  };
}

/**
 * Gets all categories
 */
export async function getCategories(): Promise<Category[]> {
  if (MOCK_MODE) {
    const recipes = await getDummyData(10);

    // Extract unique category names
    const uniqueCategoryNames = [
      ...new Set(
        recipes
          .map((recipe: Recipe) => recipe.category)
          .filter((category): category is string => Boolean(category))
      ),
    ];

    // Convert to Category objects, passing recipes for image lookup
    const categories = await Promise.all(
      uniqueCategoryNames.map((categoryName: string) =>
        createCategoryFromName(categoryName, recipes)
      )
    );

    return categories;
  }

  const response = await fetch("/api/recipe/categories");

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  // Get all recipes to find images for categories
  const allRecipes = await getData();

  // If your API returns strings, convert them to Category objects
  const categoryNames = (await response.json()) as string[];
  return Promise.all(
    categoryNames.map((categoryName: string) =>
      createCategoryFromName(categoryName, allRecipes)
    )
  );
}

/**
 * Gets best categories (popular categories with counts)
 */
export async function getBestCategories(
  limit: number = 5
): Promise<{ category: string; count: number }[]> {
  if (MOCK_MODE) {
    const recipes = await getDummyData(50);

    // Count recipes per category
    const categoryCounts = recipes.reduce((acc, recipe: Recipe) => {
      if (!recipe.category) return acc;
      acc[recipe.category] = (acc[recipe.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to sorted array
    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count) // Sort by popularity
      .slice(0, limit);
  }

  const response = await fetch(`/api/recipe/categories/best?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch best categories");
  }

  return (await response.json()) as { category: string; count: number }[];
}

// ============================================================================
// ARTICLE FUNCTIONS
// ============================================================================

/**
 * Gets latest articles
 */
export async function getLatestArticles(
  limit: number = 12
): Promise<Article[]> {
  if (MOCK_MODE) {
    const articles = await getDummyDataArticles();
    return articles
      .sort((a: Article, b: Article) => {
        const aDate = new Date(a.updatedDate).getTime();
        const bDate = new Date(b.updatedDate).getTime();
        return bDate - aDate;
      })
      .slice(0, limit)
      .map((article: Article) => ({
        ...article,
        // featuredText: "Latest Article", // Articles don't have featuredText
      }));
  }

  const response = await fetch(`/api/articles/latest?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch latest articles");
  }

  return (await response.json()) as Article[];
}
