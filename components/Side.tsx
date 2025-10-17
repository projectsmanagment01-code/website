import { getHostname } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { getAuthorById } from '@/lib/author-integration';
import { getAuthorImageUrl } from '@/lib/author-image';

async function AuthorCard({ recipe }: { recipe: any }) {
  let authorData = null;
  let authorImageUrl = '/placeholder-user.jpg';

  // Fetch author by authorId
  if (recipe.authorId) {
    try {
      const authorEntity = await getAuthorById(recipe.authorId);
      if (authorEntity) {
        // Use the unified image helper
        authorImageUrl = getAuthorImageUrl(authorEntity);
        
        authorData = {
          name: authorEntity.name,
          bio: authorEntity.bio || '',
          avatar: authorImageUrl,
          link: `/authors`  // Always link to authors page, no individual profiles
        };
      }
    } catch (error) {
      console.error('Error fetching author:', error);
    }
  }

  // Fallback: use embedded author (backward compatibility)
  if (!authorData && recipe.author) {
    // If author has avatar or img, use the helper
    if (recipe.author.avatar || recipe.author.img) {
      authorImageUrl = getAuthorImageUrl({
        avatar: recipe.author.avatar,
        img: recipe.author.img,
        name: recipe.author.name
      });
    }
    
    authorData = {
      name: recipe.author.name,
      bio: recipe.author.bio,
      avatar: authorImageUrl,
      link: '/authors'  // Always link to authors page
    };
  }

  if (!authorData) {
    return null;
  }

  // Get author intro text - Full version without truncation
  const getAuthorIntro = (bio: string): string => {
    if (!bio) return `A passionate home cook sharing delicious recipes that bring families together. My favorite things include cooking, sharing meals, and creating memorable moments around the dinner table.`;
    
    // Remove the author name intro part since we handle that separately
    const cleanBio = bio.replace(/^Hey[—\-\s]*I'm\s+\w+[!.]?\s*/i, '');
    
    // Return the full bio without truncation
    return cleanBio || bio;
  };

  const introText = getAuthorIntro(authorData.bio);

  return (
    <div className="bg-white rounded-lg p-4 md:p-8 text-center shadow-sm border border-gray-100">
      {/* Circular Profile Photo - Clean and Centered - 40% Larger */}
      <div className="mb-4 md:mb-6 flex justify-center items-center">
        <div className="relative w-64 h-64 md:w-96 md:h-96">
          <Image
            src={authorData.avatar}
            alt={authorData.name}
            width={384}
            height={384}
            quality={100}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>

      {/* Author Introduction - Responsive Typography */}
      <div className="mb-4 md:mb-8">
        <p className="text-gray-700 leading-relaxed text-sm md:text-base">
          <span className="font-medium text-base md:text-lg">Hey— I&apos;m {authorData.name}!</span>
          {introText && (
            <>
              <br />
              <span className="mt-2 md:mt-3 block">
                {introText}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Link to Authors Page */}
      <div>
        <Link
          href={authorData.link}
          className="inline-block text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors border-b border-gray-900 hover:border-orange-600"
        >
          — Meet Our Authors —
        </Link>
      </div>
    </div>
  );
}

export default function Side({ recipe, relatedRecipes = [] }: any) {
  recipe = Array.isArray(recipe) ? recipe[0] : recipe;

  return (
    <div className="relative text-black">
      {/* Author Card Section */}
      <div className="mb-8">
        <AuthorCard recipe={recipe} />
      </div>

      <div className="bg-white">
        {/* Header - Larger and more prominent */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black uppercase tracking-wide">
            You Might Also Like
          </h2>
        </div>

        {/* Recipe List - Optimized spacing for limited items */}
        <div className="space-y-6">
          {relatedRecipes.length > 0 ? (
            relatedRecipes.map((relatedRecipe: any, index: number) => (
              <div key={relatedRecipe.id || index} className="flex items-start space-x-4">
                {/* 3:4 aspect ratio thumbnail image on left */}
                <div className="flex-shrink-0">
                  <Image
                    width={240}
                    height={320}
                    className="w-[120px] h-[160px] object-cover rounded-lg"
                    alt={relatedRecipe.title}
                    quality={100}
                    src={
                      relatedRecipe.img ||
                      relatedRecipe.heroImage ||
                      relatedRecipe.images?.[0] ||
                      "/placeholder.jpg"
                    }
                  />
                </div>
                
                {/* Content on right */}
                <div className="flex-1">
                  {/* Category label in red-orange like the image */}
                  <div className="text-sm font-bold text-red-600 uppercase tracking-wider mb-2">
                    {relatedRecipe.category || "RECIPE"}
                  </div>
                  
                  {/* Recipe title with orange hover */}
                  <a
                    href={
                      relatedRecipe.slug
                        ? `/recipes/${relatedRecipe.slug}`
                        : `/recipe/${relatedRecipe.id}`
                    }
                    title={relatedRecipe.title}
                    className="text-black no-underline hover:text-orange-700 transition-colors"
                  >
                    <h3 className="font-bold text-lg leading-tight text-black mb-3">
                      {relatedRecipe.title}
                    </h3>
                  </a>
                  
                  {/* Dynamic description paragraph */}
                  {(relatedRecipe.shortDescription || relatedRecipe.description) && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {(relatedRecipe.shortDescription || relatedRecipe.description)
                        .slice(0, 100)
                        .trim()}
                      {(relatedRecipe.shortDescription || relatedRecipe.description).length > 100 ? '...' : ''}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-6 text-gray-500">
              No related recipes found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
