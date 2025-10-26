export const dynamic = "force-static";

import React from "react";
import { Recipe } from "@/outils/types";
import { notFound } from "next/navigation";
import { getCategories, getRecipesByCategory } from "@/data/data";
import Link from "next/link";
import ExploreWithPagination from "@/components/ExploreWithPagination";
import AdSlot from "@/components/ads/AdSlot";

const Pagination = ({ currentPage = 1, totalPages = 311, basePath = "" }) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav className="flex justify-center mt-8">
      <ul className="flex gap-2 list-none p-0 m-0 text-sm">
        {/* First / Previous Arrow */}
        <li className="flex">
          {isFirstPage ? (
            <span className="px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
              «
            </span>
          ) : (
            <Link
              href={`${basePath}?page=1`}
              className="px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              «
            </Link>
          )}
        </li>

        {/* Previous */}
        <li className="flex">
          {isFirstPage ? (
            <span className="px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
              Previous
            </span>
          ) : (
            <Link
              href={`${basePath}?page=${currentPage - 1}`}
              className="px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              Previous
            </Link>
          )}
        </li>

        {/* Current Page */}
        <li className="flex">
          <span className="px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
            {currentPage}
          </span>
        </li>

        {/* Next */}
        <li className="flex">
          {isLastPage ? (
            <span className="px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
              Next
            </span>
          ) : (
            <Link
              href={`${basePath}?page=${currentPage + 1}`}
              className="px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              Next
            </Link>
          )}
        </li>

        {/* Last / Next Arrow */}
        <li className="flex">
          {isLastPage ? (
            <span className="px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
              »
            </span>
          ) : (
            <Link
              href={`${basePath}?page=${totalPages}`}
              className="px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              »
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
};

const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col shadow-sm">
      {/* Smaller image height */}
      <Link
        href={"/recipes/" + recipe.slug}
        className="block w-full h-40 overflow-hidden"
      >
        <img
          src={recipe.img || recipe.heroImage}
          alt={recipe.imageAlt || recipe.title}
          className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
        />
      </Link>

      <div className="flex flex-col flex-1 gap-2 p-3">
        <Link href={"/recipes/" + recipe.slug} className="block">
          <h3 className="text-base font-semibold text-black hover:text-gray-700 transition-colors line-clamp-1">
            {recipe.title}
          </h3>
        </Link>

        {/* Limit description length */}
        <p className="text-gray-600 text-sm leading-snug line-clamp-2">
          {recipe.description}
        </p>
      </div>

      <div className="px-3 pb-3 flex gap-3 flex-wrap text-xs">
        <a
          href={recipe.href}
          className="text-green-700 font-semibold hover:text-green-500 transition-colors"
        >
          Make 'em
        </a>
        <a
          href={recipe.categoryHref}
          className="text-green-700 font-semibold hover:text-green-500 transition-colors"
        >
          {recipe.category}
        </a>
      </div>
    </div>
  );
};

function Explore({
  recipes,
  currentPage,
  totalPages,
  basePath,
}: {
  recipes: Recipe[];
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className=" xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Recipe Cards
        </h1>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe: Recipe, index: number) => (
            <RecipeCard recipe={recipe} key={index} />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={basePath}
        />
      </div>
    </div>
  );
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const allRecipes = (await getRecipesByCategory(slug)) as Recipe[];

  if (!allRecipes || allRecipes.length === 0) {
    notFound();
  }

  // Pass all recipes to client component for pagination
  return (
    <>
      <div className="container-lg section-md">
        {/* Ad at top of category page */}
        <AdSlot placement="category_top" className="my-8" />
        
        <main>
          <ExploreWithPagination
            recipes={allRecipes}
            basePath={`/categories/${slug}`}
          />
        </main>
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
