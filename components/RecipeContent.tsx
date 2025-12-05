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

      {/* Taste Profile - Object with sweet, salty, spicy, etc. */}
      {(recipe as any).tasteProfile && typeof (recipe as any).tasteProfile === 'object' && (
        <div className="my-8 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border-l-4 border-pink-500">
          <h2 className="text-2xl font-bold text-pink-800 mb-3 flex items-center">
            <span className="mr-2">👅</span> Taste Profile
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {(recipe as any).tasteProfile.sweet && (
              <div className="bg-white/50 rounded p-2 text-center">
                <span className="block text-sm text-pink-600">Sweet</span>
                <span className="font-semibold text-pink-800">{(recipe as any).tasteProfile.sweet}</span>
              </div>
            )}
            {(recipe as any).tasteProfile.salty && (
              <div className="bg-white/50 rounded p-2 text-center">
                <span className="block text-sm text-pink-600">Salty</span>
                <span className="font-semibold text-pink-800">{(recipe as any).tasteProfile.salty}</span>
              </div>
            )}
            {(recipe as any).tasteProfile.spicy && (
              <div className="bg-white/50 rounded p-2 text-center">
                <span className="block text-sm text-pink-600">Spicy</span>
                <span className="font-semibold text-pink-800">{(recipe as any).tasteProfile.spicy}</span>
              </div>
            )}
            {(recipe as any).tasteProfile.sour && (
              <div className="bg-white/50 rounded p-2 text-center">
                <span className="block text-sm text-pink-600">Sour</span>
                <span className="font-semibold text-pink-800">{(recipe as any).tasteProfile.sour}</span>
              </div>
            )}
            {(recipe as any).tasteProfile.umami && (
              <div className="bg-white/50 rounded p-2 text-center">
                <span className="block text-sm text-pink-600">Umami</span>
                <span className="font-semibold text-pink-800">{(recipe as any).tasteProfile.umami}</span>
              </div>
            )}
          </div>
          {(recipe as any).tasteProfile.overall && (
            <p className="text-pink-900 text-[1.1rem] italic">{(recipe as any).tasteProfile.overall}</p>
          )}
        </div>
      )}

      {/* Texture Profile - Object */}
      {(recipe as any).textureProfile && typeof (recipe as any).textureProfile === 'object' && (
        <div className="my-8 p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border-l-4 border-violet-500">
          <h2 className="text-2xl font-bold text-violet-800 mb-3 flex items-center">
            <span className="mr-2">✨</span> Texture Profile
          </h2>
          <div className="space-y-2 mb-4">
            {(recipe as any).textureProfile.outside && (
              <p className="text-violet-900"><strong>Outside:</strong> {(recipe as any).textureProfile.outside}</p>
            )}
            {(recipe as any).textureProfile.inside && (
              <p className="text-violet-900"><strong>Inside:</strong> {(recipe as any).textureProfile.inside}</p>
            )}
            {(recipe as any).textureProfile.bite && (
              <p className="text-violet-900"><strong>Bite:</strong> {(recipe as any).textureProfile.bite}</p>
            )}
          </div>
          {(recipe as any).textureProfile.overall && (
            <p className="text-violet-900 text-[1.1rem] italic">{(recipe as any).textureProfile.overall}</p>
          )}
        </div>
      )}

      {/* Difficulty Reasoning - String */}
      {(recipe as any).difficultyReasoning && typeof (recipe as any).difficultyReasoning === 'string' && (
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

      {/* Seasonality - String */}
      {(recipe as any).seasonality && typeof (recipe as any).seasonality === 'string' && (
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

      {/* Timeline - Array of {time, action} */}
      {Array.isArray((recipe as any).timeline) && (recipe as any).timeline.length > 0 && (
        <div className="my-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-blue-800 mb-3 flex items-center">
            <span className="mr-2">⏱️</span> Cooking Timeline
          </h2>
          <div className="space-y-3">
            {(recipe as any).timeline.map((item: any, index: number) => (
              <div key={index} className="flex items-start gap-3 bg-white/50 rounded p-3">
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-bold whitespace-nowrap">{item.time}</span>
                <span className="text-blue-900">{item.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shopping List - Array of strings */}
      {Array.isArray((recipe as any).shoppingList) && (recipe as any).shoppingList.length > 0 && (
        <div className="my-8 p-6 bg-gradient-to-r from-lime-50 to-green-50 rounded-lg border-l-4 border-lime-600">
          <h2 className="text-2xl font-bold text-lime-800 mb-3 flex items-center">
            <span className="mr-2">🛒</span> Shopping List
          </h2>
          <ul className="space-y-2">
            {(recipe as any).shoppingList.map((item: string, index: number) => (
              <li key={index} className="flex items-center gap-2 text-lime-900">
                <span className="text-lime-600">☐</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Equipment Notes - Array of strings */}
      {Array.isArray((recipe as any).equipmentNotes) && (recipe as any).equipmentNotes.length > 0 && (
        <div className="my-8 p-6 bg-gradient-to-r from-stone-50 to-neutral-100 rounded-lg border-l-4 border-stone-500">
          <h2 className="text-2xl font-bold text-stone-800 mb-3 flex items-center">
            <span className="mr-2">🍳</span> Equipment You'll Need
          </h2>
          <ul className="space-y-2">
            {(recipe as any).equipmentNotes.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-stone-700">
                <span className="text-stone-500 mt-1">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ingredient Prep - Array of strings */}
      {Array.isArray((recipe as any).ingredientPrep) && (recipe as any).ingredientPrep.length > 0 && (
        <div className="my-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-l-4 border-yellow-500">
          <h2 className="text-2xl font-bold text-yellow-800 mb-3 flex items-center">
            <span className="mr-2">🥕</span> Ingredient Prep Guide
          </h2>
          <ul className="space-y-2">
            {(recipe as any).ingredientPrep.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-yellow-900">
                <span className="text-yellow-600 mt-1">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Temperature Notes - Object */}
      {(recipe as any).temperatureNotes && typeof (recipe as any).temperatureNotes === 'object' && (
        <div className="my-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-l-4 border-red-500">
          <h2 className="text-2xl font-bold text-red-800 mb-3 flex items-center">
            <span className="mr-2">🌡️</span> Temperature Guide
          </h2>
          <div className="space-y-2">
            {(recipe as any).temperatureNotes.stovetopHeatLevel && (
              <p className="text-red-900"><strong>Stovetop:</strong> {(recipe as any).temperatureNotes.stovetopHeatLevel}</p>
            )}
            {(recipe as any).temperatureNotes.ovenTemperature && (recipe as any).temperatureNotes.ovenTemperature !== "Not required" && (
              <p className="text-red-900"><strong>Oven:</strong> {(recipe as any).temperatureNotes.ovenTemperature}</p>
            )}
            {(recipe as any).temperatureNotes.safeInternalTemp && (
              <p className="text-red-900"><strong>Safe Internal Temp:</strong> {(recipe as any).temperatureNotes.safeInternalTemp}</p>
            )}
          </div>
        </div>
      )}

      {/* Common Mistakes - Array of strings */}
      {Array.isArray((recipe as any).commonMistakes) && (recipe as any).commonMistakes.length > 0 && (
        <div className="my-8 p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border-l-4 border-rose-600">
          <h2 className="text-2xl font-bold text-rose-800 mb-3 flex items-center">
            <span className="mr-2">⚠️</span> Common Mistakes to Avoid
          </h2>
          <ul className="space-y-2">
            {(recipe as any).commonMistakes.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-rose-900">
                <span className="text-rose-600 mt-1">✗</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Flavor Boosters - Array of strings */}
      {Array.isArray((recipe as any).flavorBoosters) && (recipe as any).flavorBoosters.length > 0 && (
        <div className="my-8 p-6 bg-gradient-to-r from-fuchsia-50 to-purple-50 rounded-lg border-l-4 border-fuchsia-500">
          <h2 className="text-2xl font-bold text-fuchsia-800 mb-3 flex items-center">
            <span className="mr-2">🔥</span> Flavor Boosters & Upgrades
          </h2>
          <ul className="space-y-2">
            {(recipe as any).flavorBoosters.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-fuchsia-900">
                <span className="text-fuchsia-600 mt-1">★</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Variations - Array of {title, description} */}
      {Array.isArray((recipe as any).variations) && (recipe as any).variations.length > 0 && (
        <div className="my-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border-l-4 border-indigo-500">
          <h2 className="text-2xl font-bold text-indigo-800 mb-3 flex items-center">
            <span className="mr-2">🔄</span> Recipe Variations
          </h2>
          <div className="space-y-4">
            {(recipe as any).variations.map((item: any, index: number) => (
              <div key={index} className="bg-white/50 rounded p-3">
                <h3 className="font-bold text-indigo-800">{item.title}</h3>
                <p className="text-indigo-900">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Substitutions - Array of {ingredient, substitute, note} */}
      {Array.isArray((recipe as any).substitutions) && (recipe as any).substitutions.length > 0 && (
        <div className="my-8 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border-l-4 border-teal-500">
          <h2 className="text-2xl font-bold text-teal-800 mb-3 flex items-center">
            <span className="mr-2">🔃</span> Ingredient Substitutions
          </h2>
          <div className="space-y-3">
            {(recipe as any).substitutions.map((item: any, index: number) => (
              <div key={index} className="bg-white/50 rounded p-3">
                <p className="text-teal-900">
                  <strong>{item.ingredient}</strong> → {item.substitute}
                </p>
                {item.note && <p className="text-teal-700 text-sm mt-1 italic">{item.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dietary Adaptations - Array of {diet, howToAdapt} */}
      {Array.isArray((recipe as any).dietaryAdaptations) && (recipe as any).dietaryAdaptations.length > 0 && (
        <div className="my-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border-l-4 border-emerald-600">
          <h2 className="text-2xl font-bold text-emerald-800 mb-3 flex items-center">
            <span className="mr-2">🥗</span> Dietary Adaptations
          </h2>
          <div className="space-y-3">
            {(recipe as any).dietaryAdaptations.map((item: any, index: number) => (
              <div key={index} className="bg-white/50 rounded p-3">
                <h3 className="font-bold text-emerald-800">{item.diet}</h3>
                <p className="text-emerald-900">{item.howToAdapt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pairings - Array of strings */}
      {Array.isArray((recipe as any).pairings) && (recipe as any).pairings.length > 0 && (
        <div className="my-8 p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border-l-4 border-purple-500">
          <h2 className="text-2xl font-bold text-purple-800 mb-3 flex items-center">
            <span className="mr-2">🍷</span> Perfect Pairings
          </h2>
          <ul className="space-y-2">
            {(recipe as any).pairings.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-purple-900">
                <span className="text-purple-600 mt-1">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Serving Suggestions - Array of strings */}
      {Array.isArray((recipe as any).servingSuggestions) && (recipe as any).servingSuggestions.length > 0 && (
        <div className="my-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-l-4 border-orange-500">
          <h2 className="text-2xl font-bold text-orange-800 mb-3 flex items-center">
            <span className="mr-2">🍽️</span> Serving Suggestions
          </h2>
          <ul className="space-y-2">
            {(recipe as any).servingSuggestions.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-orange-900">
                <span className="text-orange-600 mt-1">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Make Ahead - String */}
      {(recipe as any).makeAhead && typeof (recipe as any).makeAhead === 'string' && (
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

      {/* Leftovers - String */}
      {(recipe as any).leftovers && typeof (recipe as any).leftovers === 'string' && (
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

      {/* Special Notes - Array of strings */}
      {Array.isArray((recipe as any).specialNotes) && (recipe as any).specialNotes.length > 0 && (
        <div className="my-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border-l-4 border-amber-600">
          <h2 className="text-2xl font-bold text-amber-800 mb-3 flex items-center">
            <span className="mr-2">📝</span> Chef's Special Notes
          </h2>
          <ul className="space-y-2">
            {(recipe as any).specialNotes.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-amber-900">
                <span className="text-amber-600 mt-1">•</span> {item}
              </li>
            ))}
          </ul>
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
