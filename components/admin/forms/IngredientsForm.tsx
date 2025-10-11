import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { IngredientsGroup } from "@/outils/types";

interface IngredientsFormProps {
  ingredients: IngredientsGroup[];
  onChange: (ingredients: IngredientsGroup[]) => void;
}

export const IngredientsForm: React.FC<IngredientsFormProps> = ({
  ingredients,
  onChange,
}) => {
  const addIngredientsGroup = () => {
    onChange([
      ...ingredients,
      {
        section: "",
        items: [""],
      },
    ]);
  };

  const removeIngredientsGroup = (groupIndex: number) => {
    onChange(ingredients.filter((_, index) => index !== groupIndex));
  };

  const updateGroupSection = (groupIndex: number, section: string) => {
    const updated = ingredients.map((group, index) =>
      index === groupIndex ? { ...group, section } : group
    );
    onChange(updated);
  };

  const addIngredientItem = (groupIndex: number) => {
    const updated = ingredients.map((group, index) =>
      index === groupIndex ? { ...group, items: [...group.items, ""] } : group
    );
    onChange(updated);
  };

  const removeIngredientItem = (groupIndex: number, itemIndex: number) => {
    const updated = ingredients.map((group, index) =>
      index === groupIndex
        ? { ...group, items: group.items.filter((_, i) => i !== itemIndex) }
        : group
    );
    onChange(updated);
  };

  const updateIngredientItem = (
    groupIndex: number,
    itemIndex: number,
    value: string
  ) => {
    const updated = ingredients.map((group, index) =>
      index === groupIndex
        ? {
            ...group,
            items: group.items.map((item, i) =>
              i === itemIndex ? value : item
            ),
          }
        : group
    );
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
        <button
          type="button"
          onClick={addIngredientsGroup}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      {ingredients.length === 0 && (
        <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p>No ingredient sections added yet.</p>
          <p className="text-sm">Click "Add Section" to get started.</p>
        </div>
      )}

      {ingredients.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="bg-gray-50 p-6 rounded-lg border border-gray-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 mr-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Name
              </label>
              <input
                type="text"
                value={group.section}
                onChange={(e) => updateGroupSection(groupIndex, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Main Ingredients, For the Sauce"
              />
            </div>
            <button
              type="button"
              onClick={() => removeIngredientsGroup(groupIndex)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Remove section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                Ingredients
              </label>
              <button
                type="button"
                onClick={() => addIngredientItem(groupIndex)}
                className="flex items-center gap-1 text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="w-3 h-3" />
                Add Item
              </button>
            </div>

            {group.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    updateIngredientItem(groupIndex, itemIndex, e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2 cups all-purpose flour"
                />
                {group.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredientItem(groupIndex, itemIndex)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Remove ingredient"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {group.items.length === 0 && (
              <p className="text-gray-500 text-sm italic">
                No ingredients in this section.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
