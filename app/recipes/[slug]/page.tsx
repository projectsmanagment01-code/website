// Force static generation for maximum performance
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

import { RecipeContent } from "@/components/RecipeContent";
import { notFound } from "next/navigation";
import { getRecipeBySlug, getRelatedRecipes } from "@/lib/recipe-server";
import Side from "@/components/Side";
import ViewTracker from "@/components/ViewTracker";
import BackToTop from "@/components/BackToTop";
import Recipe from "@/outils/types";
import SidebarWrapper from "@/components/main/SidebarWrapper";
import RecipeSchema from "@/components/RecipeSchema";

export default async function RecipePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  
  // Use server-side data fetching (no HTTP calls during build)
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) return notFound();

  // Fetch related recipes with error handling - Limited to 4 for sidebar
  let relatedRecipes: Recipe[] = [];
  try {
    relatedRecipes = await getRelatedRecipes(recipe.id, 4);
  } catch (error) {
    console.error("❌ Failed to fetch related recipes:", error);
    // Continue with empty array - the Side component will handle it
  }

  return (
    <>
      {/* Schema.org structured data for Google */}
      <RecipeSchema recipe={recipe} />
      
      <div className="container-wide section-md">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8" data-sidebar-container>
          {/* Main Content */}
          <main className="lg:col-span-7">
            <ViewTracker recipeId={recipe.id} />
            <RecipeContent recipe={recipe} />
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <Side recipe={recipe} relatedRecipes={relatedRecipes} />
          </aside>
        </div>
      </div>
      
      {/* Back to Top Button */}
      <BackToTop />
    </>
  );
}

export async function generateStaticParams() {
  const { getAllRecipeSlugs } = await import("@/lib/recipe-server");
  const slugs = await getAllRecipeSlugs();

  return slugs.map((slug) => ({
    slug: slug,
  }));
}
