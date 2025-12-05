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
      
      {/* Recipe Origin - Plain Text */}
      {(recipe as any).recipeOrigin && (
        <>
          <h2 className="relative flex items-center before:content-[''] before:rounded-2xl before:w-[0.7rem] before:min-w-[0.7rem] before:me-[0.7rem] before:bg-[var(--mo-article-any)] before:self-stretch text-[calc(var(--mo-font-size)*1.5)] leading-[1.2] font-bold text-[2rem] m-4 ml-0">
            Recipe Origin & History
          </h2>
          <div className="prose prose-lg max-w-none text-[1.2rem]">
            {hasHtmlTags((recipe as any).recipeOrigin) ? (
              <div className="text-black leading-relaxed" dangerouslySetInnerHTML={renderSafeHtml((recipe as any).recipeOrigin)} />
            ) : (
              <p className="text-black leading-relaxed">{(recipe as any).recipeOrigin}</p>
            )}
          </div>
        </>
      )}

      {/* Difficulty Reasoning - Plain Text */}
      {(recipe as any).difficultyReasoning && typeof (recipe as any).difficultyReasoning === 'string' && (
        <>
          <h2 className="relative flex items-center before:content-[''] before:rounded-2xl before:w-[0.7rem] before:min-w-[0.7rem] before:me-[0.7rem] before:bg-[var(--mo-article-any)] before:self-stretch text-[calc(var(--mo-font-size)*1.5)] leading-[1.2] font-bold text-[2rem] m-4 ml-0">
            Skill Level Explained
          </h2>
          <div className="prose prose-lg max-w-none text-[1.2rem]">
            {hasHtmlTags((recipe as any).difficultyReasoning) ? (
              <div className="text-black leading-relaxed" dangerouslySetInnerHTML={renderSafeHtml((recipe as any).difficultyReasoning)} />
            ) : (
              <p className="text-black leading-relaxed">{(recipe as any).difficultyReasoning}</p>
            )}
          </div>
        </>
      )}

      {/* Seasonality - Plain Text */}
      {(recipe as any).seasonality && typeof (recipe as any).seasonality === 'string' && (
        <>
          <h2 className="relative flex items-center before:content-[''] before:rounded-2xl before:w-[0.7rem] before:min-w-[0.7rem] before:me-[0.7rem] before:bg-[var(--mo-article-any)] before:self-stretch text-[calc(var(--mo-font-size)*1.5)] leading-[1.2] font-bold text-[2rem] m-4 ml-0">
            Best Season to Make
          </h2>
          <div className="prose prose-lg max-w-none text-[1.2rem]">
            {hasHtmlTags((recipe as any).seasonality) ? (
              <div className="text-black leading-relaxed" dangerouslySetInnerHTML={renderSafeHtml((recipe as any).seasonality)} />
            ) : (
              <p className="text-black leading-relaxed">{(recipe as any).seasonality}</p>
            )}
          </div>
        </>
      )}

      {/* 3. Mixing/Cooking Image - After Best Season to Make */}
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

      {/* Taste & Texture Profile - TipCard Style */}
      {((recipe as any).tasteProfile || (recipe as any).textureProfile) && (
        <div className="container border-2 border-solid rounded-lg shadow-sm" style={{ borderColor: '#3F7D58' }}>
          <div className="p-6 border border-dashed" style={{ background: 'linear-gradient(135deg, #E8F5EA 0%, #F5F9F6 100%)', borderColor: '#7FAD8A' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3F7D58 0%, #2D5A42 100%)' }}>
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#2D5A42' }}>Taste & Texture Profile</h2>
            </div>
            <div className="px-2 space-y-4">
              {(recipe as any).tasteProfile && typeof (recipe as any).tasteProfile === 'object' && (
                <div>
                  <p className="text-gray-800 text-lg leading-relaxed font-medium mb-2"><strong>Taste:</strong></p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(recipe as any).tasteProfile.sweet && <span className="bg-white/70 px-3 py-1 rounded-full text-sm">Sweet: {(recipe as any).tasteProfile.sweet}</span>}
                    {(recipe as any).tasteProfile.salty && <span className="bg-white/70 px-3 py-1 rounded-full text-sm">Salty: {(recipe as any).tasteProfile.salty}</span>}
                    {(recipe as any).tasteProfile.spicy && <span className="bg-white/70 px-3 py-1 rounded-full text-sm">Spicy: {(recipe as any).tasteProfile.spicy}</span>}
                    {(recipe as any).tasteProfile.sour && <span className="bg-white/70 px-3 py-1 rounded-full text-sm">Sour: {(recipe as any).tasteProfile.sour}</span>}
                    {(recipe as any).tasteProfile.umami && <span className="bg-white/70 px-3 py-1 rounded-full text-sm">Umami: {(recipe as any).tasteProfile.umami}</span>}
                  </div>
                  {(recipe as any).tasteProfile.overall && <p className="text-gray-700 italic">{(recipe as any).tasteProfile.overall}</p>}
                </div>
              )}
              {(recipe as any).textureProfile && typeof (recipe as any).textureProfile === 'object' && (
                <div>
                  <p className="text-gray-800 text-lg leading-relaxed font-medium mb-2"><strong>Texture:</strong></p>
                  <ul className="space-y-1">
                    {(recipe as any).textureProfile.outside && <li className="text-gray-800">Outside: {(recipe as any).textureProfile.outside}</li>}
                    {(recipe as any).textureProfile.inside && <li className="text-gray-800">Inside: {(recipe as any).textureProfile.inside}</li>}
                    {(recipe as any).textureProfile.bite && <li className="text-gray-800">Bite: {(recipe as any).textureProfile.bite}</li>}
                  </ul>
                  {(recipe as any).textureProfile.overall && <p className="text-gray-700 italic mt-2">{(recipe as any).textureProfile.overall}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Make Ahead - Plain Text */}
      {(recipe as any).makeAhead && typeof (recipe as any).makeAhead === 'string' && (
        <>
          <h2 className="relative flex items-center before:content-[''] before:rounded-2xl before:w-[0.7rem] before:min-w-[0.7rem] before:me-[0.7rem] before:bg-[var(--mo-article-any)] before:self-stretch text-[calc(var(--mo-font-size)*1.5)] leading-[1.2] font-bold text-[2rem] m-4 ml-0">
            Make Ahead Tips
          </h2>
          <div className="prose prose-lg max-w-none text-[1.2rem]">
            {hasHtmlTags((recipe as any).makeAhead) ? (
              <div className="text-black leading-relaxed" dangerouslySetInnerHTML={renderSafeHtml((recipe as any).makeAhead)} />
            ) : (
              <p className="text-black leading-relaxed">{(recipe as any).makeAhead}</p>
            )}
          </div>
        </>
      )}

      {/* Leftovers - Plain Text */}
      {(recipe as any).leftovers && typeof (recipe as any).leftovers === 'string' && (
        <>
          <h2 className="relative flex items-center before:content-[''] before:rounded-2xl before:w-[0.7rem] before:min-w-[0.7rem] before:me-[0.7rem] before:bg-[var(--mo-article-any)] before:self-stretch text-[calc(var(--mo-font-size)*1.5)] leading-[1.2] font-bold text-[2rem] m-4 ml-0">
            Leftover Ideas
          </h2>
          <div className="prose prose-lg max-w-none text-[1.2rem]">
            {hasHtmlTags((recipe as any).leftovers) ? (
              <div className="text-black leading-relaxed" dangerouslySetInnerHTML={renderSafeHtml((recipe as any).leftovers)} />
            ) : (
              <p className="text-black leading-relaxed">{(recipe as any).leftovers}</p>
            )}
          </div>
        </>
      )}

      {/* Timeline - Plain Text with formatting */}
      {Array.isArray((recipe as any).timeline) && (recipe as any).timeline.length > 0 && (
        <>
          <h2 className="relative flex items-center before:content-[''] before:rounded-2xl before:w-[0.7rem] before:min-w-[0.7rem] before:me-[0.7rem] before:bg-[var(--mo-article-any)] before:self-stretch text-[calc(var(--mo-font-size)*1.5)] leading-[1.2] font-bold text-[2rem] m-4 ml-0">
            Cooking Timeline
          </h2>
          <div className="prose prose-lg max-w-none text-[1.2rem]">
            {(recipe as any).timeline.map((item: any, index: number) => (
              <p key={index} className="text-black leading-relaxed"><strong>{item.time}:</strong> {item.action}</p>
            ))}
          </div>
        </>
      )}

      {/* Equipment & Shopping - TipCard Style */}
      {(Array.isArray((recipe as any).equipmentNotes) && (recipe as any).equipmentNotes.length > 0) || (Array.isArray((recipe as any).shoppingList) && (recipe as any).shoppingList.length > 0) ? (
        <div className="container border-2 border-solid rounded-lg shadow-sm" style={{ borderColor: '#3F7D58' }}>
          <div className="p-6 border border-dashed" style={{ background: 'linear-gradient(135deg, #E8F5EA 0%, #F5F9F6 100%)', borderColor: '#7FAD8A' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3F7D58 0%, #2D5A42 100%)' }}>
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#2D5A42' }}>Equipment & Shopping</h2>
            </div>
            <div className="px-2 space-y-4">
              {Array.isArray((recipe as any).equipmentNotes) && (recipe as any).equipmentNotes.length > 0 && (
                <div>
                  <p className="text-gray-800 text-lg leading-relaxed font-medium mb-2"><strong>Equipment You'll Need:</strong></p>
                  <ul className="w-full space-y-2">
                    {(recipe as any).equipmentNotes.map((item: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="text-lg font-bold mt-1" style={{ color: '#2D5A42' }}>•</span>
                        <span className="text-gray-800 text-lg leading-relaxed font-medium flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray((recipe as any).shoppingList) && (recipe as any).shoppingList.length > 0 && (
                <div>
                  <p className="text-gray-800 text-lg leading-relaxed font-medium mb-2"><strong>Shopping List:</strong></p>
                  <ul className="w-full space-y-2">
                    {(recipe as any).shoppingList.map((item: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="text-lg font-bold mt-1" style={{ color: '#2D5A42' }}>•</span>
                        <span className="text-gray-800 text-lg leading-relaxed font-medium flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Ingredient Prep - Plain Text */}
      {Array.isArray((recipe as any).ingredientPrep) && (recipe as any).ingredientPrep.length > 0 && (
        <>
          <h2 className="relative flex items-center before:content-[''] before:rounded-2xl before:w-[0.7rem] before:min-w-[0.7rem] before:me-[0.7rem] before:bg-[var(--mo-article-any)] before:self-stretch text-[calc(var(--mo-font-size)*1.5)] leading-[1.2] font-bold text-[2rem] m-4 ml-0">
            Ingredient Prep Guide
          </h2>
          <div className="prose prose-lg max-w-none text-[1.2rem]">
            {(recipe as any).ingredientPrep.map((item: string, index: number) => (
              <p key={index} className="text-black leading-relaxed">{item}</p>
            ))}
          </div>
        </>
      )}

      {/* Temperature Notes - Plain Text */}
      {(recipe as any).temperatureNotes && typeof (recipe as any).temperatureNotes === 'object' && (
        <>
          <h2 className="relative flex items-center before:content-[''] before:rounded-2xl before:w-[0.7rem] before:min-w-[0.7rem] before:me-[0.7rem] before:bg-[var(--mo-article-any)] before:self-stretch text-[calc(var(--mo-font-size)*1.5)] leading-[1.2] font-bold text-[2rem] m-4 ml-0">
            Temperature Guide
          </h2>
          <div className="prose prose-lg max-w-none text-[1.2rem]">
            {(recipe as any).temperatureNotes.stovetopHeatLevel && (
              <p className="text-black leading-relaxed"><strong>Stovetop:</strong> {(recipe as any).temperatureNotes.stovetopHeatLevel}</p>
            )}
            {(recipe as any).temperatureNotes.ovenTemperature && (recipe as any).temperatureNotes.ovenTemperature !== "Not required" && (
              <p className="text-black leading-relaxed"><strong>Oven:</strong> {(recipe as any).temperatureNotes.ovenTemperature}</p>
            )}
            {(recipe as any).temperatureNotes.safeInternalTemp && (
              <p className="text-black leading-relaxed"><strong>Safe Internal Temp:</strong> {(recipe as any).temperatureNotes.safeInternalTemp}</p>
            )}
          </div>
        </>
      )}

      {/* Pairings - Plain Text */}
      {Array.isArray((recipe as any).pairings) && (recipe as any).pairings.length > 0 && (
        <>
          <h2 className="relative flex items-center before:content-[''] before:rounded-2xl before:w-[0.7rem] before:min-w-[0.7rem] before:me-[0.7rem] before:bg-[var(--mo-article-any)] before:self-stretch text-[calc(var(--mo-font-size)*1.5)] leading-[1.2] font-bold text-[2rem] m-4 ml-0">
            Perfect Pairings
          </h2>
          <div className="prose prose-lg max-w-none text-[1.2rem]">
            {(recipe as any).pairings.map((item: string, index: number) => (
              <p key={index} className="text-black leading-relaxed">{item}</p>
            ))}
          </div>
        </>
      )}

      {/* Common Mistakes & Flavor Boosters - TipCard Style */}
      {(Array.isArray((recipe as any).commonMistakes) && (recipe as any).commonMistakes.length > 0) || (Array.isArray((recipe as any).flavorBoosters) && (recipe as any).flavorBoosters.length > 0) ? (
        <div className="container border-2 border-solid rounded-lg shadow-sm" style={{ borderColor: '#3F7D58' }}>
          <div className="p-6 border border-dashed" style={{ background: 'linear-gradient(135deg, #E8F5EA 0%, #F5F9F6 100%)', borderColor: '#7FAD8A' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3F7D58 0%, #2D5A42 100%)' }}>
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#2D5A42' }}>Pro Tips & Mistakes to Avoid</h2>
            </div>
            <div className="px-2 space-y-4">
              {Array.isArray((recipe as any).commonMistakes) && (recipe as any).commonMistakes.length > 0 && (
                <div>
                  <p className="text-gray-800 text-lg leading-relaxed font-medium mb-2"><strong>Common Mistakes to Avoid:</strong></p>
                  <ul className="w-full space-y-2">
                    {(recipe as any).commonMistakes.map((item: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="text-lg font-bold mt-1" style={{ color: '#2D5A42' }}>•</span>
                        <span className="text-gray-800 text-lg leading-relaxed font-medium flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray((recipe as any).flavorBoosters) && (recipe as any).flavorBoosters.length > 0 && (
                <div>
                  <p className="text-gray-800 text-lg leading-relaxed font-medium mb-2"><strong>Flavor Boosters:</strong></p>
                  <ul className="w-full space-y-2">
                    {(recipe as any).flavorBoosters.map((item: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="text-lg font-bold mt-1" style={{ color: '#2D5A42' }}>•</span>
                        <span className="text-gray-800 text-lg leading-relaxed font-medium flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Serving Suggestions - Plain Text */}
      {Array.isArray((recipe as any).servingSuggestions) && (recipe as any).servingSuggestions.length > 0 && (
        <>
          <h2 className="relative flex items-center before:content-[''] before:rounded-2xl before:w-[0.7rem] before:min-w-[0.7rem] before:me-[0.7rem] before:bg-[var(--mo-article-any)] before:self-stretch text-[calc(var(--mo-font-size)*1.5)] leading-[1.2] font-bold text-[2rem] m-4 ml-0">
            Serving Suggestions
          </h2>
          <div className="prose prose-lg max-w-none text-[1.2rem]">
            {(recipe as any).servingSuggestions.map((item: string, index: number) => (
              <p key={index} className="text-black leading-relaxed">{item}</p>
            ))}
          </div>
        </>
      )}

      {/* Special Notes - Plain Text */}
      {Array.isArray((recipe as any).specialNotes) && (recipe as any).specialNotes.length > 0 && (
        <>
          <h2 className="relative flex items-center before:content-[''] before:rounded-2xl before:w-[0.7rem] before:min-w-[0.7rem] before:me-[0.7rem] before:bg-[var(--mo-article-any)] before:self-stretch text-[calc(var(--mo-font-size)*1.5)] leading-[1.2] font-bold text-[2rem] m-4 ml-0">
            Chef's Special Notes
          </h2>
          <div className="prose prose-lg max-w-none text-[1.2rem]">
            {(recipe as any).specialNotes.map((item: string, index: number) => (
              <p key={index} className="text-black leading-relaxed">{item}</p>
            ))}
          </div>
        </>
      )}

      {/* Variations - Plain Text */}
      {Array.isArray((recipe as any).variations) && (recipe as any).variations.length > 0 && (
        <>
          <h2 className="relative flex items-center before:content-[''] before:rounded-2xl before:w-[0.7rem] before:min-w-[0.7rem] before:me-[0.7rem] before:bg-[var(--mo-article-any)] before:self-stretch text-[calc(var(--mo-font-size)*1.5)] leading-[1.2] font-bold text-[2rem] m-4 ml-0">
            Recipe Variations
          </h2>
          <div className="prose prose-lg max-w-none text-[1.2rem]">
            {(recipe as any).variations.map((item: any, index: number) => (
              <p key={index} className="text-black leading-relaxed"><strong>{item.title}:</strong> {item.description}</p>
            ))}
          </div>
        </>
      )}

      {/* Substitutions & Dietary - TipCard Style */}
      {(Array.isArray((recipe as any).substitutions) && (recipe as any).substitutions.length > 0) || (Array.isArray((recipe as any).dietaryAdaptations) && (recipe as any).dietaryAdaptations.length > 0) ? (
        <div className="container border-2 border-solid rounded-lg shadow-sm" style={{ borderColor: '#3F7D58' }}>
          <div className="p-6 border border-dashed" style={{ background: 'linear-gradient(135deg, #E8F5EA 0%, #F5F9F6 100%)', borderColor: '#7FAD8A' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3F7D58 0%, #2D5A42 100%)' }}>
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#2D5A42' }}>Substitutions & Dietary Adaptations</h2>
            </div>
            <div className="px-2 space-y-4">
              {Array.isArray((recipe as any).substitutions) && (recipe as any).substitutions.length > 0 && (
                <div>
                  <p className="text-gray-800 text-lg leading-relaxed font-medium mb-2"><strong>Ingredient Substitutions:</strong></p>
                  <ul className="w-full space-y-2">
                    {(recipe as any).substitutions.map((item: any, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="text-lg font-bold mt-1" style={{ color: '#2D5A42' }}>•</span>
                        <span className="text-gray-800 text-lg leading-relaxed font-medium flex-1">
                          <strong>{item.ingredient}</strong> → {item.substitute}{item.note && <span className="italic text-gray-600"> ({item.note})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray((recipe as any).dietaryAdaptations) && (recipe as any).dietaryAdaptations.length > 0 && (
                <div>
                  <p className="text-gray-800 text-lg leading-relaxed font-medium mb-2"><strong>Dietary Adaptations:</strong></p>
                  <ul className="w-full space-y-2">
                    {(recipe as any).dietaryAdaptations.map((item: any, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="text-lg font-bold mt-1" style={{ color: '#2D5A42' }}>•</span>
                        <span className="text-gray-800 text-lg leading-relaxed font-medium flex-1">
                          <strong>{item.diet}:</strong> {item.howToAdapt}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

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
