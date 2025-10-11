import React from "react";
import { Recipe } from "@/outils/types";
import { notFound } from "next/navigation";
import { getCategories, getRecipesByCategory } from "@/data/data";
import ExploreWithPagination from "@/components/ExploreWithPagination";

// Force static generation
export const dynamic = "force-static";

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const allRecipes = (await getRecipesByCategory(slug)) as Recipe[];

  if (!allRecipes || allRecipes.length === 0) {
    notFound();
  }

  // Pass all recipes to client component for pagination
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {/* Left sidebar content can go here */}
          </div>
        </div>

        {/* Explore Content - Middle */}
        <div className="lg:col-span-4">
          <div className="sticky top-8">
            <ExploreWithPagination
              recipes={allRecipes}
              basePath={`/categories/${slug}`}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {/* Right sidebar content can go here */}
          </div>
        </div>
      </div>
    </>
  );
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories();

    const params = categories
      .map((category) => {
        if (!category || !category.slug || typeof category.slug !== "string") {
          console.error("Invalid category for static params:", category);
          return null;
        }

        return {
          slug: category.slug,
        };
      })
      .filter(Boolean); // Remove null entries

    return params;
  } catch (error) {
    return []; // Return empty array on error
  }
}
