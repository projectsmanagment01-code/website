'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Recipe from '@/outils/types';

interface LatestRecipesWithPaginationProps {
  initialRecipes: Recipe[];
  initialTotal: number;
  recipesPerPage?: number;
}

export default function LatestRecipesWithPagination({
  initialRecipes,
  initialTotal,
  recipesPerPage = 8,
}: LatestRecipesWithPaginationProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(totalRecipes / recipesPerPage);

  useEffect(() => {
    if (currentPage === 1) {
      setRecipes(initialRecipes);
      return;
    }

    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/recipe?page=${currentPage}&limit=${recipesPerPage}`
        );
        const data = await response.json();
        setRecipes(data.recipes || []);
        setTotalRecipes(data.pagination?.total || 0);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [currentPage, recipesPerPage, initialRecipes]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      // Scroll to the Latest Recipes title
      setTimeout(() => {
        const titleElement = document.getElementById('latest-recipes-title');
        if (titleElement) {
          const yOffset = -20; // Small offset to show above the title
          const y = titleElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const getVisiblePages = () => {
    const delta = 1;
    const range: (number | string)[] = [];

    // Always show first page
    range.push(1);

    // Calculate range around current page
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      // Add dots if there's a gap
      if (i === Math.max(2, currentPage - delta) && i > 2) {
        range.push('...');
      }
      range.push(i);
      // Add dots if there's a gap
      if (i === Math.min(totalPages - 1, currentPage + delta) && i < totalPages - 1) {
        range.push('...');
      }
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Remove duplicate dots
    return range.filter((value, index, array) => {
      if (value === '...') {
        return array[index - 1] !== '...';
      }
      return true;
    });
  };

  const visiblePages = totalPages <= 7 ? Array.from({ length: totalPages }, (_, i) => i + 1) : getVisiblePages();

  return (
    <section id="latest-recipes-section" className="box-border my-[51.2px]">
      <div className="relative box-border max-w-full w-full mx-auto px-4">
        <div className="box-border gap-x-[51.2px] flex flex-col gap-y-[51.2px]">
          {/* Section Title with horizontal lines */}
          <div id="latest-recipes-title" className="flex items-center justify-center">
            <div className="flex-grow h-px bg-gray-300"></div>
            <h2 className="px-6 text-2xl md:text-3xl font-bold text-gray-900 uppercase">
              Latest Recipes
            </h2>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          )}

          {/* Recipes Grid */}
          {!loading && (
            <div className="box-border gap-x-[25.6px] grid grid-cols-1 gap-y-[25.6px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id || recipe.slug}
                  className="text-gray-700 hover:text-red-700 items-center box-border gap-x-2 flex flex-col gap-y-2 text-center overflow-hidden group"
                >
                  <a
                    href={
                      recipe.slug
                        ? `/recipes/${recipe.slug}`
                        : `/recipe/${recipe.id}`
                    }
                    title={recipe.title}
                    className="text-blue-700 bg-stone-100 box-border block aspect-[3/4] w-full overflow-hidden transform transition-transform duration-300 rounded-[14px] group-hover:scale-105 shadow-lg shadow-gray-800/30 relative border-[0.5px] border-dashed border-black"
                  >
                    <Image
                      alt={recipe.title || recipe.imageAlt || 'Recipe Image'}
                      src={recipe.img || recipe.heroImage}
                      fill
                      sizes="(min-width: 1024px) calc((100vw - 8rem) / 4), (min-width: 768px) calc((100vw - 6rem) / 3), (min-width: 640px) calc((100vw - 4rem) / 2), calc(100vw - 2rem)"
                      quality={100}
                      className="transition-transform duration-300 object-cover group-hover:scale-110"
                    />
                  </a>

                  <div className="flex flex-col items-center min-h-[4rem] justify-center">
                    <a
                      href={recipe.href}
                      title={recipe.title}
                      className="box-border block"
                    >
                      <strong
                        style={{
                          textShadow:
                            '-1px -1px 0 #f6f5f3, 1px -1px 0 #f6f5f3, -1px 1px 0 #f6f5f3, 1px 1px 0 #f6f5f3',
                        }}
                        className="text-md font-bold box-border block leading-[21.504px] md:leading-[26.88px] text-center"
                      >
                        {recipe.title}
                      </strong>
                    </a>
                  </div>

                  <p
                    className="text-[13.44px] text-gray-900 box-border leading-[21.504px] md:text-[17.28px] md:leading-[27.648px] px-2 text-center line-clamp-3 flex-1"
                    dangerouslySetInnerHTML={{ __html: recipe.description }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Stylish Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 mt-8">
              {/* Page Info */}
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * recipesPerPage + 1} to{' '}
                {Math.min(currentPage * recipesPerPage, totalRecipes)} of{' '}
                {totalRecipes} recipes
              </p>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-500 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-all duration-200"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {visiblePages.map((page, index) => {
                    if (page === '...') {
                      return (
                        <span
                          key={`dots-${index}`}
                          className="px-3 py-2 text-gray-500"
                        >
                          ...
                        </span>
                      );
                    }

                    const pageNum = page as number;
                    const isActive = pageNum === currentPage;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`
                          min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                          ${
                            isActive
                              ? 'bg-red-600 text-white shadow-md scale-110 border-2 border-red-600'
                              : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-red-50 hover:border-red-500 hover:text-red-600 hover:scale-105'
                          }
                        `}
                        aria-label={`Page ${pageNum}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-500 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-all duration-200"
                  aria-label="Next page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Quick Jump (optional, shown only on desktop) */}
              {totalPages > 5 && (
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Jump to:</span>
                  <select
                    value={currentPage}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                    className="px-3 py-1 border-2 border-gray-300 rounded-lg text-gray-700 hover:border-red-500 focus:outline-none focus:border-red-500 transition-colors"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <option key={page} value={page}>
                          Page {page}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
