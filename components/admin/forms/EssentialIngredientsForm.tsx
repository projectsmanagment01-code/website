import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { EssentialIngredientGuideItem } from "@/outils/types";

interface EssentialIngredientsFormProps {
  essIngredientGuide: EssentialIngredientGuideItem[];
  onChange: (essIngredientGuide: EssentialIngredientGuideItem[]) => void;
}

export const EssentialIngredientsForm: React.FC<
  EssentialIngredientsFormProps
> = ({ essIngredientGuide, onChange }) => {
  const addEssentialIngredient = () => {
    onChange([
      ...essIngredientGuide,
      {
        ingredient: "",
        note: "",
      },
    ]);
  };

  const removeEssentialIngredient = (index: number) => {
    const updated = essIngredientGuide.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateEssentialIngredient = (
    index: number,
    field: keyof EssentialIngredientGuideItem,
    value: string
  ) => {
    const updated = essIngredientGuide.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  const moveEssentialIngredient = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === essIngredientGuide.length - 1)
    ) {
      return;
    }

    const updated = [...essIngredientGuide];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Essential Ingredient Guide
        </h3>
        <button
          type="button"
          onClick={addEssentialIngredient}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4" />
          Add Essential Ingredient
        </button>
      </div>

      {essIngredientGuide.length === 0 && (
        <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p>No essential ingredients added yet.</p>
          <p className="text-sm">
            Click "Add Essential Ingredient" to highlight key ingredients.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {essIngredientGuide.map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 p-6 rounded-lg border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  Essential {index + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveEssentialIngredient(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveEssentialIngredient(index, "down")}
                    disabled={index === essIngredientGuide.length - 1}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeEssentialIngredient(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Remove essential ingredient"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  value={item.ingredient}
                  onChange={(e) =>
                    updateEssentialIngredient(
                      index,
                      "ingredient",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Boneless chicken breast"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Important Note
                </label>
                <textarea
                  value={item.note}
                  onChange={(e) =>
                    updateEssentialIngredient(index, "note", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Explain why this ingredient is essential and any special preparation tips..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {essIngredientGuide.length > 0 && (
        <div className="text-sm text-gray-600 bg-orange-50 p-4 rounded-lg">
          <p className="font-medium">💡 Tip:</p>
          <p>
            Essential ingredient guides help readers understand the most
            important ingredients and how to handle them properly. Focus on
            ingredients that make or break the recipe.
          </p>
        </div>
      )}
    </div>
  );
};
