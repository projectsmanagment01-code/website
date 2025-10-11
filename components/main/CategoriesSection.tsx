import React from "react";
import { getCategories } from "@/data/data";
import { Category } from "@/outils/types";
import { categories } from "@/data/categories";
import Icon from "@/components/Icon";
import Image from "next/image";

interface CategoriesSectionProps {
  className?: string;
}

const getOptimizedImageUrl = (
  src: string,
  width: number,
  quality = 65,
  format = "webp"
) => {
  // Remove existing query parameters
  const cleanSrc = src.split("?")[0];
  return `${cleanSrc}?w=${width}&q=${quality}&f=${format}`;
};

export default async function CategoriesSection({
  className,
}: CategoriesSectionProps) {
  let _categories: Category[] = [];
  let hasError = false;

  try {
    _categories = await getCategories();
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    hasError = true;
    // Try to load fallback static categories
    try {
      _categories = categories || [];
    } catch (fallbackErr) {
      console.error("Failed to load fallback categories:", fallbackErr);
      _categories = [];
    }
  }

  // If we still have no categories, provide a minimal fallback
  if (_categories.length === 0) {
    console.warn("No categories found, showing fallback message");
    return (
      <section className={`py-12 ${className || ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title with horizontal lines */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex-grow h-px bg-gray-300"></div>
            <h2 className="px-6 text-2xl md:text-3xl font-bold text-gray-900">
              Categories
            </h2>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Fallback message */}
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Categories are being prepared...</p>
            <p className="text-sm text-gray-500">Check back soon for recipe categories!</p>
          </div>
        </div>
      </section>
    );
  }

  // Remove the limit - show all categories
  const displayCategories = _categories;

  return (
    <section className={`py-12 ${className || ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title with horizontal lines */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex-grow h-px bg-gray-300"></div>
          <h2 className="px-6 text-2xl md:text-3xl font-bold text-gray-900">
            Categories
          </h2>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Desktop Layout - 4 categories per row, centered when less than 4 */}
        <div className="hidden md:flex flex-wrap justify-center items-center gap-8 max-w-6xl mx-auto">
          {displayCategories.map((category, index) => (
            <a
              key={category.slug}
              href={category.href}
              title={category.title}
              className="group flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 w-auto"
              style={{ flexBasis: "calc(25% - 2rem)", maxWidth: "200px" }}
            >
              <div className="relative w-36 h-36 lg:w-48 lg:h-48 mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300 border-[0.5px] border-dashed border-black">
                <Image
                  alt={category.alt}
                  src={category.image}
                  fill
                  sizes="(min-width: 1024px) 192px, 144px"
                  quality={100}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="text-sm lg:text-base font-semibold text-gray-900 text-center leading-tight max-w-[150px] group-hover:text-orange-600 transition-colors duration-300">
                {category.title}
              </h3>
            </a>
          ))}
        </div>

        {/* Mobile Layout - 2 categories per row, centered when less than 2 */}
        <div className="md:hidden flex flex-wrap justify-center items-center gap-6 max-w-sm mx-auto">
          {displayCategories.map((category, index) => (
            <a
              key={category.slug}
              href={category.href}
              title={category.title}
              className="group flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 w-auto"
              style={{ flexBasis: "calc(50% - 1.5rem)", maxWidth: "120px" }}
            >
              <div className="relative w-30 h-30 mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300 border-[0.5px] border-dashed border-black">
                <Image
                  alt={category.alt}
                  src={category.image}
                  fill
                  sizes="120px"
                  quality={100}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 text-center leading-tight max-w-[120px] group-hover:text-orange-600 transition-colors duration-300">
                {category.title}
              </h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
