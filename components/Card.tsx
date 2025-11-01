import {
  ChefHat,
  Clock,
  Globe,
  Heart,
  Info,
  Link,
  Star,
  Users,
  Utensils,
} from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import IngredientsList from "./Ingredients";
import Instruction from "./Instruction";
import { hasHtmlTags, renderSafeHtml } from "@/lib/utils";

import { Recipe } from "@/outils/types";

export const Card: React.FC<{
  recipe: Recipe;
}> = ({ recipe }) => {
  return (
    <section
      id="recipe"
      className="recipe rounded-xl shadow-lg border border-gray-300 p-2 sm:p-4 mt-12 w-full"
      style={{ 
        background: 'linear-gradient(135deg, #E8F5EA 0%, #F5F9F6 100%)'
      }}
    >
      {/* Header with Image */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 p-6 rounded-lg" style={{ 
        background: 'linear-gradient(135deg, #3F7D58 0%, #2D5A42 100%)'
      }}>
        {/* Recipe Image */}
        <div className="md:w-1/3">
          <div className="relative w-full h-48 md:h-full rounded-lg overflow-hidden shadow-md">
            <Image
              src={recipe.featureImage || recipe.images?.[0] || recipe.heroImage || "/placeholder-recipe.jpg"}
              alt={recipe.title}
              fill
              quality={75}
              priority={true}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>
        
        {/* Recipe Header Info */}
        <div className="md:w-2/3">
          <h2 className="text-4xl font-bold text-white mb-3">
            {recipe.title}
          </h2>
          <p className="text-white text-lg leading-relaxed mb-4">
            {hasHtmlTags(recipe.description) ? (
              <span
                dangerouslySetInnerHTML={renderSafeHtml(recipe.description)}
              />
            ) : (
              recipe.description
            )}
          </p>
          
          {/* Author */}
          <div className="flex items-center text-white mb-4">
            <ChefHat className="h-4 w-4 mr-2" style={{ color: '#7FAD8A' }} />
            <span>Author: </span>
            {recipe.author?.link ? (
              <NextLink 
                href={recipe.author.link}
                className="text-green-200 hover:text-green-100 hover:underline transition-colors duration-200 ml-1 cursor-pointer"
                style={{ textDecoration: 'none' }}
              >
                {recipe.author.name}
              </NextLink>
            ) : recipe.author?.name ? (
              <NextLink 
                href={`/authors/${recipe.author.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-green-200 hover:text-green-100 hover:underline transition-colors duration-200 ml-1 cursor-pointer"
                style={{ textDecoration: 'none' }}
              >
                {recipe.author.name}
              </NextLink>
            ) : (
              <span className="ml-1">Unknown Author</span>
            )}
          </div>
        </div>
      </div>

      {/* Timing Info */}
      <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border-2" style={{ borderColor: '#7FAD8A' }}>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" style={{ color: '#3F7D58' }} />
          Timing
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="rounded-lg p-4 shadow-sm" style={{ 
            background: 'linear-gradient(135deg, #E8F5EA 0%, #D4E6D7 100%)'
          }}>
            <p className="text-sm text-gray-600 mb-1">Prep Time</p>
            <p className="text-lg font-semibold" style={{ color: '#2D5A42' }}>
              {recipe?.timing?.prepTime}
            </p>
          </div>
          <div className="rounded-lg p-4 shadow-sm" style={{ 
            background: 'linear-gradient(135deg, #E8F5EA 0%, #D4E6D7 100%)'
          }}>
            <p className="text-sm text-gray-600 mb-1">Cook Time</p>
            <p className="text-lg font-semibold" style={{ color: '#2D5A42' }}>
              {recipe.timing?.cookTime}
            </p>
          </div>
          <div className="rounded-lg p-4 shadow-sm" style={{ 
            background: 'linear-gradient(135deg, #E8F5EA 0%, #D4E6D7 100%)'
          }}>
            <p className="text-sm text-gray-600 mb-1">Total Time</p>
            <p className="text-lg font-semibold" style={{ color: '#2D5A42' }}>
              {recipe.timing?.totalTime}
            </p>
          </div>
        </div>
      </div>

      {/* Recipe Details */}
      <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border-2" style={{ borderColor: '#7FAD8A' }}>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2" style={{ color: '#3F7D58' }} />
          Recipe Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 rounded-lg p-3 shadow-sm" style={{ 
            background: 'linear-gradient(135deg, #E8F5EA 0%, #D4E6D7 100%)'
          }}>
            <Utensils className="h-4 w-4" style={{ color: '#3F7D58' }} />
            <span className="text-gray-600">Category:</span>
            <span className="font-medium text-gray-900">Evening Meals</span>
          </div>
          <div className="flex items-center space-x-3 rounded-lg p-3 shadow-sm" style={{ 
            background: 'linear-gradient(135deg, #E8F5EA 0%, #D4E6D7 100%)'
          }}>
            <ChefHat className="h-4 w-4" style={{ color: '#3F7D58' }} />
            <span className="text-gray-600">Difficulty:</span>
            <span className="font-medium text-gray-900">{recipe.recipeInfo?.difficulty}</span>
          </div>
          <div className="flex items-center space-x-3 rounded-lg p-3 shadow-sm" style={{ 
            background: 'linear-gradient(135deg, #E8F5EA 0%, #D4E6D7 100%)'
          }}>
            <Globe className="h-4 w-4" style={{ color: '#3F7D58' }} />
            <span className="text-gray-600">Cuisine:</span>
            <span className="font-medium text-gray-900">{recipe.recipeInfo?.cuisine}</span>
          </div>
          <div className="flex items-center space-x-3 rounded-lg p-3 shadow-sm" style={{ 
            background: 'linear-gradient(135deg, #E8F5EA 0%, #D4E6D7 100%)'
          }}>
            <Users className="h-4 w-4" style={{ color: '#3F7D58' }} />
            <span className="text-gray-600">Yield:</span>
            <span className="font-medium text-gray-900">{recipe.recipeInfo?.servings}</span>
          </div>
          <div className="flex items-center space-x-3 rounded-lg p-3 shadow-sm md:col-span-2" style={{ 
            background: 'linear-gradient(135deg, #E8F5EA 0%, #D4E6D7 100%)'
          }}>
            <Heart className="h-4 w-4" style={{ color: '#3F7D58' }} />
            <span className="text-gray-600">Dietary:</span>
            <span className="font-medium text-gray-900">{recipe.recipeInfo?.dietary}</span>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <Utensils className="h-6 w-6 mr-3" style={{ color: '#3F7D58' }} />
          Ingredients
        </h3>
        <div className="bg-white rounded-lg p-6 shadow-sm border-2" style={{ borderColor: '#7FAD8A' }}>
          <IngredientsList ingredients={recipe.ingredients} />
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <ChefHat className="h-6 w-6 mr-3" style={{ color: '#3F7D58' }} />
          Instructions
        </h3>
        <div
          id="recipe-instructions"
          className="bg-white rounded-lg p-6 space-y-6 shadow-sm border-2"
          style={{ borderColor: '#7FAD8A' }}
        >
          {Array.isArray(recipe.instructions) && recipe.instructions.map((instruction: any, index) => (
            <Instruction key={index} index={index} instruction={instruction.instruction} />
          ))}
        </div>
      </div>

      {/* Notes & Tips */}
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <Info className="h-6 w-6 mr-3" style={{ color: '#3F7D58' }} />
          Notes & Tips
        </h3>
        <div className="bg-white border-2 rounded-lg p-6 shadow-sm" style={{ 
          borderColor: '#3F7D58',
          background: 'linear-gradient(135deg, #F5F9F6 0%, #E8F5EA 100%)'
        }}>
          <ul className="space-y-6">
            {Array.isArray(recipe.notes) && recipe.notes.map((note: string, index: number) => (
              <li
                key={index}
                className="flex items-start space-x-4"
              >
                <span 
                  className="text-white text-base font-bold px-3 py-2 rounded-full min-w-[36px] text-center transition-colors duration-200 hover:opacity-80 active:opacity-90 flex-shrink-0"
                  style={{ 
                    background: 'linear-gradient(135deg, #3F7D58 0%, #2D5A42 100%)'
                  }}
                >
                  {index + 1}
                </span>
                <span className="text-gray-800 leading-relaxed text-lg font-medium">
                  {hasHtmlTags(note) ? (
                    <span dangerouslySetInnerHTML={renderSafeHtml(note)} />
                  ) : (
                    note
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tools You'll Need */}
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <Utensils className="h-6 w-6 mr-3" style={{ color: '#3F7D58' }} />
          Tools You'll Need
        </h3>
        <div className="bg-white rounded-lg p-6 shadow-sm border-2" style={{ borderColor: '#7FAD8A' }}>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(recipe?.mustKnowTips) && recipe.mustKnowTips.map((tool: string, index: number) => (
              <li
                key={index}
                className="flex items-center space-x-4 rounded-lg p-4 shadow-sm"
                style={{ 
                  background: 'linear-gradient(135deg, #E8F5EA 0%, #D4E6D7 100%)'
                }}
              >
                <span className="text-xl font-bold" style={{ color: '#2D5A42' }}>•</span>
                <span className="text-gray-800 text-lg font-medium leading-relaxed">
                  {hasHtmlTags(tool) ? (
                    <span dangerouslySetInnerHTML={renderSafeHtml(tool)} />
                  ) : (
                    tool
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
