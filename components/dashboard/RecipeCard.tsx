import React from "react";
import { Clock, Users, ChefHat, Edit } from "lucide-react";
import { Recipe } from "@/outils/types";
import { getAuthorImage } from "@/lib/utils";

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onEdit }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        <img
          src={recipe.img || recipe.heroImage}
          alt={recipe.imageAlt || recipe.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
            {recipe.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {recipe.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {recipe.shortDescription}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.timing?.totalTime || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{recipe.recipeInfo?.servings || "N/A"} servings</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="w-4 h-4" />
            <span>{recipe.recipeInfo?.difficulty || "N/A"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={getAuthorImage(recipe.author)}
              alt={recipe.author?.name || "Author"}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600">
              {recipe.author?.name || "Unknown Author"}
            </span>
          </div>

          <button
            onClick={() => onEdit(recipe)}
            className="bg-stone-100 border-2 border-dashed border-stone-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-stone-200 hover:border-stone-400 transition-colors duration-200 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Recipe
          </button>
        </div>
      </div>
    </div>
  );
};
