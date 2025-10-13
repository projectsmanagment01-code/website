import React from "react";
import Image from "next/image";
import { Recipe } from "@/outils/types";
import { notFound } from "next/navigation";
import { getRecipesPaginated } from "@/data/data";
import Link from "next/link";

const Pagination = ({
  currentPage = 1,
  totalPages = 311,
  basePath = "/recipes",
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Calculate page numbers to show
  const getPageNumbers = () => {
    let pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis after page 1 if needed
      if (startPage > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className="flex justify-center mt-8">
      <ul className="flex gap-1 sm:gap-2 list-none p-0 m-0 text-xs sm:text-sm">
        {/* First Arrow - Hidden on mobile */}
        <li className="hidden sm:flex">
          {isFirstPage ? (
            <span className="px-2 sm:px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
              «
            </span>
          ) : (
            <Link
              href={`${basePath}?page=1`}
              className="px-2 sm:px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              «
            </Link>
          )}
        </li>

        {/* Previous */}
        <li className="flex">
          {isFirstPage ? (
            <span className="px-2 sm:px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">‹</span>
            </span>
          ) : (
            <Link
              href={`${basePath}?page=${currentPage - 1}`}
              className="px-2 sm:px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">‹</span>
            </Link>
          )}
        </li>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          <li key={index} className="flex">
            {page === "..." ? (
              <span className="px-2 sm:px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 block">
                ...
              </span>
            ) : page === currentPage ? (
              <span className="px-2 sm:px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
                {page}
              </span>
            ) : (
              <Link
                href={`${basePath}?page=${page}`}
                className="px-2 sm:px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
              >
                {page}
              </Link>
            )}
          </li>
        ))}

        {/* Next */}
        <li className="flex">
          {isLastPage ? (
            <span className="px-2 sm:px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">›</span>
            </span>
          ) : (
            <Link
              href={`${basePath}?page=${currentPage + 1}`}
              className="px-2 sm:px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">›</span>
            </Link>
          )}
        </li>

        {/* Last Arrow - Hidden on mobile */}
        <li className="hidden sm:flex">
          {isLastPage ? (
            <span className="px-2 sm:px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
              »
            </span>
          ) : (
            <Link
              href={`${basePath}?page=${totalPages}`}
              className="px-2 sm:px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              »
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
};

// Force static generation

const RecipeCard = ({ recipe, index }: { recipe: Recipe; index: number }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col shadow-sm">
      {/* Responsive image height */}
      <Link
        href={"/recipes/" + recipe.slug}
        className="block w-full h-40 sm:h-48 overflow-hidden"
      >
        <Image
          src={recipe.img || recipe.heroImage}
          alt={recipe.imageAlt || recipe.title}
          width={200}
          height={160}
          quality={75}
          priority={index < 6} // Prioritize first 6 images
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
        />
      </Link>

      <div className="flex flex-col flex-1 gap-2 p-3 sm:p-4">
        <Link href={"/recipes/" + recipe.slug} className="block">
          <h3 className="text-sm sm:text-base font-semibold text-black hover:text-gray-700 transition-colors line-clamp-2 sm:line-clamp-1">
            {recipe.title}
          </h3>
        </Link>

        {/* Responsive description */}
        <p className="text-gray-600 text-xs sm:text-sm leading-snug line-clamp-2 sm:line-clamp-3">
          {recipe.description}
        </p>
      </div>

      <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex gap-2 sm:gap-3 flex-wrap text-xs">
        <a
          href={"/recipes/" + recipe.slug}
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
}: {
  recipes: Recipe[];
  currentPage: number;
  totalPages: number;
}) {
  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
          Recipe Cards
        </h1>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {recipes.map((recipe: Recipe, index: number) => (
            <RecipeCard recipe={recipe} index={index} key={index} />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/recipes"
        />
      </div>
    </div>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const pageSize = 9; // Show 9 recipes per page

  const { recipes: paginatedRecipes, pagination } = await getRecipesPaginated(
    currentPage,
    pageSize
  );

  if (!paginatedRecipes) {
    notFound();
  }

  return (
    <div className="page-content">
      {/* Recipes Section - Wide but with max-width */}
      <div className="container-wide section-md">
        <main>
          <Explore
            recipes={paginatedRecipes}
            currentPage={currentPage}
            totalPages={pagination.totalPages}
          />
        </main>
      </div>
    </div>
  );
}
