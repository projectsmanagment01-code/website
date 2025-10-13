import Image from "next/image";
import Recipe from "@/outils/types";
import { TipCard } from "./TipCard";
import EssentialIngredients from "./EssentialIngerdients";
import CompleteCookingProcess from "./CompleteProcess";
import { Card } from "./Card";
import { getHostname, renderSafeHtml, hasHtmlTags } from "@/lib/utils";

interface RecipeContentProps {
  recipe: Recipe;
}

// Optimized image URL generator for Cloudflare CDN
const getOptimizedImageUrl = (
  src: string,
  width: number,
  quality = 65,
  format = "webp"
) => {
  // Remove existing query parameters
  const cleanSrc = src?.split("?")[0] || "";
  return `${cleanSrc}?w=${width}&q=${quality}&f=${format}`;
};

export function RecipeContent({ recipe }: RecipeContentProps) {
  recipe = Array.isArray(recipe) ? recipe[0] : recipe;

  // Use only named fields (new approach)
  const featureImage = recipe.featureImage || recipe.heroImage;
  const ingredientImage = recipe.preparationImage;
  const mixingImage = recipe.cookingImage;
  const finalImage = recipe.finalPresentationImage;

  return (
    <div className="space-y-8 mt-2 text-md max-w-none">
      {/* 1. Feature/Hero Image - Top of page */}
      {featureImage && (
        <div className="relative w-full rounded-lg overflow-hidden shadow-xl">
          <Image
            src={featureImage}
            alt={`${recipe.title} - feature image`}
            width={1200}
            height={800}
            quality={75}
            style={{
              width: "100%",
              height: "auto",
            }}
            priority
            loading="eager"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 65vw, 1200px"
          />

          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded backdrop-blur-sm">
            {recipe.title} | {getHostname()}
          </div>
        </div>
      )}

      {/* Story */}
      <div className="prose prose-lg max-w-none">
        {hasHtmlTags(recipe.story) ? (
          <div
            className="text-black leading-relaxed text-[1.2rem]"
            dangerouslySetInnerHTML={renderSafeHtml(recipe.story)}
          />
        ) : (
          <p className="text-black leading-relaxed text-[1.2rem]">
            {recipe.story}
          </p>
        )}
      </div>

      {/* Why You'll Love This */}
      <TipCard
        title={recipe.whyYouLove?.title}
        items={recipe.whyYouLove?.items}
      />

      {/* Testimonial */}
      <div className="prose prose-lg max-w-none text-[1.2rem]">
        {hasHtmlTags(recipe.testimonial) ? (
          <div
            className="text-black leading-relaxed italic"
            dangerouslySetInnerHTML={renderSafeHtml(recipe.testimonial)}
          />
        ) : (
          <p className="text-black leading-relaxed italic">
            {recipe.testimonial}
          </p>
        )}
      </div>

      {/* Essential Ingredient Guide */}
      <EssentialIngredients essIngredientGuide={recipe.essIngredientGuide} />

      {/* 2. Ingredient/Preparation Image - After ingredient guide */}
      {ingredientImage && (
        <div className="relative w-full rounded-lg overflow-hidden shadow-xl bg-gray-100 my-8">
          <Image
            src={ingredientImage}
            alt={`${recipe.title} - ingredients preparation`}
            width={1200}
            height={800}
            style={{
              width: "100%",
              height: "auto",
            }}
            loading="lazy"
            quality={75}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 65vw, 1200px"
          />
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded backdrop-blur-sm">
            Preparing {recipe.title} | {getHostname()}
          </div>
        </div>
      )}

      {/* Complete Cooking Process */}
      <CompleteCookingProcess completeProcess={recipe.completeProcess} />

      {/* 3. Mixing/Cooking Image - After cooking process */}
      {mixingImage && (
        <div className="relative w-full rounded-lg overflow-hidden shadow-xl bg-gray-100 my-8">
          <Image
            src={mixingImage}
            alt={`${recipe.title} - cooking process`}
            width={1200}
            height={800}
            style={{
              width: "100%",
              height: "auto",
            }}
            loading="lazy"
            quality={75}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 65vw, 1200px"
          />
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded backdrop-blur-sm">
            Cooking {recipe.title} | {getHostname()}
          </div>
        </div>
      )}

      {/* Sections with optimized images */}
      {recipe.sections?.map((item: any, index: number) => {
        

        return (
          <div key={index}>
            {item.type === "card" ? (
              <TipCard
                title={item.title}
                items={item.items}
                after={item.after}
              />
            ) : (
              <>
                <h2
                  className="
          relative flex items-center
          before:content-[''] before:rounded-2xl
          before:w-[0.7rem] before:min-w-[0.7rem]
          before:me-[0.7rem] before:bg-[var(--mo-article-any)]
          before:self-stretch
          text-[calc(var(--mo-font-size)*1.5)]
          leading-[1.2]
          font-bold
          text-[2rem]
          m-4
          ml-0
        "
                >
                  {item.title}
                </h2>
                <div className="prose prose-lg max-w-none text-[1.2rem]">
                  {hasHtmlTags(item.content) ? (
                    <div
                      className="text-black leading-relaxed"
                      dangerouslySetInnerHTML={renderSafeHtml(item.content)}
                    />
                  ) : (
                    <p className="text-black leading-relaxed">{item.content}</p>
                  )}
                </div>
              </>
            )}

            {item.img !== undefined && (
              <div
                
                className="relative w-full rounded-lg overflow-hidden shadow-xl bg-gray-100"
              >
                
                  <Image
                    src={recipe.images[item.img] || recipe.images[1]}
                    alt={`${recipe.title} - ${item.title}`}
                    width={700}
                    height={500}
                    style={{
                      width: "100%",
                      height: "auto",
                    }}
                    loading="lazy"
                    quality={75}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 65vw, 700px"
                  />
                
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded backdrop-blur-sm">
                  {recipe.title} | {getHostname()}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 4. Final Presentation Image - Before FAQ section */}
      {finalImage && (
        <div className="relative w-full rounded-lg overflow-hidden shadow-xl bg-gray-100 my-8">
          <Image
            src={finalImage}
            alt={`${recipe.title} - final presentation`}
            width={1200}
            height={800}
            style={{
              width: "100%",
              height: "auto",
            }}
            loading="lazy"
            quality={75}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 65vw, 1200px"
          />
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded backdrop-blur-sm">
            {recipe.title} - Final Presentation | {getHostname()}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div>
        <h2
          className="
          relative flex items-center
          before:content-[''] before:rounded-2xl
          before:w-[0.7rem] before:min-w-[0.7rem]
          before:me-[0.7rem] before:bg-[var(--mo-article-any)]
          before:self-stretch
          text-[calc(var(--mo-font-size)*1.5)]
          leading-[1.2]
          font-bold
          text-[2rem]
          m-4
          ml-0
        "
        >
          {recipe.questions?.title}
        </h2>
        <div className="space-y-6 text-[1.2rem]">
          {recipe.questions?.items?.map((item: any, index: any) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <h3 className="flex font-bold items-center space-x-2 font-bold text-gray-650 mb-2">
                <span>{"→" + item.question}</span>
              </h3>
              {hasHtmlTags(item.answer) ? (
                <div
                  className="text-black leading-relaxed pl-6"
                  dangerouslySetInnerHTML={renderSafeHtml(item.answer)}
                />
              ) : (
                <p className="text-black leading-relaxed pl-6">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Card recipe={recipe} />
    </div>
  );
}
