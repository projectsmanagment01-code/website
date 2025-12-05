import Recipe from "@/outils/types";
import { TipCard } from "./TipCard";
import EssentialIngredients from "./EssentialIngerdients";
import CompleteCookingProcess from "./CompleteProcess";
import { Card } from "./Card";
import { renderSafeHtml, hasHtmlTags } from "@/lib/utils";
import { PinterestPinButton } from "./PinterestPinButton";
import { getWebsiteName } from "@/lib/site-name-helper";
import { SafeImage } from "./SafeImage";
import RecipeBottomSubscription from "./RecipeBottomSubscription";
import RecipeVideo from "./RecipeVideo";

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
    if (!img || typeof img !== 'string') return false;
    const trimmed = img.trim();
    if (trimmed.length === 0) return false;
    if (trimmed.includes('undefined') || trimmed.includes('null')) return false;
    // Must start with http:// or https:// or / (relative path)
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) return false;
    return true;
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
            <SafeImage
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

      {/* Recipe Video (YouTube embed if available) */}
      <RecipeVideo videoUrl={(recipe as any).videoUrl} title={recipe.title} />

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
            <SafeImage
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
            <SafeImage
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
                  <SafeImage
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

      {/* === NEW CONTENT FIELDS SECTION === */}
      
      {/* Recipe Origin */}
      {(recipe as any).recipeOrigin && (
        <div className="my-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-l-4 border-amber-500">
          <h2 className="text-2xl font-bold text-amber-800 mb-3 flex items-center">
            <span className="mr-2">🌍</span> Recipe Origin & History
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-amber-900">
            {hasHtmlTags((recipe as any).recipeOrigin) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).recipeOrigin)} />
            ) : (
              <p>{(recipe as any).recipeOrigin}</p>
            )}
          </div>
        </div>
      )}

      {/* Taste Profile */}
      {(recipe as any).tasteProfile && (
        <div className="my-8 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border-l-4 border-pink-500">
          <h2 className="text-2xl font-bold text-pink-800 mb-3 flex items-center">
            <span className="mr-2">👅</span> Taste Profile
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-pink-900">
            {hasHtmlTags((recipe as any).tasteProfile) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).tasteProfile)} />
            ) : (
              <p>{(recipe as any).tasteProfile}</p>
            )}
          </div>
        </div>
      )}

      {/* Texture Profile */}
      {(recipe as any).textureProfile && (
        <div className="my-8 p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border-l-4 border-violet-500">
          <h2 className="text-2xl font-bold text-violet-800 mb-3 flex items-center">
            <span className="mr-2">✨</span> Texture Profile
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-violet-900">
            {hasHtmlTags((recipe as any).textureProfile) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).textureProfile)} />
            ) : (
              <p>{(recipe as any).textureProfile}</p>
            )}
          </div>
        </div>
      )}

      {/* Difficulty Reasoning */}
      {(recipe as any).difficultyReasoning && (
        <div className="my-8 p-6 bg-gradient-to-r from-slate-50 to-gray-100 rounded-lg border-l-4 border-slate-500">
          <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center">
            <span className="mr-2">📊</span> Skill Level Explained
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-slate-700">
            {hasHtmlTags((recipe as any).difficultyReasoning) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).difficultyReasoning)} />
            ) : (
              <p>{(recipe as any).difficultyReasoning}</p>
            )}
          </div>
        </div>
      )}

      {/* Seasonality */}
      {(recipe as any).seasonality && (
        <div className="my-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500">
          <h2 className="text-2xl font-bold text-green-800 mb-3 flex items-center">
            <span className="mr-2">🍂</span> Best Season to Make
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-green-900">
            {hasHtmlTags((recipe as any).seasonality) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).seasonality)} />
            ) : (
              <p>{(recipe as any).seasonality}</p>
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      {(recipe as any).timeline && (
        <div className="my-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-blue-800 mb-3 flex items-center">
            <span className="mr-2">⏱️</span> Cooking Timeline
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-blue-900">
            {hasHtmlTags((recipe as any).timeline) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).timeline)} />
            ) : (
              <p>{(recipe as any).timeline}</p>
            )}
          </div>
        </div>
      )}

      {/* Shopping List */}
      {(recipe as any).shoppingList && (
        <div className="my-8 p-6 bg-gradient-to-r from-lime-50 to-green-50 rounded-lg border-l-4 border-lime-600">
          <h2 className="text-2xl font-bold text-lime-800 mb-3 flex items-center">
            <span className="mr-2">🛒</span> Shopping List
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-lime-900">
            {hasHtmlTags((recipe as any).shoppingList) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).shoppingList)} />
            ) : (
              <p>{(recipe as any).shoppingList}</p>
            )}
          </div>
        </div>
      )}

      {/* Equipment Notes */}
      {(recipe as any).equipmentNotes && (
        <div className="my-8 p-6 bg-gradient-to-r from-stone-50 to-neutral-100 rounded-lg border-l-4 border-stone-500">
          <h2 className="text-2xl font-bold text-stone-800 mb-3 flex items-center">
            <span className="mr-2">🍳</span> Equipment You'll Need
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-stone-700">
            {hasHtmlTags((recipe as any).equipmentNotes) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).equipmentNotes)} />
            ) : (
              <p>{(recipe as any).equipmentNotes}</p>
            )}
          </div>
        </div>
      )}

      {/* Ingredient Prep */}
      {(recipe as any).ingredientPrep && (
        <div className="my-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-l-4 border-yellow-500">
          <h2 className="text-2xl font-bold text-yellow-800 mb-3 flex items-center">
            <span className="mr-2">🥕</span> Ingredient Prep Guide
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-yellow-900">
            {hasHtmlTags((recipe as any).ingredientPrep) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).ingredientPrep)} />
            ) : (
              <p>{(recipe as any).ingredientPrep}</p>
            )}
          </div>
        </div>
      )}

      {/* Temperature Notes */}
      {(recipe as any).temperatureNotes && (
        <div className="my-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-l-4 border-red-500">
          <h2 className="text-2xl font-bold text-red-800 mb-3 flex items-center">
            <span className="mr-2">🌡️</span> Temperature Guide
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-red-900">
            {hasHtmlTags((recipe as any).temperatureNotes) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).temperatureNotes)} />
            ) : (
              <p>{(recipe as any).temperatureNotes}</p>
            )}
          </div>
        </div>
      )}

      {/* Common Mistakes */}
      {(recipe as any).commonMistakes && (
        <div className="my-8 p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border-l-4 border-rose-600">
          <h2 className="text-2xl font-bold text-rose-800 mb-3 flex items-center">
            <span className="mr-2">⚠️</span> Common Mistakes to Avoid
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-rose-900">
            {hasHtmlTags((recipe as any).commonMistakes) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).commonMistakes)} />
            ) : (
              <p>{(recipe as any).commonMistakes}</p>
            )}
          </div>
        </div>
      )}

      {/* Flavor Boosters */}
      {(recipe as any).flavorBoosters && (
        <div className="my-8 p-6 bg-gradient-to-r from-fuchsia-50 to-purple-50 rounded-lg border-l-4 border-fuchsia-500">
          <h2 className="text-2xl font-bold text-fuchsia-800 mb-3 flex items-center">
            <span className="mr-2">🔥</span> Flavor Boosters & Upgrades
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-fuchsia-900">
            {hasHtmlTags((recipe as any).flavorBoosters) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).flavorBoosters)} />
            ) : (
              <p>{(recipe as any).flavorBoosters}</p>
            )}
          </div>
        </div>
      )}

      {/* Variations */}
      {(recipe as any).variations && (
        <div className="my-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border-l-4 border-indigo-500">
          <h2 className="text-2xl font-bold text-indigo-800 mb-3 flex items-center">
            <span className="mr-2">🔄</span> Recipe Variations
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-indigo-900">
            {hasHtmlTags((recipe as any).variations) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).variations)} />
            ) : (
              <p>{(recipe as any).variations}</p>
            )}
          </div>
        </div>
      )}

      {/* Substitutions */}
      {(recipe as any).substitutions && (
        <div className="my-8 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border-l-4 border-teal-500">
          <h2 className="text-2xl font-bold text-teal-800 mb-3 flex items-center">
            <span className="mr-2">🔃</span> Ingredient Substitutions
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-teal-900">
            {hasHtmlTags((recipe as any).substitutions) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).substitutions)} />
            ) : (
              <p>{(recipe as any).substitutions}</p>
            )}
          </div>
        </div>
      )}

      {/* Dietary Adaptations */}
      {(recipe as any).dietaryAdaptations && (
        <div className="my-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border-l-4 border-emerald-600">
          <h2 className="text-2xl font-bold text-emerald-800 mb-3 flex items-center">
            <span className="mr-2">🥗</span> Dietary Adaptations
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-emerald-900">
            {hasHtmlTags((recipe as any).dietaryAdaptations) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).dietaryAdaptations)} />
            ) : (
              <p>{(recipe as any).dietaryAdaptations}</p>
            )}
          </div>
        </div>
      )}

      {/* Pairings */}
      {(recipe as any).pairings && (
        <div className="my-8 p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border-l-4 border-purple-500">
          <h2 className="text-2xl font-bold text-purple-800 mb-3 flex items-center">
            <span className="mr-2">🍷</span> Perfect Pairings
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-purple-900">
            {hasHtmlTags((recipe as any).pairings) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).pairings)} />
            ) : (
              <p>{(recipe as any).pairings}</p>
            )}
          </div>
        </div>
      )}

      {/* Serving Suggestions */}
      {(recipe as any).servingSuggestions && (
        <div className="my-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-l-4 border-orange-500">
          <h2 className="text-2xl font-bold text-orange-800 mb-3 flex items-center">
            <span className="mr-2">🍽️</span> Serving Suggestions
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-orange-900">
            {hasHtmlTags((recipe as any).servingSuggestions) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).servingSuggestions)} />
            ) : (
              <p>{(recipe as any).servingSuggestions}</p>
            )}
          </div>
        </div>
      )}

      {/* Make Ahead */}
      {(recipe as any).makeAhead && (
        <div className="my-8 p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border-l-4 border-sky-500">
          <h2 className="text-2xl font-bold text-sky-800 mb-3 flex items-center">
            <span className="mr-2">📅</span> Make Ahead Tips
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-sky-900">
            {hasHtmlTags((recipe as any).makeAhead) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).makeAhead)} />
            ) : (
              <p>{(recipe as any).makeAhead}</p>
            )}
          </div>
        </div>
      )}

      {/* Leftovers */}
      {(recipe as any).leftovers && (
        <div className="my-8 p-6 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg border-l-4 border-cyan-600">
          <h2 className="text-2xl font-bold text-cyan-800 mb-3 flex items-center">
            <span className="mr-2">🥡</span> Leftover Ideas
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-cyan-900">
            {hasHtmlTags((recipe as any).leftovers) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).leftovers)} />
            ) : (
              <p>{(recipe as any).leftovers}</p>
            )}
          </div>
        </div>
      )}

      {/* Special Notes */}
      {(recipe as any).specialNotes && (
        <div className="my-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border-l-4 border-amber-600">
          <h2 className="text-2xl font-bold text-amber-800 mb-3 flex items-center">
            <span className="mr-2">📝</span> Chef's Special Notes
          </h2>
          <div className="prose prose-lg max-w-none text-[1.1rem] text-amber-900">
            {hasHtmlTags((recipe as any).specialNotes) ? (
              <div dangerouslySetInnerHTML={renderSafeHtml((recipe as any).specialNotes)} />
            ) : (
              <p>{(recipe as any).specialNotes}</p>
            )}
          </div>
        </div>
      )}

      {/* === END NEW CONTENT FIELDS SECTION === */}

      {/* 4. Final Presentation Image - Just before recipe card */}
      {finalImage && (
        <div className="my-8">
          <div className="relative w-full rounded-lg overflow-hidden shadow-xl bg-gray-100">
            <PinterestPinButton 
              imageUrl={finalImage}
              description={`${recipe.title} - Final presentation`}
              altText={`${recipe.title} - final presentation`}
            />
            <SafeImage
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

      {/* Subscription Form */}
      <RecipeBottomSubscription />
    </div>
  );
}
