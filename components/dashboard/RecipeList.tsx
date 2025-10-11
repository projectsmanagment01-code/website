import React from "react";
import { Recipe } from "@/outils/types";
import { RecipeCard } from "./RecipeCard";

interface RecipeListProps {
  recipes: Recipe[];
  onEditRecipe: (recipe: Recipe) => void;
}

export const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  onEditRecipe,
}) => {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">🍳</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No recipes yet
        </h3>
        <p className="text-gray-500">Start by adding your first recipe!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onEdit={onEditRecipe} />
      ))}
    </div>
  );
};
