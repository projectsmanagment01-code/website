export const dynamic = "force-dynamic";
export const revalidate = 60;
// app/api/recipe/latest/route.ts - Get latest recipes
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/recipe/latest
 * Gets the latest recipes ordered by creation date
 * @param {NextRequest} request
 * @returns {NextResponse} JSON response with latest recipes
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.nextUrl);
  const limit = parseInt(url.searchParams.get("limit") || "12");

  try {
    const recipes = await prisma.recipe.findMany({
      where: { href: { not: null } }, // Only show published recipes (with href)
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Add featuredText to match expected format
    const latestRecipes = recipes.map((recipe) => ({
      ...recipe,
      featuredText: "Latest Recipe",
    }));

    return NextResponse.json(latestRecipes);
  } catch (error) {
    console.error("Error fetching latest recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest recipes" },
      { status: 500 }
    );
  }
}
