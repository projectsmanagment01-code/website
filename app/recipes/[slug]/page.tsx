// Force static generation for maximum performance
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

import { RecipeContent } from "@/components/RecipeContent";
import { notFound } from "next/navigation";
import { getRecipe, getRecipes, getRelated } from "@/data/data";
import Side from "@/components/Side";
import ViewTracker from "@/components/ViewTracker";
import BackToTop from "@/components/BackToTop";
import Recipe from "@/outils/types";
import SidebarWrapper from "@/components/main/SidebarWrapper";

export default async function RecipePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const recipe = (await getRecipe(slug)) as any;

  if (!recipe) return notFound();

  // Fetch related recipes with error handling - Limited to 3 for sidebar
  let relatedRecipes: Recipe[] = [];
  try {
    relatedRecipes = await getRelated(recipe.id, 4); // Reduced from 6 to 3
  } catch (error) {
    console.error("❌ Failed to fetch related recipes:", error);
    // Continue with empty array - the Side component will handle it
  }

  return (
    <>
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
  const recipes = await getRecipes();

  return (
    recipes?.map((recipe) => ({
      slug: recipe.slug,
    })) || []
  );
}
