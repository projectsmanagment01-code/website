import Image from "next/image";
import Recipe from "@/outils/types";
import { TipCard } from "./TipCard";
import EssentialIngredients from "./EssentialIngerdients";
import CompleteCookingProcess from "./CompleteProcess";
import { Card } from "./Card";
import { renderSafeHtml, hasHtmlTags } from "@/lib/utils";
import { PinterestPinButton } from "./PinterestPinButton";
import { getWebsiteName } from "@/lib/site-name-helper";

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

export async function RecipeContent({ recipe }: RecipeContentProps) {
  recipe = Array.isArray(recipe) ? recipe[0] : recipe;

  // Get website name from database (cached for performance)
  const websiteName = await getWebsiteName();

  // Helper function to validate if image exists and is valid
  const isValidImage = (img: any): boolean => {
    return img && typeof img === 'string' && img.trim().length > 0 && !img.includes('undefined') && !img.includes('null');
  };

  // Check if recipe uses new named image fields
  const hasNamedImages = !!(recipe.featureImage || recipe.preparationImage || recipe.cookingImage || recipe.finalPresentationImage);

  // Get images from named fields or fallback to array indices (with validation)
  const featureImage = isValidImage(recipe.featureImage) ? recipe.featureImage 
    : isValidImage(recipe.images?.[0]) ? recipe.images[0]
    : isValidImage(recipe.heroImage) ? recipe.heroImage
    : null;
  
  // Only show subsequent images if:
  // 1. Recipe has named fields (new system), OR
  // 2. The image is different from featureImage (old system - prevent duplicates)
  const ingredientImage = hasNamedImages 
    ? (isValidImage(recipe.preparationImage) ? recipe.preparationImage : isValidImage(recipe.images?.[1]) ? recipe.images[1] : null)
    : (isValidImage(recipe.images?.[1]) && recipe.images[1] !== featureImage ? recipe.images[1] : null);
    
  const mixingImage = hasNamedImages 
    ? (isValidImage(recipe.cookingImage) ? recipe.cookingImage : isValidImage(recipe.images?.[2]) ? recipe.images[2] : null)
    : (isValidImage(recipe.images?.[2]) && recipe.images[2] !== featureImage && recipe.images[2] !== ingredientImage ? recipe.images[2] : null);
    
  const finalImage = hasNamedImages 
    ? (isValidImage(recipe.finalPresentationImage) ? recipe.finalPresentationImage : isValidImage(recipe.images?.[3]) ? recipe.images[3] : null)
    : (isValidImage(recipe.images?.[3]) && recipe.images[3] !== featureImage && recipe.images[3] !== ingredientImage && recipe.images[3] !== mixingImage ? recipe.images[3] : null);

  return (
    <div className="space-y-8 mt-2 text-md max-w-none">
      {/* 1. Feature/Hero Image - Top of page */}
      {featureImage && (
        <div>
          <div className="relative w-full rounded-lg overflow-hidden shadow-xl">
            <PinterestPinButton 
              imageUrl={featureImage}
              description={`${recipe.title} - Delicious recipe from ${websiteName}`}
              altText={`${recipe.title} - feature image`}
            />
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
          </div>
          <div className="text-center mt-3 text-gray-600 text-sm">
            {recipe.title} | {websiteName}
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
        <div className="my-8">
          <div className="relative w-full rounded-lg overflow-hidden shadow-xl bg-gray-100">
            <PinterestPinButton 
              imageUrl={ingredientImage}
              description={`${recipe.title} - Ingredients preparation`}
              altText={`${recipe.title} - ingredients preparation`}
            />
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
          </div>
          <div className="text-center mt-3 text-gray-600 text-sm">
            Preparing {recipe.title} | {websiteName}
          </div>
        </div>
      )}

      {/* Complete Cooking Process */}
      <CompleteCookingProcess completeProcess={recipe.completeProcess} />

      {/* 3. Mixing/Cooking Image - After cooking process */}
      {mixingImage && (
        <div className="my-8">
          <div className="relative w-full rounded-lg overflow-hidden shadow-xl bg-gray-100">
            <PinterestPinButton 
              imageUrl={mixingImage}
              description={`${recipe.title} - Cooking process`}
              altText={`${recipe.title} - cooking process`}
            />
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
          </div>
          <div className="text-center mt-3 text-gray-600 text-sm">
            Cooking {recipe.title} | {websiteName}
          </div>
        </div>
      )}

      {/* Sections with optimized images */}
      {Array.isArray(recipe.sections) && recipe.sections.map((item: any, index: number) => {
        

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
              <div className="my-8">
                <div className="relative w-full rounded-lg overflow-hidden shadow-xl bg-gray-100">
                  <PinterestPinButton 
                    imageUrl={recipe.images[item.img] || recipe.images[1]}
                    description={`${recipe.title} - ${item.title}`}
                    altText={`${recipe.title} - ${item.title}`}
                  />
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
                </div>
                <div className="text-center mt-3 text-gray-600 text-sm">
                  {recipe.title} | {websiteName}
                </div>
              </div>
            )}
          </div>
        );
      })}

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
          {Array.isArray(recipe.questions?.items) && recipe.questions.items.map((item: any, index: any) => (
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

      {/* 4. Final Presentation Image - Just before recipe card */}
      {finalImage && (
        <div className="my-8">
          <div className="relative w-full rounded-lg overflow-hidden shadow-xl bg-gray-100">
            <PinterestPinButton 
              imageUrl={finalImage}
              description={`${recipe.title} - Final presentation`}
              altText={`${recipe.title} - final presentation`}
            />
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
          </div>
          <div className="text-center mt-3 text-gray-600 text-sm">
            {recipe.title} - Final Presentation | {websiteName}
          </div>
        </div>
      )}

      <Card recipe={recipe} />
    </div>
  );
}
