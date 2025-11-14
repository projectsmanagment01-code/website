/**
 * Recipe Database Service - Handles saving recipes to database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SaveRecipeInput {
  spyEntryId: string;
  recipeData: any;
  recipeJson: string;
}

export class RecipeDatabaseService {
  /**
   * Save generated recipe to database
   */
  static async saveRecipe(input: SaveRecipeInput): Promise<{ success: boolean; recipeId?: string; error?: string }> {
    try {
      console.log(`💾 Saving recipe to database: ${input.recipeData.title}`);

      // Create the recipe in the database
      const recipe = await prisma.recipe.create({
        data: {
          id: input.recipeData.id,
          title: input.recipeData.title,
          slug: input.recipeData.slug,
          description: input.recipeData.description,
          shortDescription: input.recipeData.shortDescription || input.recipeData.description,
          
          // Images
          heroImage: input.recipeData.heroImage || input.recipeData.featureImage,
          img: input.recipeData.img || input.recipeData.featureImage,
          featureImage: input.recipeData.featureImage,
          preparationImage: input.recipeData.preparationImage,
          cookingImage: input.recipeData.cookingImage,
          finalPresentationImage: input.recipeData.finalPresentationImage,
          images: [
            input.recipeData.featureImage,
            input.recipeData.preparationImage,
            input.recipeData.cookingImage,
            input.recipeData.finalPresentationImage
          ].filter(Boolean),
          imageAlt: input.recipeData.imageAlt,
          
          // Category (legacy field)
          category: input.recipeData.category,
          categoryLink: input.recipeData.categoryLink || `/categories/${input.recipeData.category}`,
          categoryHref: input.recipeData.categoryHref || `/categories/${input.recipeData.category}`,
          
          // Timing (stored as JSON)
          timing: input.recipeData.timing || {},
          
          // Recipe Info (stored as JSON)
          recipeInfo: input.recipeData.recipeInfo || {},
          
          // Content (stored as JSON)
          ingredients: input.recipeData.ingredients || [],
          instructions: input.recipeData.instructions || [],
          
          // Narrative fields
          intro: input.recipeData.intro || '',
          story: input.recipeData.story || '',
          testimonial: input.recipeData.testimonial || '',
          
          // Additional content
          whyYouLove: input.recipeData.whyYouLove || {},
          essIngredientGuide: input.recipeData.essIngredientGuide || [],
          completeProcess: input.recipeData.completeProcess || [],
          sections: input.recipeData.sections || [], // For legacy support
          questions: input.recipeData.questions || {},
          faq: input.recipeData.faq || input.recipeData.questions || {}, // Support both field names
          mustKnowTips: input.recipeData.mustKnowTips || [],
          professionalSecrets: input.recipeData.professionalSecrets || [],
          notes: input.recipeData.notes || [],
          tools: input.recipeData.tools || [],
          relatedRecipes: input.recipeData.relatedRecipes || [], // For related recipes
          ingredientGuide: input.recipeData.ingredientGuide || input.recipeData.essIngredientGuide || [],
          
          // Storage and serving
          serving: input.recipeData.serving || '',
          storage: input.recipeData.storage || '',
          allergyInfo: input.recipeData.allergyInfo || '',
          nutritionDisclaimer: input.recipeData.nutritionDisclaimer || '',
          
          // Metadata
          featuredText: input.recipeData.featuredText || '',
          updatedDate: input.recipeData.updatedDate || new Date().toISOString(),
          href: input.recipeData.href || `/recipes/${input.recipeData.slug}`,
          
          // Author (required field - stored as JSON)
          author: input.recipeData.author || {
            name: 'Chef',
            bio: '',
            avatar: '',
            link: ''
          },
          authorId: input.recipeData.authorId,
          
          // Category ID (link to Category table)
          categoryId: input.recipeData.categoryId || null,
          
          // Status
          status: 'published'
        }
      });

      // Update the Pinterest Spy entry to mark it as recipe generated
      await prisma.pinterestSpyData.update({
        where: { id: input.spyEntryId },
        data: {
          recipeGeneratedAt: new Date(),
          generatedRecipeId: recipe.id,
          status: 'COMPLETED'
        }
      });

      console.log(`✅ Recipe saved successfully: ${recipe.id}`);

      return {
        success: true,
        recipeId: recipe.id
      };

    } catch (error) {
      console.error('❌ Failed to save recipe to database:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }
  }

  /**
   * Check if recipe already exists for spy entry
   */
  static async recipeExistsForEntry(spyEntryId: string): Promise<boolean> {
    const entry = await prisma.pinterestSpyData.findUnique({
      where: { id: spyEntryId },
      select: { generatedRecipeId: true }
    });

    return !!entry?.generatedRecipeId;
  }
}
