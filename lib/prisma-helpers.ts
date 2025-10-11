import { Prisma } from "@prisma/client";

/**
 * Build a helper to include all relations for a given model
 */
function includeAllRelations(model: Prisma.DMMF.Model) {
  const include: Record<string, true> = {};
  for (const field of model.fields) {
    if (field.kind === "object") {
      include[field.name] = true;
    }
  }
  return include;
}

/**
 * Get recipe relations dynamically from Prisma DMMF
 */
export const getRecipeRelations = () => {
  try {
    const dmmf = Prisma.dmmf;
    const recipeModel = dmmf.datamodel.models.find((m) => m.name === "Recipe");
    if (recipeModel) {
      return includeAllRelations(recipeModel);
    }
    // Fallback to manual relations if DMMF fails
    return {
      author: true,
      whyYouLove: true,
      essIngredientGuide: true,
      ingredientGuide: true,
      ingredients: true,
      instructions: true,
      completeProcess: true,
      sections: true,
      faq: true,
      relatedRecipes: true,
      timing: true,
      recipeInfo: true,
    };
  } catch (error) {
    console.error("Error getting recipe relations:", error);
    // Fallback relations
    return {
      author: true,
      whyYouLove: true,
      essIngredientGuide: true,
      ingredientGuide: true,
      ingredients: true,
      instructions: true,
      completeProcess: true,
      sections: true,
      faq: true,
      relatedRecipes: true,
      timing: true,
      recipeInfo: true,
    };
  }
};

/**
 * Get author relations dynamically from Prisma DMMF
 */
export const getAuthorRelations = () => {
  try {
    const dmmf = Prisma.dmmf;
    const authorModel = dmmf.datamodel.models.find((m) => m.name === "Author");
    if (authorModel) {
      return includeAllRelations(authorModel);
    }
    // Fallback to manual relations if DMMF fails
    return {
      recipes: true,
    };
  } catch (error) {
    console.error("Error getting author relations:", error);
    // Fallback relations
    return {
      recipes: true,
    };
  }
};

/**
 * Generic function to get all relations for any model
 */
export const getModelRelations = (modelName: string) => {
  try {
    const dmmf = Prisma.dmmf;
    const model = dmmf.datamodel.models.find((m) => m.name === modelName);
    if (model) {
      return includeAllRelations(model);
    }
    return {};
  } catch (error) {
    console.error(`Error getting ${modelName} relations:`, error);
    return {};
  }
};

// lib/prisma-helpers.ts - Add retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      console.warn(
        `Database operation failed (attempt ${attempt}/${maxRetries}):`,
        error
      );
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}
