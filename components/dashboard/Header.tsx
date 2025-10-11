import React from "react";
import { ChefHat, Plus } from "lucide-react";

interface HeaderProps {
  onAddRecipe: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddRecipe }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className=" xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Recipe Manager
              </h1>
              <p className="text-sm text-gray-500">
                Organize your culinary creations
              </p>
            </div>
          </div>

          <button
            onClick={onAddRecipe}
            className="bg-stone-100 border-2 border-dashed border-stone-300 px-6 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-stone-200 hover:border-stone-400 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Recipe
          </button>
        </div>
      </div>
    </header>
  );
};
