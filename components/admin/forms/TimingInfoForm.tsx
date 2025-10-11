import React from "react";
import { Timing, RecipeInfo } from "@/outils/types";

interface TimingInfoFormProps {
  timing: Timing;
  recipeInfo: RecipeInfo;
  onTimingChange: (timing: Timing) => void;
  onRecipeInfoChange: (recipeInfo: RecipeInfo) => void;
}

export const TimingInfoForm: React.FC<TimingInfoFormProps> = ({
  timing,
  recipeInfo,
  onTimingChange,
  onRecipeInfoChange,
}) => {
  const handleTimingChange = (field: keyof Timing, value: string) => {
    onTimingChange({
      ...timing,
      [field]: value,
    });
  };

  const handleRecipeInfoChange = (field: keyof RecipeInfo, value: string) => {
    onRecipeInfoChange({
      ...recipeInfo,
      [field]: value,
    });
  };

  return (
    <div className="space-y-8">
      {/* Timing Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Timing Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prep Time
            </label>
            <input
              type="text"
              value={timing.prepTime || ""}
              onChange={(e) => handleTimingChange("prepTime", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="15 Minutes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cook Time
            </label>
            <input
              type="text"
              value={timing.cookTime || ""}
              onChange={(e) => handleTimingChange("cookTime", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="30 Minutes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Time
            </label>
            <input
              type="text"
              value={timing.totalTime || ""}
              onChange={(e) => handleTimingChange("totalTime", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="45 Minutes"
            />
          </div>
        </div>
      </div>

      {/* Recipe Info Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recipe Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              value={recipeInfo.difficulty || ""}
              onChange={(e) =>
                handleRecipeInfoChange("difficulty", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine Type
            </label>
            <input
              type="text"
              value={recipeInfo.cuisine || ""}
              onChange={(e) =>
                handleRecipeInfoChange("cuisine", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Italian, Chinese, American, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servings
            </label>
            <input
              type="text"
              value={recipeInfo.servings || ""}
              onChange={(e) =>
                handleRecipeInfoChange("servings", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="4 Servings"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Information
            </label>
            <input
              type="text"
              value={recipeInfo.dietary || ""}
              onChange={(e) =>
                handleRecipeInfoChange("dietary", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Vegetarian, Vegan, Gluten-Free, etc."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
