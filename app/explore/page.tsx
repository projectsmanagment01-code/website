import React from "react";
import Image from "next/image";
import { Recipe } from "@/outils/types";
import { notFound } from "next/navigation";
import { getRecipesPaginated } from "@/data/data";
import Link from "next/link";

// Force static generation
const getOptimizedImageUrl = (
  src: string,
  width: number,
  quality = 85,
  format = "webp"
) => {
  // Remove existing query parameters
  const cleanSrc = src.split("?")[0];
  return `${cleanSrc}?w=${width}&q=${quality}&f=${format}`;
};

const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col shadow-sm">
      {/* Smaller image height */}
      <a
        href={"/recipes/" + recipe.slug}
        className="block w-full h-40 overflow-hidden"
      >
        <Image
          src={recipe.img || recipe.heroImage}
          alt={recipe.imageAlt || recipe.title}
          width={200}
          height={160}
          sizes="(min-width: 768px) calc((100vw - 6rem) / 3), (min-width: 640px) calc((100vw - 4rem) / 2), calc(100vw - 2rem)"
          className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
        />
      </a>

      <div className="flex flex-col flex-1 gap-2 p-3">
        <a href={"/recipes/" + recipe.slug} className="block">
          <h3 className="text-base font-semibold text-black hover:text-gray-700 transition-colors line-clamp-1">
            {recipe.title}
          </h3>
        </a>

        {/* Limit description length */}
        <p className="text-gray-600 text-sm leading-snug line-clamp-2">
          {recipe.shortDescription || recipe.description}
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

const Pagination = ({
  currentPage = 1,
  totalPages = 311,
  basePath = "/explore",
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
      <ul className="flex gap-2 list-none p-0 m-0 text-sm">
        {/* First Arrow */}
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

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          <li key={index} className="flex">
            {page === "..." ? (
              <span className="px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 block">
                ...
              </span>
            ) : page === currentPage ? (
              <span className="px-3 py-2 rounded-2xl bg-gray-200 text-gray-600 cursor-not-allowed block">
                {page}
              </span>
            ) : (
              <Link
                href={`${basePath}?page=${page}`}
                className="px-3 py-2 rounded-2xl bg-black text-white hover:bg-gray-800 transition-colors block"
              >
                {page}
              </Link>
            )}
          </li>
        ))}

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

        {/* Last Arrow */}
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

// Update the Page component to use searchParams
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
    <>
      <div className="container-lg section-md">
        <main>
          <Explore
            recipes={paginatedRecipes}
            currentPage={currentPage}
            totalPages={pagination.totalPages}
          />
        </main>
      </div>
    </>
  );
}

// Update Explore component to accept pagination props
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className=" xl mx-auto">
        <h2
          className="my-3 text-neutral-900 text-[24.96px] font-bold items-center box-border flex basis-[0%] grow leading-[29.952px] md:text-[36.48px] md:leading-[43.776px] after:accent-auto after:bg-zinc-200 after:box-border after:text-neutral-900 after:block after:basis-[0%] after:grow after:text-[24.96px] after:not-italic after:normal-nums after:font-bold after:h-1.5 after:tracking-[normal] after:leading-[29.952px] after:list-outside after:list-disc after:min-w-4 after:outline-dashed after:outline-1 after:text-start after:indent-[0px] after:uppercase after:visible after:w-full after:ml-4 after:rounded-lg after:border-separate after:font-system_ui after:md:text-[36.48px] after:md:leading-[43.776px]
                          before:bg-zinc-200 before:box-border before:text-neutral-900 before:block before:basis-[0%] before:grow before:text-[24.96px] before:not-italic before:normal-nums before:font-bold before:h-1.5 before:tracking-[normal] before:leading-[29.952px] before:list-outside before:list-disc before:min-w-4 before:outline-dashed before:outline-1 before:text-start before:indent-[0px] before:uppercase before:visible before:w-full before:ml-4 before:rounded-lg before:border-separate before:font-system_ui before:md:text-[36.48px] before:md:leading-[43.776px]
          "
        >
          {" "}
          Recipe Cards
        </h2>

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
          basePath="/explore"
        />
      </div>
    </div>
  );
}
