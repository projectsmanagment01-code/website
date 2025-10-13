// Dynamic route - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getRecipeRelations } from "@/lib/prisma-helpers";

/**
 * GET /api/recipe/related?id=xxx&limit=4
 * Gets recipes related to a specific recipe
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.nextUrl);
  const limit = parseInt(url.searchParams.get("limit") || "6");
  const id = url.searchParams.get("id");

  console.log("🔍 Related recipes API called:", { id, limit });

  if (!id) {
    console.log("❌ No recipe ID provided");
    return NextResponse.json([]);
  }

  const recipeId = id;

  try {
    // First, get the current recipe to find related ones
    const currentRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!currentRecipe) {
      console.log("❌ Recipe not found:", recipeId);
      return NextResponse.json([]);
    }

    console.log("✅ Current recipe:", currentRecipe.title, "| Category:", currentRecipe.category);

    // Try to find related recipes with less strict filtering
    const relatedRecipes = await prisma.recipe.findMany({
      where: {
        id: { not: recipeId }, // Exclude current recipe
        category: currentRecipe.category, // Same category
        // Removed status filter to see if any recipes exist
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    console.log(`✅ Found ${relatedRecipes.length} related recipes in category "${currentRecipe.category}"`);
    
    // Log first recipe details for debugging
    if (relatedRecipes.length > 0) {
      console.log("📝 First related recipe:", {
        title: relatedRecipes[0].title,
        category: relatedRecipes[0].category,
        hasImage: !!(relatedRecipes[0].featureImage || relatedRecipes[0].img || relatedRecipes[0].heroImage)
      });
    } else {
      console.log("⚠️ No recipes found in category. Checking total recipes...");
      const totalRecipes = await prisma.recipe.count();
      const totalInCategory = await prisma.recipe.count({
        where: { category: currentRecipe.category }
      });
      console.log(`📊 Total recipes: ${totalRecipes}, In category "${currentRecipe.category}": ${totalInCategory}`);
    }

    return NextResponse.json(relatedRecipes);
  } catch (error) {
    console.error("Error fetching related recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch related recipes" },
      { status: 500 }
    );
  }
}
