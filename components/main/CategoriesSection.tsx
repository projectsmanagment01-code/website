// SERVER COMPONENT - Fast, cached, SEO-friendly
// Revalidates on-demand when admin saves categories

import React from "react";
import { Category } from "@/outils/types";
import Image from "next/image";

interface CategoriesSectionProps {
  className?: string;
}

// Server-side data fetching with ISR + on-demand revalidation
async function getCategories(): Promise<Category[]> {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/categories`, {
      next: { 
        revalidate: 3600, // Cache for 1 hour
        tags: ['categories'] // Tag for on-demand revalidation
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    console.error('Failed to load categories:', response.status);
    return [];
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return [];
  }
}

export default async function CategoriesSection({
  className,
}: CategoriesSectionProps) {
  const categories = await getCategories();

  // No categories fallback
  if (categories.length === 0) {
    return (
      <section className={`py-12 ${className || ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-12">
            <div className="flex-grow h-px bg-gray-300"></div>
            <h2 className="px-6 text-2xl md:text-3xl font-bold text-gray-900">
              Categories
            </h2>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Categories are being prepared...</p>
            <p className="text-sm text-gray-500">Check back soon for recipe categories!</p>
          </div>
        </div>
      </section>
    );
  }

  const displayCategories = categories;

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
                  onError={(e) => {
                    console.error('Failed to load category image:', category.title, category.image);
                  }}
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
                  onError={(e) => {
                    console.error('Failed to load category image:', category.title, category.image);
                  }}
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
