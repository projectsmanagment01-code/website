import React from "react";
import { Article, Recipe } from "@/outils/types";
import { getLatestArticles } from "@/data/data";
import latestArticles from "@/data/articles";

interface LatestArticlesSectionProps {
  className?: string;
  limit: number;
}

export default async function LatestArticlesSection({
  className,
  limit = 4,
}: LatestArticlesSectionProps) {
  let latestRecipes: Article[] = [];
  let hasError = false;

  try {
    latestRecipes = await getLatestArticles();
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
          <div className="items-center box-border flex justify-between uppercase">
            <h2 className="text-neutral-900 text-[24.96px] font-bold items-center box-border flex basis-[0%] grow leading-[29.952px] md:text-[36.48px] md:leading-[43.776px] after:accent-auto after:bg-zinc-200 after:box-border after:text-neutral-900 after:block after:basis-[0%] after:grow after:text-[24.96px] after:not-italic after:normal-nums after:font-bold after:h-1.5 after:tracking-[normal] after:leading-[29.952px] after:list-outside after:list-disc after:min-w-4 after:outline-dashed after:outline-1 after:text-start after:indent-[0px] after:uppercase after:visible after:w-full after:ml-4 after:rounded-lg after:border-separate after:font-system_ui after:md:text-[36.48px] after:md:leading-[43.776px]">
              Latest Articles
            </h2>
            <a
              href="/articles"
              title="All Articles"
              className="text-white font-bold items-center bg-neutral-900 box-border flex ml-4 my-4 p-2 rounded-[50%]"
            >
              <svg className="w-3 h-3 text-white">
                <use href="/symbols-v4.svg?#arrow-right"></use>
              </svg>
            </a>
          </div>

          <div className="box-border gap-x-[25.6px] grid grid-cols-[1fr] gap-y-[25.6px] md:grid-cols-[repeat(4,1fr)]">
            {latestArticles.map((article) => (
              <div
                key={article.id}
                className="items-center box-border gap-x-2 flex flex-col col-start-[span_1] gap-y-2 text-center overflow-hidden group"
              >
                <a
                  href={article.href}
                  title={article.title}
                  className="text-blue-700 bg-stone-100 box-border block h-[300px] w-full transform transition-transform duration-300 overflow-hidden rounded-[14px] group-hover:scale-105"
                >
                  <img
                    alt={article.alt}
                    src={article.imageSrc}
                    sizes={article.sizes}
                    className={
                      article.imageClassName +
                      " group-hover:scale-110  transition-transform duration-300"
                    }
                  />
                </a>

                <a
                  href={article.href}
                  title={article.title}
                  className="text-blue-700 box-border block"
                >
                  <strong
                    className="text-black text-[15.36px] font-bold box-border block leading-[21.504px] md:text-[19.2px] md:leading-[26.88px]"
                    style={{
                      textShadow:
                        "-1px -1px 0 #f6f5f3, 1px -1px 0 #f6f5f3, -1px 1px 0 #f6f5f3, 1px 1px 0 #f6f5f3",
                    }}
                  >
                    {article.name}
                  </strong>
                </a>

                <p className="text-[13.44px] box-border leading-[21.504px] md:text-[17.28px] md:leading-[27.648px]">
                  {article.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
