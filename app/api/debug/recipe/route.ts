export const dynamic = "force-static";
export const revalidate = 60;

import { NextRequest, NextResponse } from "next/server";
import { getRecipe, getRecipes } from "@/data/data";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  console.log("🧪 Debug API called with slug:", slug);

  try {
    if (slug) {
      console.log("🔍 Testing getRecipe with slug:", slug);
      const recipe = await getRecipe(slug);
      return NextResponse.json({
        success: true,
        recipe,
        found: !!recipe,
        title: recipe?.title || "Not found",
      });
    } else {
      console.log("🧪 Getting all recipes...");
      const recipes = await getRecipes();
      return NextResponse.json({
        success: true,
        totalRecipes: recipes.length,
        firstFewSlugs: recipes.slice(0, 5).map((r) => r.slug),
        message: "Test completed - check console logs",
      });
    }
  } catch (error) {
    console.error("❌ Debug API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
