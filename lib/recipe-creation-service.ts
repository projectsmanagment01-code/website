import { Recipe, RecipeCreateInput } from "@/outils/types";

/**
 * Recipe Creation Service with Enhanced Image Linking
 * Demonstrates how to properly link images when adding recipes
 */
export class RecipeCreationService {
  /**
   * Create a recipe with linked images
   * This shows the proper way to handle image relationships
   */
  static async createRecipeWithImages(recipeData: {
    // Basic info
    title: string;
    intro: string;
    description: string;
    category: string;

    // Images (uploaded via /api/upload)
    mainImageUrl: string; // Required - primary recipe image
    heroImageUrl?: string; // Optional - banner image
    additionalImages?: string[]; // Optional - step images, ingredients, etc.

    // Other recipe data
    ingredients?: any[];
    instructions?: any[];
    timing?: any;
    author?: any;
    // ... other fields
  }): Promise<Recipe> {
    try {
      // 1. Prepare the recipe data with proper image linking
      const recipeInput: RecipeCreateInput = {
        // Basic fields
        title: recipeData.title,
        slug: this.generateSlug(recipeData.title),
        intro: recipeData.intro,
        description: recipeData.description,
        shortDescription: recipeData.intro.substring(0, 150) + "...",
        category: recipeData.category,

        // Image linking - this is the key part!
        img: recipeData.mainImageUrl, // Main image (required)
        heroImage: recipeData.heroImageUrl || recipeData.mainImageUrl, // Hero image (fallback to main)
        images: [
          recipeData.mainImageUrl, // Always include main image
          ...(recipeData.heroImageUrl &&
          recipeData.heroImageUrl !== recipeData.mainImageUrl
            ? [recipeData.heroImageUrl]
            : []), // Add hero if different
          ...(recipeData.additionalImages || []), // Add additional images
        ].filter(Boolean), // Remove any empty strings

        // Other data
        ingredients: recipeData.ingredients || [],
        instructions: recipeData.instructions || [],
        timing: recipeData.timing || null,
        author: recipeData.author || {
          name: "Chef",
          link: "",
          avatar: recipeData.mainImageUrl, // Could use main image as fallback
          bio: "",
        },

        // Auto-generated fields
        categoryLink: `#${recipeData.category.toLowerCase()}`,
        featuredText: "",
        updatedDate: new Date().toISOString(),

        // Initialize other arrays/objects
        notes: [],
        tools: [],
        mustKnowTips: [],
        professionalSecrets: [],
        allergyInfo: "",
        nutritionDisclaimer: "",
        serving: "",
        storage: "",
        story: "",
        testimonial: "",

        // Optional structured data
        whyYouLove: undefined,
        recipeInfo: undefined,
        questions: undefined,
        essIngredientGuide: [],
        ingredientGuide: [],
        completeProcess: [],
        sections: [],
        faq: [],
        relatedRecipes: [],
      };

      // 2. Call the API to create the recipe
      const response = await fetch("/api/recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipeInput),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create recipe");
      }

      const createdRecipe = await response.json();
      return createdRecipe;
    } catch (error) {
      console.error("Error creating recipe with images:", error);
      throw error;
    }
  }

  /**
   * Upload images first, then create recipe
   * This is the recommended workflow
   */
  static async createRecipeWithUpload(recipeData: {
    title: string;
    intro: string;
    description: string;
    category: string;

    // Files to upload
    mainImageFile: File;
    heroImageFile?: File;
    additionalImageFiles?: File[];

    // Other recipe data
    ingredients?: any[];
    instructions?: any[];
    timing?: any;
    author?: any;
  }): Promise<Recipe> {
    try {
      // 1. Upload main image (required)
      const mainImageResult = await this.uploadImage(
        recipeData.mainImageFile,
        "recipes"
      );
      if (!mainImageResult.success) {
        throw new Error(
          "Failed to upload main image: " + mainImageResult.error
        );
      }

      // 2. Upload hero image if provided
      let heroImageUrl = "";
      if (recipeData.heroImageFile) {
        const heroImageResult = await this.uploadImage(
          recipeData.heroImageFile,
          "recipes"
        );
        if (heroImageResult.success) {
          heroImageUrl = heroImageResult.url!;
        }
      }

      // 3. Upload additional images if provided
      const additionalImages: string[] = [];
      if (recipeData.additionalImageFiles?.length) {
        for (const file of recipeData.additionalImageFiles) {
          const result = await this.uploadImage(file, "recipes");
          if (result.success) {
            additionalImages.push(result.url!);
          }
        }
      }

      // 4. Create recipe with uploaded image URLs
      return await this.createRecipeWithImages({
        ...recipeData,
        mainImageUrl: mainImageResult.url!,
        heroImageUrl,
        additionalImages,
      });
    } catch (error) {
      console.error("Error in upload and create workflow:", error);
      throw error;
    }
  }

  /**
   * Helper: Upload a single image file
   */
  private static async uploadImage(
    file: File,
    category: string = "recipes"
  ): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  /**
   * Helper: Generate URL-friendly slug
   */
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  }

  /**
   * Example usage method showing the complete workflow
   */
  static async exampleUsage() {
    // Example 1: Upload files first, then create recipe
    const mainImageFile = new File([], "main.jpg"); // Your actual file
    const heroImageFile = new File([], "hero.jpg"); // Your actual file

    try {
      const recipe = await this.createRecipeWithUpload({
        title: "Delicious Honey Sesame Chicken",
        intro: "A sweet and savory dish that's perfect for dinner.",
        description: "This honey sesame chicken recipe combines...",
        category: "dinner",
        mainImageFile,
        heroImageFile,
        ingredients: [
          { section: "Main", items: ["2 lbs chicken breast", "1/4 cup honey"] },
        ],
        instructions: [
          { step: "1", instruction: "Cut chicken into pieces..." },
        ],
        timing: {
          prepTime: "15 minutes",
          cookTime: "20 minutes",
          totalTime: "35 minutes",
        },
      });

      console.log("Recipe created with images:", recipe);
      return recipe;
    } catch (error) {
      console.error("Failed to create recipe:", error);
    }
  }
}
