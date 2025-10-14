/**
 * Recipe Author Display Component (Server Component)
 * 
 * Handles fetching and displaying author information for recipes
 * Supports both new authorId approach and legacy embedded author objects
 */

import { Recipe } from '@/outils/types';
import { getAuthorById } from '@/lib/author-integration';
import { getAuthorImage } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { User, Calendar } from 'lucide-react';

interface RecipeAuthorProps {
  recipe: Recipe;
  size?: 'small' | 'medium' | 'large';
  showBio?: boolean;
  className?: string;
}

/**
 * Get author data for display (server-side)
 */
async function getRecipeAuthorData(recipe: Recipe) {
  // New approach: fetch by authorId
  if (recipe.authorId) {
    try {
      const authorEntity = await getAuthorById(recipe.authorId);
      if (authorEntity) {
        return {
          name: authorEntity.name,
          bio: authorEntity.bio || '',
          avatar: authorEntity.avatar || (authorEntity.img ? `/uploads/authors/${authorEntity.img}` : ''),
          link: authorEntity.link || `/authors/${authorEntity.slug}`,
          image: authorEntity.avatar || (authorEntity.img ? `/uploads/authors/${authorEntity.img}` : '')
        };
      }
    } catch (error) {
      console.error('Error fetching author:', error);
    }
  }

  // Fallback: use embedded author (backward compatibility)
  if (recipe.author) {
    return {
      name: recipe.author.name,
      bio: recipe.author.bio,
      avatar: recipe.author.avatar,
      link: recipe.author.link,
      image: recipe.author.avatar
    };
  }

  return null;
}

/**
 * Recipe Author Hero Display (for RecipeHero component)
 */
export async function RecipeAuthorHero({ recipe, className = '' }: RecipeAuthorProps) {
  const author = await getRecipeAuthorData(recipe);
  
  if (!author) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch {
      return "Unknown date";
    }
  };

  return (
    <div className={`flex items-center space-x-3 py-4 ${className}`}>
      <Image
        src={author.image || '/placeholder-user.jpg'}
        alt={author.name || "Author"}
        width={60}
        height={60}
        className="rounded-[50%] w-12 h-12 object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2 text-[19.2px] text-gray-600">
          <User className="h-4 w-4" />
          <span>By</span>
          <Link
            href={author.link || "#"}
            className="text-[#c64118] font-medium hover:underline"
          >
            {author.name || "Unknown Author"}
          </Link>
        </div>
        <div className="flex items-center space-x-2 text-[19.2px] text-gray-500 mt-1">
          <Calendar className="h-4 w-4" />
          <span>
            Updated on{" "}
            {formatDate(recipe.updatedDate)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Recipe Author Sidebar Display (for Side component)
 */
export async function RecipeAuthorSidebar({ recipe, className = '' }: RecipeAuthorProps) {
  const author = await getRecipeAuthorData(recipe);
  
  if (!author) {
    return null;
  }

  return (
    <div className={`relative text-black ${className}`}>
      {/* Dashed border container for the content */}
      <div className="border border-dashed border-black relative mt-32 border-dashed border-[var(--mo-border-width-light)] border-black rounded-2xl bg-stone-100 p-8 pt-36 mb-8">
        <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-60 h-60 z-10 flex items-center justify-center">
          {/* Avatar wrapper */}
          <div
            className="w-60 h-60 relative z-[1] overflow-hidden rounded-full bg-stone-200 mx-auto"
            style={{
              outline: "1px dashed black",
              outlineOffset: "-4px",
            }}
          >
            <Link
              href={author.link || "#"}
              title={`Recipes by ${author.name || "Author"} | Delicious Home Cooking Made Easy`}
              className="no-underline"
            >
              <Image
                height={240}
                width={240}
                alt={author.name || "Author"}
                src={author.image || '/placeholder-user.jpg'}
                className="block w-full h-full aspect-square object-cover transition-transform duration-300 ease-[cubic-bezier(0.5,1.25,0.75,1.25)] hover:scale-105 rounded-full"
              />
            </Link>
          </div>
        </div>

        {/* Content area */}
        <div className="daflex flex-col justify-center items-center text-center gap-4">
          <Link
            className="text-2xl text-black no-underline font-bold block hover:underline"
            href={author.link || "#"}
            title={author.name || "Author"}
          >
            {author.name || "Unknown Author"}
          </Link>

          <p className="text-lg m-0 text-gray-700">
            {author.bio || "Food enthusiast sharing approachable recipes for home cooks of all skill levels."}
          </p>

          <div className="flex flex-col gap-4 text-center justify-center">
            <div className="text-xl font-bold">Follow us on social media</div>

            <div className="flex items-center flex-wrap justify-center gap-4">
              <a
                href="https://www.instagram.com/recipes"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
              >
                📷
              </a>
              <a
                href="mailto:contact@recipes.com"
                className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
              >
                ✉️
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple Recipe Author Display (for cards, tables, etc.)
 */
export async function RecipeAuthorSimple({ recipe, size = 'medium', className = '' }: RecipeAuthorProps) {
  const author = await getRecipeAuthorData(recipe);
  
  if (!author) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        <span className="text-sm text-gray-600">Unknown Author</span>
      </div>
    );
  }

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6', 
    large: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={author.image || '/placeholder-user.jpg'}
        alt={author.name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
      <span className="text-sm text-gray-600">
        {author.name || "Unknown Author"}
      </span>
    </div>
  );
}