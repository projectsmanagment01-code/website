import { RecipeContent } from "@/components/RecipeContent";
import { RecipeHero } from "@/components/RecipeHero";
import { RelatedRecipes } from "@/components/RelatedRecipes";
import Side from "@/components/Side";

import { getRecipe } from "@/data/data";
import { notFound } from "next/navigation";

export default async function Layout({ children }: { children: any }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="bg-stone-100 grid grid-cols-1 lg:grid-cols-6 w-full gap-8 w-full  px-4 py-8">
          {/* Main Content */}
          <div className="lg:col-span-1 "></div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-8">
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8"></div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
