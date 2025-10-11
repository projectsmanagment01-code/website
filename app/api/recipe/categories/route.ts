// app/api/recipe/categories/route.ts
export const dynamic = "force-dynamic"; // Changed from force-static to force-dynamic
export const revalidate = 0; // Disable caching temporarily

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/recipe/categories
 * Gets all unique recipe categories
 * @param {NextRequest} request
 * @returns {NextResponse} JSON response with categories array
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.recipe.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
      where: {
        category: {
          not: null,
        },
      },
    });

    const categoryNames = categories
      .map((recipe) => recipe.category)
      .filter(Boolean)
      .sort();

    return NextResponse.json(categoryNames);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
