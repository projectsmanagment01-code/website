/**
 * Category Integration Service
 * 
 * Handles n8n JSON integration and automatic category creation/matching
 * Following the category system architecture specifications
 */

import { prisma } from './prisma';
import { CategoryType, CategoryLevel } from '@prisma/client';
import { generateCategorySlug } from './category-service';

/**
 * Category mapping for n8n JSON imports
 * Maps common recipe categories to our structured system
 */
export const CATEGORY_MAPPINGS = {
  // Cuisine mappings
  'italian': { type: CategoryType.CUISINE, name: 'Italian' },
  'mexican': { type: CategoryType.CUISINE, name: 'Mexican' },
  'chinese': { type: CategoryType.CUISINE, name: 'Chinese' },
  'indian': { type: CategoryType.CUISINE, name: 'Indian' },
  'french': { type: CategoryType.CUISINE, name: 'French' },
  'mediterranean': { type: CategoryType.CUISINE, name: 'Mediterranean' },
  'thai': { type: CategoryType.CUISINE, name: 'Thai' },
  'japanese': { type: CategoryType.CUISINE, name: 'Japanese' },
  'korean': { type: CategoryType.CUISINE, name: 'Korean' },
  'moroccan': { type: CategoryType.CUISINE, name: 'Moroccan' },
  
  // Meal type mappings
  'breakfast': { type: CategoryType.MEAL_TYPE, name: 'Breakfast' },
  'lunch': { type: CategoryType.MEAL_TYPE, name: 'Lunch' },
  'dinner': { type: CategoryType.MEAL_TYPE, name: 'Dinner' },
  'snack': { type: CategoryType.MEAL_TYPE, name: 'Snacks' },
  'snacks': { type: CategoryType.MEAL_TYPE, name: 'Snacks' },
  'dessert': { type: CategoryType.MEAL_TYPE, name: 'Dessert' },
  'desserts': { type: CategoryType.MEAL_TYPE, name: 'Dessert' },
  'appetizer': { type: CategoryType.MEAL_TYPE, name: 'Appetizer' },
  'appetizers': { type: CategoryType.MEAL_TYPE, name: 'Appetizer' },
  'main-dish': { type: CategoryType.MEAL_TYPE, name: 'Main Dish' },
  'main-dishes': { type: CategoryType.MEAL_TYPE, name: 'Main Dish' },
  'side-dish': { type: CategoryType.MEAL_TYPE, name: 'Side Dish' },
  'side-dishes': { type: CategoryType.MEAL_TYPE, name: 'Side Dish' },
  
  // Diet mappings
  'vegetarian': { type: CategoryType.DIET, name: 'Vegetarian' },
  'vegan': { type: CategoryType.DIET, name: 'Vegan' },
  'gluten-free': { type: CategoryType.DIET, name: 'Gluten-Free' },
  'dairy-free': { type: CategoryType.DIET, name: 'Dairy-Free' },
  'keto': { type: CategoryType.DIET, name: 'Keto' },
  'paleo': { type: CategoryType.DIET, name: 'Paleo' },
  'low-carb': { type: CategoryType.DIET, name: 'Low-Carb' },
  'sugar-free': { type: CategoryType.DIET, name: 'Sugar-Free' },
  
  // Cooking method mappings
  'baking': { type: CategoryType.COOKING_METHOD, name: 'Baking' },
  'grilling': { type: CategoryType.COOKING_METHOD, name: 'Grilling' },
  'roasting': { type: CategoryType.COOKING_METHOD, name: 'Roasting' },
  'slow-cooking': { type: CategoryType.COOKING_METHOD, name: 'Slow Cooking' },
  'stir-fry': { type: CategoryType.COOKING_METHOD, name: 'Stir-Fry' },
  'steaming': { type: CategoryType.COOKING_METHOD, name: 'Steaming' },
  'braising': { type: CategoryType.COOKING_METHOD, name: 'Braising' },
  'sauteing': { type: CategoryType.COOKING_METHOD, name: 'Sautéing' },
  'frying': { type: CategoryType.COOKING_METHOD, name: 'Frying' },
  'poaching': { type: CategoryType.COOKING_METHOD, name: 'Poaching' },
  
  // Difficulty mappings
  'easy': { type: CategoryType.DIFFICULTY, name: 'Easy' },
  'beginner': { type: CategoryType.DIFFICULTY, name: 'Easy' },
  'intermediate': { type: CategoryType.DIFFICULTY, name: 'Intermediate' },
  'medium': { type: CategoryType.DIFFICULTY, name: 'Intermediate' },
  'hard': { type: CategoryType.DIFFICULTY, name: 'Advanced' },
  'advanced': { type: CategoryType.DIFFICULTY, name: 'Advanced' },
  'expert': { type: CategoryType.DIFFICULTY, name: 'Expert' },
  
  // Season mappings
  'spring': { type: CategoryType.SEASON, name: 'Spring' },
  'summer': { type: CategoryType.SEASON, name: 'Summer' },
  'fall': { type: CategoryType.SEASON, name: 'Fall' },
  'autumn': { type: CategoryType.SEASON, name: 'Fall' },
  'winter': { type: CategoryType.SEASON, name: 'Winter' },
  'holiday': { type: CategoryType.SEASON, name: 'Holiday' },
  'christmas': { type: CategoryType.SEASON, name: 'Holiday' },
  'thanksgiving': { type: CategoryType.SEASON, name: 'Holiday' }
};

/**
 * Process category from n8n JSON import
 * Automatically creates category if doesn't exist, or finds existing one
 * 
 * @param categoryString - Category string from n8n recipe import
 * @returns Category ID for database relationship
 */
export async function processRecipeCategory(categoryString: string): Promise<string | null> {
  if (!categoryString || typeof categoryString !== 'string') {
    return null;
  }

  const normalizedCategory = categoryString.toLowerCase().trim();
  const mapping = CATEGORY_MAPPINGS[normalizedCategory as keyof typeof CATEGORY_MAPPINGS];

  if (!mapping) {
    console.log(`⚠️ No category mapping found for: "${categoryString}"`);
    // For unmapped categories, default to CUISINE type
    const fallbackMapping = {
      type: CategoryType.CUISINE,
      name: categoryString.charAt(0).toUpperCase() + categoryString.slice(1)
    };
    return await findOrCreateCategory(fallbackMapping.name, fallbackMapping.type);
  }

  return await findOrCreateCategory(mapping.name, mapping.type);
}

/**
 * Find existing category or create new one
 */
async function findOrCreateCategory(name: string, type: CategoryType): Promise<string> {
  const slug = generateCategorySlug(name);

  try {
    // Try to find existing category
    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { slug: slug }
        ],
        AND: {
          type: type
        }
      }
    });

    // Create new category if doesn't exist
    if (!category) {
      console.log(`📝 Creating new category: ${name} (${type})`);
      
      category = await prisma.category.create({
        data: {
          name,
          slug,
          type,
          description: `${name} recipes and cooking inspiration`
        }
      });

      console.log(`✅ Category created with ID: ${category.id}`);
    } else {
      console.log(`🔍 Found existing category: ${category.name} (ID: ${category.id})`);
    }

    return category.id;
  } catch (error) {
    console.error('❌ Error processing recipe category:', error);
    throw new Error(`Failed to process category: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process multiple categories from recipe data
 * Handles primary category and secondary categories
 */
export async function processRecipeCategories(recipeData: any): Promise<{
  primaryCategoryId: string | null;
  secondaryCategoryIds: string[];
}> {
  const result = {
    primaryCategoryId: null as string | null,
    secondaryCategoryIds: [] as string[]
  };

  try {
    // Process primary category
    if (recipeData.category) {
      result.primaryCategoryId = await processRecipeCategory(recipeData.category);
    }

    // Process secondary categories
    const secondaryCategories: string[] = [];
    
    // Check for cuisine
    if (recipeData.cuisine && recipeData.cuisine !== recipeData.category) {
      secondaryCategories.push(recipeData.cuisine);
    }
    
    // Check for difficulty
    if (recipeData.difficulty) {
      secondaryCategories.push(recipeData.difficulty);
    }
    
    // Check for dietary restrictions
    if (recipeData.dietary) {
      const dietaryTags = Array.isArray(recipeData.dietary) 
        ? recipeData.dietary 
        : [recipeData.dietary];
      secondaryCategories.push(...dietaryTags);
    }
    
    // Check for meal type (if different from primary)
    if (recipeData.mealType && recipeData.mealType !== recipeData.category) {
      secondaryCategories.push(recipeData.mealType);
    }

    // Process all secondary categories
    for (const categoryString of secondaryCategories) {
      const categoryId = await processRecipeCategory(categoryString);
      if (categoryId && !result.secondaryCategoryIds.includes(categoryId)) {
        result.secondaryCategoryIds.push(categoryId);
      }
    }

    return result;
  } catch (error) {
    console.error('❌ Error processing recipe categories:', error);
    return result;
  }
}

/**
 * Assign author to category based on their recipe specializations
 */
export async function assignAuthorToCategories(
  authorId: string, 
  categoryIds: string[], 
  specialization: CategoryLevel = 'CONTRIBUTOR'
): Promise<boolean> {
  try {
    for (const categoryId of categoryIds) {
      // Check if relationship already exists
      const existing = await prisma.authorCategory.findUnique({
        where: {
          authorId_categoryId: {
            authorId,
            categoryId
          }
        }
      });

      if (!existing) {
        await prisma.authorCategory.create({
          data: {
            authorId,
            categoryId,
            specialization
          }
        });
        console.log(`✅ Assigned author ${authorId} to category ${categoryId} as ${specialization}`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Error assigning author to categories:', error);
    return false;
  }
}

/**
 * Auto-assign author specializations based on their recipe portfolio
 */
export async function updateAuthorSpecializations(authorId: string): Promise<void> {
  try {
    // Get all recipes by this author with their categories
    const recipes = await prisma.recipe.findMany({
      where: { authorId },
      include: {
        primaryCategory: true,
        secondaryCategories: {
          include: { category: true }
        }
      }
    });

    // Count recipes per category
    const categoryCounts = new Map<string, number>();
    
    recipes.forEach(recipe => {
      // Count primary categories
      if (recipe.primaryCategory) {
        const count = categoryCounts.get(recipe.primaryCategory.id) || 0;
        categoryCounts.set(recipe.primaryCategory.id, count + 1);
      }
      
      // Count secondary categories
      recipe.secondaryCategories.forEach(sc => {
        const count = categoryCounts.get(sc.category.id) || 0;
        categoryCounts.set(sc.category.id, count + 0.5); // Secondary categories count less
      });
    });

    // Determine specialization levels
    const totalRecipes = recipes.length;
    
    for (const [categoryId, count] of categoryCounts.entries()) {
      let specialization: CategoryLevel = 'OCCASIONAL';
      
      if (count >= totalRecipes * 0.6) {
        specialization = 'SPECIALIST';
      } else if (count >= totalRecipes * 0.3) {
        specialization = 'CONTRIBUTOR';
      }

      // Update or create the relationship
      await prisma.authorCategory.upsert({
        where: {
          authorId_categoryId: {
            authorId,
            categoryId
          }
        },
        update: { specialization },
        create: {
          authorId,
          categoryId,
          specialization
        }
      });
    }

    console.log(`✅ Updated specializations for author ${authorId} based on ${totalRecipes} recipes`);
  } catch (error) {
    console.error('❌ Error updating author specializations:', error);
  }
}

/**
 * Migrate existing recipe categories from JSON to Category relationships
 */
export async function migrateExistingCategories(): Promise<void> {
  console.log('🚀 Starting category migration...');
  
  try {
    // Get all recipes with category data but no primary category relationship
    const recipes = await prisma.recipe.findMany({
      where: {
        primaryCategoryId: null,
        category: {
          not: null
        }
      }
    });

    console.log(`📊 Found ${recipes.length} recipes to migrate`);

    for (const recipe of recipes) {
      try {
        console.log(`🔄 Processing recipe: ${recipe.title}`);
        
        // Process the recipe categories
        const categoryData = await processRecipeCategories({
          category: recipe.category,
          cuisine: (recipe.recipeInfo as any)?.cuisine,
          difficulty: (recipe.recipeInfo as any)?.difficulty,
          dietary: (recipe.recipeInfo as any)?.dietary
        });
        
        // Update recipe with category relationships
        const updateData: any = {};
        
        if (categoryData.primaryCategoryId) {
          updateData.primaryCategoryId = categoryData.primaryCategoryId;
        }
        
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: updateData
        });
        
        // Create secondary category relationships
        for (const categoryId of categoryData.secondaryCategoryIds) {
          await prisma.recipeCategory.upsert({
            where: {
              recipeId_categoryId: {
                recipeId: recipe.id,
                categoryId
              }
            },
            update: {},
            create: {
              recipeId: recipe.id,
              categoryId
            }
          });
        }
        
        console.log(`✅ Updated recipe "${recipe.title}" with category relationships`);
        
        // Update author specializations if author exists
        if (recipe.authorId) {
          await updateAuthorSpecializations(recipe.authorId);
        }
      } catch (error) {
        console.error(`❌ Error migrating recipe "${recipe.title}":`, error);
      }
    }
    
    console.log('🎉 Category migration completed!');
  } catch (error) {
    console.error('❌ Error during category migration:', error);
    throw error;
  }
}

/**
 * Get category suggestions for a recipe based on its content
 */
export function suggestCategoriesForRecipe(recipeData: any): string[] {
  const suggestions: string[] = [];
  
  // Analyze title and description for category keywords
  const text = `${recipeData.title || ''} ${recipeData.description || ''}`.toLowerCase();
  
  // Check for cuisine indicators
  Object.entries(CATEGORY_MAPPINGS).forEach(([key, mapping]) => {
    if (text.includes(key) && mapping.type === CategoryType.CUISINE) {
      suggestions.push(mapping.name);
    }
  });
  
  // Check for cooking method indicators
  Object.entries(CATEGORY_MAPPINGS).forEach(([key, mapping]) => {
    if (text.includes(key) && mapping.type === CategoryType.COOKING_METHOD) {
      suggestions.push(mapping.name);
    }
  });
  
  return [...new Set(suggestions)]; // Remove duplicates
}