import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withRetry } from "@/lib/prisma-helpers";

/**
 * POST /api/recipe/[id]/view
 * Increment view count for a recipe and update lastViewedAt timestamp
 * @param {NextRequest} request
 * @param {Object} context - Contains params with id
 * @returns {NextResponse} JSON response with updated view count
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Recipe ID is required" },
      { status: 400 }
    );
  }

  try {
    // Increment view count and update lastViewedAt
    const updatedRecipe = await withRetry(() =>
      prisma.recipe.update({
        where: { id },
        data: {
          views: {
            increment: 1,
          },
          lastViewedAt: new Date(),
        },
        select: {
          id: true,
          views: true,
          lastViewedAt: true,
        },
      })
    );

    return NextResponse.json({
      success: true,
      views: updatedRecipe.views,
      lastViewedAt: updatedRecipe.lastViewedAt,
    });
  } catch (error) {
    console.error("Error updating recipe views:", error);

    // Check if recipe not found
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update recipe views" },
      { status: 500 }
    );
  }
}
