export const dynamic = "force-static";
export const revalidate = 60;
// app/api/recipe/[id]/related/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getRecipeRelations } from "@/lib/prisma-helpers";

/**
 * GET /api/recipe/[id]/related
 * Gets recipes related to a specific recipe
 * @param {NextRequest} request
 * @param {{ params: { id: string } }} context
 * @returns {NextResponse} JSON response with related recipes
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.nextUrl);
  const limit = parseInt(url.searchParams.get("limit") || "6");
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json([]);
  }

  const recipeId = id;

  try {
    const recipeRelations = getRecipeRelations();

    // First, get the current recipe to find related ones
    const currentRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { category: true, ingredients: true },
    });

    if (!currentRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Find related recipes based on category or similar criteria
    const relatedRecipes = await prisma.recipe.findMany({
      where: {
        href: { not: null }, // Only show published recipes (with href)
        AND: [
          { id: { not: recipeId } },
          {
            OR: [
              { category: currentRecipe.category },
              // You can add more sophisticated matching logic here
              // For example, matching ingredients, tags, etc.
            ],
          },
        ],
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(relatedRecipes);
  } catch (error) {
    console.error("Error fetching related recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch related recipes" },
      { status: 500 }
    );
  }
}
