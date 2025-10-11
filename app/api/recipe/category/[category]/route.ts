import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const categorySlug = params.category;
    const url = new URL(request.nextUrl);
    const limit = url.searchParams.get("limit");

    console.log("🔍 Fetching recipes for category slug:", categorySlug);

    // Handle multiple category name formats
    // Convert slug format to possible database formats
    const categoryFormats = [
      categorySlug, // exact match
      categorySlug.replace(/-/g, "_"), // hyphens to underscores
      categorySlug.replace(/_/g, "-"), // underscores to hyphens
      categorySlug.replace(/-/g, " "), // hyphens to spaces
      categorySlug.replace(/_/g, " "), // underscores to spaces
    ];

    // Remove duplicates
    const uniqueFormats = [...new Set(categoryFormats)];

    console.log("🔍 Trying category formats:", uniqueFormats);

    const recipes = await prisma.recipe.findMany({
      where: {
        href: { not: null }, // Only show published recipes (with href)
        category: {
          in: uniqueFormats,
          mode: "insensitive", // Case insensitive search
        },
      },
      orderBy: { createdAt: "desc" },
      ...(limit && { take: parseInt(limit) }),
    });

    console.log(
      "✅ Found",
      recipes.length,
      "recipes for category:",
      categorySlug
    );
    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes by category:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes by category" },
      { status: 500 }
    );
  }
}
