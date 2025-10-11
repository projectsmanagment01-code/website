import React from "react";
import Recipe from "@/outils/types";
import { getLatest } from "@/data/data";
import Image from "next/image";

interface LatestRecipesSectionProps {
  className?: string;
  limit?: number;
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
export default async function LatestRecipesSection({
  className,
  limit = 8,
}: LatestRecipesSectionProps) {
  let latestRecipes: Recipe[] = [];
  let hasError = false;

  try {
    latestRecipes = await getLatest(limit);
  } catch (err) {
    console.error("Failed to fetch trending recipes:", err);
    hasError = true;
    // In production, you might want to show a fallback or empty state
    // For now, we'll show an empty array
    latestRecipes = [];
  }

  // Don't render the section if there are no recipes and there's an error
  if (hasError && latestRecipes.length === 0) {
    return null; // or return a fallback UI
  }

  // Don't render if no recipes available
  if (latestRecipes.length === 0) {
    return null;
  }

  return (
    <section className={`box-border my-[51.2px] ${className || ""}`}>
      <div className="relative box-border max-w-full w-full mx-auto px-4">
        <div className="box-border gap-x-[51.2px] flex flex-col gap-y-[51.2px]">
          {/* Section Title with horizontal lines */}
          <div className="flex items-center justify-center">
            <div className="flex-grow h-px bg-gray-300"></div>
            <h2 className="px-6 text-2xl md:text-3xl font-bold text-gray-900 uppercase">
              Latest Recipes
            </h2>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          <div className="box-border gap-x-[25.6px] grid grid-cols-[1fr] gap-y-[25.6px] xl:grid-cols-[repeat(4,1fr)] lg:grid-cols-[repeat(4,1fr)] md:grid-cols-[repeat(4,1fr)]">
            {latestRecipes.map((recipe) => (
              <div
                key={recipe.id || recipe.slug}
                className=" text-gray-700  hover:text-red-700 items-center box-border gap-x-2 flex flex-col col-start-[span_1] gap-y-2 text-center overflow-hidden group"
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
                    alt={recipe.title || recipe.imageAlt || "Recipe Image"}
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
                          "-1px -1px 0 #f6f5f3, 1px -1px 0 #f6f5f3, -1px 1px 0 #f6f5f3, 1px 1px 0 #f6f5f3",
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
        </div>
      </div>
    </section>
  );
}
