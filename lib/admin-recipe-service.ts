import { Recipe, RecipeCreateInput, RecipeUpdateInput } from "@/outils/types";
import {
  adminGetAllRecipes,
  adminGetRecipeById,
  adminCreateRecipe,
  adminUpdateRecipe,
  adminDeleteRecipe,
} from "@/data/data";

/**
 * Admin Recipe Service - Handles all recipe CRUD operations
 * Follows Single Responsibility Principle
 */
export class AdminRecipeService {
  /**
   * Get all recipes
   */
  static async getAllRecipes(): Promise<Recipe[]> {
    try {
      return await adminGetAllRecipes();
    } catch (error) {
      console.error("Error fetching recipes:", error);
      throw error;
    }
  }

  /**
   * Get recipe by ID
   */
  static async getRecipeById(id: string): Promise<Recipe> {
    try {
      const recipe = await adminGetRecipeById(id);
      if (!recipe) {
        throw new Error("Recipe not found");
      }
      return recipe;
    } catch (error) {
      console.error("Error fetching recipe:", error);
      throw error;
    }
  }

  /**
   * Create new recipe
   */
  static async createRecipe(recipeInput: RecipeCreateInput): Promise<Recipe> {
    try {
      // Generate slug if not provided
      const slug =
        recipeInput.slug || this.generateSlug(recipeInput.title || "");

      const recipeData = {
        ...recipeInput,
        slug,
        href: recipeInput.href || `/recipes/${slug}`,
      };

      // Debug: Log the recipe data being sent to API
      console.log("🚀 AdminRecipeService: Sending recipe data to API");
      console.log("- Title:", recipeData.title);
      console.log("- Main Image (img):", recipeData.img);
      console.log("- Hero Image:", recipeData.heroImage);
      console.log("- Additional Images:", recipeData.images);

      return await adminCreateRecipe(recipeData);
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  }

  /**
   * Update existing recipe
   */
  static async updateRecipe(
    id: string,
    recipeInput: RecipeUpdateInput
  ): Promise<Recipe> {
    try {
      console.log("AdminRecipeService.updateRecipe called with:");
      console.log("- ID:", id);
      console.log("- Input keys:", Object.keys(recipeInput));

      // Generate slug if title changed but slug not provided
      if (recipeInput.title && !recipeInput.slug) {
        recipeInput.slug = this.generateSlug(recipeInput.title);
        recipeInput.href = `/recipes/${recipeInput.slug}`;
      }

      return await adminUpdateRecipe(id, recipeInput);
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  }

  /**
   * Delete recipe
   */
  static async deleteRecipe(id: string): Promise<void> {
    try {
      await adminDeleteRecipe(id);
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  }

  /**
   * Generate slug from title
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  /**
   * Validate recipe data
   */
  static validateRecipe(recipe: Partial<Recipe>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!recipe.title?.trim()) {
      errors.push("Title is required");
    }

    if (!recipe.intro?.trim()) {
      errors.push("Introduction is required");
    }

    if (!recipe.author?.name?.trim()) {
      errors.push("Author name is required");
    }

    if (!recipe.img?.trim()) {
      errors.push("Recipe image is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
