export const dynamic = "force-dynamic";

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { withRetry } from "@/lib/prisma-helpers";

/**
 * GET /api/recipe/trending
 * Returns trending recipes based on views with time decay
 * @param {NextRequest} request
 * @returns {NextResponse} JSON response with trending recipes
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.nextUrl);
  const limit = parseInt(url.searchParams.get("limit") || "10");

  try {
    // Get recipes with view data - include recently viewed recipes even with 0 views
    const recipes = await withRetry(() =>
      prisma.recipe.findMany({
        where: {
          href: { not: null }, // Only show published recipes (with href)
          OR: [
            { views: { gt: 0 } }, // Recipes that have been viewed
            {
              lastViewedAt: {
                not: null,
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Viewed in last 24 hours
              },
            },
          ],
        },
        orderBy: [
          { views: "desc" }, // Primary sort by views
          { lastViewedAt: "desc" }, // Secondary sort by recency
        ],
        take: limit * 2, // Get more to allow for scoring
      })
    );

    // Calculate trending score for each recipe
    const now = new Date();
    const trendingRecipes = recipes
      .map((recipe) => {
        const daysSinceLastView = recipe.lastViewedAt
          ? Math.max(
              1,
              Math.floor(
                (now.getTime() - recipe.lastViewedAt.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : 30; // Default to 30 days if never viewed

        // Time decay formula: score = views / (1 + days_since_last_view)
        // This gives higher weight to recently viewed recipes
        const trendingScore = recipe.views / (1 + daysSinceLastView);

        return {
          ...recipe,
          trendingScore,
          featuredText: "Trending Now",
        };
      })
      .sort((a, b) => b.trendingScore - a.trendingScore) // Sort by trending score
      .slice(0, limit); // Take top N

    return NextResponse.json(trendingRecipes);
  } catch (error) {
    console.error("Error fetching trending recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending recipes" },
      { status: 500 }
    );
  }
}
