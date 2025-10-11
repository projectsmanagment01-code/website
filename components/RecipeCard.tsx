import { Clock, Users, ChefHat, Utensils, Globe, Heart } from "lucide-react";

interface Recipe {
  title: string;
  shortDescription: string;
  timing: {
    prepTime: string;
    cookTime: string;
    totalTime: string;
  };
  recipeInfo: {
    difficulty: string;
    cuisine: string;
    servings: string;
    dietary: string;
  };
  author: {
    name: string;
  };
  ingredients: {
    honeySesameeSauce: Array<{ number: string; ingredient: string }>;
    chickenAndVegetables: Array<{ number: string; ingredient: string }>;
  };
  instructions: Array<{
    step: string;
    instruction: string;
  }>;
  notes: string[];
  tools: string[];
  allergyInfo: string;
  nutritionDisclaimer: string;
}

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <div
      id="recipe-card"
      className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 space-y-6"
    >
      {/* Ingredients */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Ingredients</h3>

        {/* Honey Sesame Sauce */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            → Honey Sesame Sauce
          </h4>
          <div className="space-y-2">
            {recipe.ingredients.honeySesameeSauce.map((item) => (
              <div key={item.number} className="flex space-x-3">
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded font-bold min-w-[32px] text-center">
                  {item.number}
                </span>
                <span className="text-sm text-gray-700 flex-1">
                  {item.ingredient}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chicken and Vegetables */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            → Chicken and Vegetables
          </h4>
          <div className="space-y-2">
            {recipe.ingredients.chickenAndVegetables.map((item) => (
              <div key={item.number} className="flex space-x-3">
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded font-bold min-w-[32px] text-center">
                  {item.number}
                </span>
                <span className="text-sm text-gray-700 flex-1">
                  {item.ingredient}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Instructions</h3>
        <div className="space-y-4">
          {recipe.instructions.map((step, index) => (
            <div key={index}>
              <div className="bg-green-600 text-white text-sm px-3 py-1 rounded font-bold inline-block mb-2">
                {step.step}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {step.instruction}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Notes</h3>
        <div className="space-y-2">
          {recipe.notes.map((note, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold min-w-[20px] text-center">
                {index + 1}
              </span>
              <span className="text-sm text-gray-700">{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Tools You'll Need
        </h3>
        <ul className="space-y-1 text-sm text-gray-700">
          {recipe.tools.map((tool, index) => (
            <li key={index} className="flex items-center space-x-2">
              <span className="text-green-600">•</span>
              <span>{tool}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Allergy Info */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Allergy Information
        </h3>
        <p className="text-sm text-gray-700">▶ {recipe.allergyInfo}</p>
      </div>

      {/* Nutrition Disclaimer */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Nutrition Facts (Per Serving)
        </h3>
        <p className="text-sm text-gray-700">▶ {recipe.nutritionDisclaimer}</p>
      </div>
    </div>
  );
}
