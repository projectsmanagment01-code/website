import React from "react";
import Image from "next/image";
import { Recipe } from "../../outils/types"; // Adjust path as needed
import { getTrending } from "@/data/data";

interface TrendingSectionProps {
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

export default async function TrendingSection({
  className,
  limit = 8,
}: TrendingSectionProps) {
  let trendingRecipes: Recipe[] = [];
  let hasError = false;

  try {
    trendingRecipes = await getTrending(limit);
  } catch (err) {
    console.error("Failed to fetch trending recipes:", err);
    hasError = true;
    // In production, you might want to show a fallback or empty state
    // For now, we'll show an empty array
    trendingRecipes = [];
  }

  // Don't render the section if there are no recipes and there's an error
  if (hasError && trendingRecipes.length === 0) {
    return null; // or return a fallback UI
  }

  // Don't render if no recipes available
  if (trendingRecipes.length === 0) {
    return null;
  }

  return (
    <section className={`box-border my-[12.8px] ${className || ""}`}>
      <div className="relative box-border max-w-full w-full mx-auto px-4">
        <div className="box-border gap-x-[12.8px] flex flex-col gap-y-[12.8px]">
          {/* Section Title with horizontal lines */}
          <div className="flex items-center justify-center">
            <div className="flex-grow h-px bg-gray-300"></div>
            <h2 className="px-6 text-2xl md:text-3xl font-bold text-gray-900 uppercase">
              Trending
            </h2>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          <div className="box-border gap-x-[25.6px] grid lg:grid-cols-[repeat(4,1fr)]  lx:grid-cols-[repeat(4,1fr)]  gap-y-[25.6px] sm:grid-cols-[repeat(2,1fr)] md:grid-cols-[repeat(4,1fr)]">
            {trendingRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="items-center box-border gap-x-2 flex flex-col col-start-[span_1] gap-y-2 text-center overflow-hidden group"
              >
                <a
                  href={
                    recipe.slug
                      ? `/recipes/${recipe.slug}`
                      : `/recipe/${recipe.id}`
                  }
                  title={recipe.title}
                  className="text-blue-700 bg-stone-100 box-border block aspect-[3/4] transform transition-transform duration-300 w-full overflow-hidden rounded-[14px] group-hover:scale-105 shadow-lg shadow-gray-800/30 relative border-[0.5px] border-dashed border-black"
                >
                  <Image
                    alt={recipe.imageAlt || recipe.title}
                    src={recipe.img || recipe.heroImage}
                    fill
                    sizes="(min-width: 1024px) calc((100vw - 8rem) / 4), (min-width: 768px) calc((100vw - 6rem) / 3), (min-width: 640px) calc((100vw - 4rem) / 2), calc(100vw - 2rem)"
                    className="transition-transform duration-300 object-cover group-hover:scale-110"
                    loading="lazy"
                    quality={100}
                  />
                </a>

                <a
                  href={recipe.href || `/recipe/${recipe.slug || recipe.id}`}
                  title={recipe.title}
                  className="text-blue-700 box-border block"
                >
                  <strong
                    style={{
                      textShadow:
                        "-1px -1px 0 #f6f5f3, 1px -1px 0 #f6f5f3, -1px 1px 0 #f6f5f3, 1px 1px 0 #f6f5f3",
                    }}
                    className="text-black text-[15.36px] font-bold box-border block leading-[21.504px] md:text-[19.2px] md:leading-[26.88px]"
                  >
                    {recipe.title}
                  </strong>
                </a>
              </div>
            ))}
          </div>

          <div className="box-border">
            <div className="fixed box-border flex justify-center z-[16777271] bottom-0 inset-x-0">
              <div className="relative box-border table mx-auto">
                <div className="items-center box-border gap-x-[5px] flex justify-center gap-y-[5px] w-full">
                  <div className="items-center box-border gap-x-[5px] flex flex-col justify-center gap-y-[5px]">
                    <div className="box-border">
                      <div className="box-border h-0 w-80"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
