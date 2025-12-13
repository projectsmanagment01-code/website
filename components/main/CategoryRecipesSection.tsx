import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Recipe, Category } from "@/outils/types";
import { getCategories, getRecipesByCategory } from "@/data/data";
import { ArrowRight } from "lucide-react";

interface CategoryRecipesSectionProps {
  className?: string;
  recipesPerCategory?: number;
  maxCategories?: number;
}

interface CategoryWithRecipes {
  category: Category;
  recipes: Recipe[];
}

async function getCategoriesWithRecipes(
  recipesPerCategory: number = 5,
  maxCategories: number = 4
): Promise<CategoryWithRecipes[]> {
  try {
    const categories = await getCategories();
    
    const categoriesWithRecipes = await Promise.all(
      categories.map(async (category) => {
        const recipes = await getRecipesByCategory(category.slug, recipesPerCategory);
        return { category, recipes };
      })
    );

    return categoriesWithRecipes
      .filter((item) => item.recipes.length > 0)
      .slice(0, maxCategories);
  } catch (error) {
    console.error("Failed to fetch categories with recipes:", error);
    return [];
  }
}

export default async function CategoryRecipesSection({
  className,
  recipesPerCategory = 5,
  maxCategories = 4,
}: CategoryRecipesSectionProps) {
  const categoriesWithRecipes = await getCategoriesWithRecipes(
    recipesPerCategory,
    maxCategories
  );

  if (categoriesWithRecipes.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 ${className || ""}`}>
      {/* Section Header */}
      <div className="flex items-center justify-center mb-10">
        <div className="flex-grow h-px bg-gray-300"></div>
        <h2 className="px-6 text-2xl md:text-3xl font-bold text-gray-900 uppercase">
          Recipes by Category
        </h2>
        <div className="flex-grow h-px bg-gray-300"></div>
      </div>

      {/* Categories */}
      <div className="space-y-16">
        {categoriesWithRecipes.map(({ category, recipes }, index) => {
          const isReversed = index % 2 === 1;
          
          return (
            <div key={category.slug}>
              {/* Category Row */}
              <div className={`flex flex-col lg:flex-row gap-6 ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
                {/* Featured Recipe - Large */}
                {recipes[0] && (
                  <div className="lg:w-1/2">
                    <Link
                      href={`/recipes/${recipes[0].slug}`}
                      className="group block relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden"
                    >
                      <Image
                        src={recipes[0].img || recipes[0].heroImage || "/placeholder-recipe.jpg"}
                        alt={recipes[0].imageAlt || recipes[0].title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Category Label */}
                      <div className="absolute top-4 left-4">
                        <Link 
                          href={category.href}
                          className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-semibold text-stone-900 hover:bg-stone-100 transition-colors"
                        >
                          {category.title}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Recipe Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-stone-200 transition-colors">
                          {recipes[0].title}
                        </h3>
                        {recipes[0].timing?.totalTime && (
                          <span className="text-white/80 text-sm">
                            {recipes[0].timing.totalTime}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                )}

                {/* Other Recipes - Grid */}
                <div className="lg:w-1/2">
                  <div className="grid grid-cols-2 gap-4 h-full">
                    {recipes.slice(1, 5).map((recipe) => (
                      <Link
                        key={recipe.slug}
                        href={`/recipes/${recipe.slug}`}
                        className="group relative rounded-xl overflow-hidden aspect-square"
                      >
                        <Image
                          src={recipe.img || recipe.heroImage || "/placeholder-recipe.jpg"}
                          alt={recipe.imageAlt || recipe.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h4 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-stone-200 transition-colors">
                            {recipe.title}
                          </h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="text-center mt-12">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-stone-800 transition-colors"
        >
          Browse All Categories
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
