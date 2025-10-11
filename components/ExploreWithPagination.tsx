"use client";

import React, { useState } from "react";
import { Recipe } from "@/outils/types";
import Link from "next/link";
import Image from "next/image";

const Pagination = ({
  currentPage = 1,
  totalPages = 311,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
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
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              «
            </button>
          )}
        </li>

        {/* Previous */}
        <li className="flex">
          {isFirstPage ? (
            <span className="px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
              Previous
            </span>
          ) : (
            <button
              onClick={() => onPageChange(currentPage - 1)}
              className="px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              Previous
            </button>
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
            <button
              onClick={() => onPageChange(currentPage + 1)}
              className="px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              Next
            </button>
          )}
        </li>

        {/* Last / Next Arrow */}
        <li className="flex">
          {isLastPage ? (
            <span className="px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
              »
            </span>
          ) : (
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
            >
              »
            </button>
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
        <Image
          width={400}
          height={160}
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
        <Link
          href={recipe.href}
          className="text-green-700 font-semibold hover:text-green-500 transition-colors"
        >
          {recipe.category}
        </Link>
        <span className="text-gray-500">•</span>
        <span className="text-gray-500">
          {recipe.timing?.totalTime || "N/A"}
        </span>
        {recipe.author?.name && (
          <>
            <span className="text-gray-500">•</span>
            <Link
              href={`/authors/${recipe.author.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-orange-600 font-medium hover:text-orange-700 transition-colors"
            >
              {recipe.author.name}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default function ExploreWithPagination({
  recipes,
  basePath,
}: {
  recipes: Recipe[];
  basePath: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // Show 9 recipes per page

  // Calculate total pages
  const totalPages = Math.ceil(recipes.length / pageSize);

  // Get current page of recipes
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecipes = recipes.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Optionally update URL without page reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("page", page.toString());
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className=" xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Recipe Cards
        </h1>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRecipes.map((recipe: Recipe, index: number) => (
            <RecipeCard recipe={recipe} key={index} />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
