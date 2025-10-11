import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { RelatedRecipe } from "@/outils/types";

interface RelatedRecipesFormProps {
  relatedRecipes: RelatedRecipe[];
  onChange: (relatedRecipes: RelatedRecipe[]) => void;
}

export const RelatedRecipesForm: React.FC<RelatedRecipesFormProps> = ({
  relatedRecipes,
  onChange,
}) => {
  const addRelatedRecipe = () => {
    onChange([
      ...relatedRecipes,
      {
        title: "",
        image: "",
        link: "",
      },
    ]);
  };

  const removeRelatedRecipe = (index: number) => {
    const updated = relatedRecipes.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateRelatedRecipe = (
    index: number,
    field: keyof RelatedRecipe,
    value: string
  ) => {
    const updated = relatedRecipes.map((recipe, i) =>
      i === index ? { ...recipe, [field]: value } : recipe
    );
    onChange(updated);
  };

  const moveRelatedRecipe = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === relatedRecipes.length - 1)
    ) {
      return;
    }

    const updated = [...relatedRecipes];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Related Recipes</h3>
        <button
          type="button"
          onClick={addRelatedRecipe}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4" />
          Add Related Recipe
        </button>
      </div>

      {relatedRecipes.length === 0 && (
        <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p>No related recipes added yet.</p>
          <p className="text-sm">Click "Add Related Recipe" to get started.</p>
        </div>
      )}

      <div className="space-y-4">
        {relatedRecipes.map((recipe, index) => (
          <div
            key={index}
            className="bg-gray-50 p-6 rounded-lg border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                  Recipe {index + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveRelatedRecipe(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRelatedRecipe(index, "down")}
                    disabled={index === relatedRecipes.length - 1}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeRelatedRecipe(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Remove related recipe"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Title
                </label>
                <input
                  type="text"
                  value={recipe.title}
                  onChange={(e) =>
                    updateRelatedRecipe(index, "title", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Crispy Orange Chicken"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={recipe.image}
                  onChange={(e) =>
                    updateRelatedRecipe(index, "image", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Link
                </label>
                <input
                  type="url"
                  value={recipe.link}
                  onChange={(e) =>
                    updateRelatedRecipe(index, "link", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/recipes/recipe-slug"
                />
              </div>
            </div>

            {/* Preview */}
            {recipe.title && recipe.image && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {recipe.title}
                    </h4>
                    <p className="text-sm text-gray-600">{recipe.link}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {relatedRecipes.length > 0 && (
        <div className="text-sm text-gray-600 bg-pink-50 p-4 rounded-lg">
          <p className="font-medium">💡 Tip:</p>
          <p>
            Related recipes help readers discover similar content. Choose
            recipes that complement this one or use similar
            techniques/ingredients.
          </p>
        </div>
      )}
    </div>
  );
};
