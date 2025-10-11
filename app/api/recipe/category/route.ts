export const dynamic = "force-static";
export const revalidate = 60;

// app/api/recipe/category/route.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/recipe/category
 * Gets all available recipe categories
 * @param {NextRequest} request
 * @returns {NextResponse} JSON response with all categories
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.recipe.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    const categoryList = categories
      .map((recipe) => recipe.category)
      .filter(Boolean);

    return NextResponse.json(categoryList);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
