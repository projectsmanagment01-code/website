import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { CompleteProcessItem } from "@/outils/types";

interface ProcessFormProps {
  process: CompleteProcessItem[];
  onChange: (process: CompleteProcessItem[]) => void;
}

export const ProcessForm: React.FC<ProcessFormProps> = ({
  process,
  onChange,
}) => {
  const addProcessStep = () => {
    onChange([
      ...process,
      {
        title: "",
        description: "",
      },
    ]);
  };

  const removeProcessStep = (index: number) => {
    const updated = process.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateProcessStep = (
    index: number,
    field: keyof CompleteProcessItem,
    value: string
  ) => {
    const updated = process.map((step, i) =>
      i === index ? { ...step, [field]: value } : step
    );
    onChange(updated);
  };

  const moveProcessStep = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === process.length - 1)
    ) {
      return;
    }

    const updated = [...process];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Process Steps</h3>
        <button
          type="button"
          onClick={addProcessStep}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4" />
          Add Process Step
        </button>
      </div>

      {process.length === 0 && (
        <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p>No process steps added yet.</p>
          <p className="text-sm">Click "Add Process Step" to get started.</p>
        </div>
      )}

      <div className="space-y-4">
        {process.map((step, index) => (
          <div
            key={index}
            className="bg-gray-50 p-6 rounded-lg border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  Step {index + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveProcessStep(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveProcessStep(index, "down")}
                    disabled={index === process.length - 1}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeProcessStep(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Remove process step"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step Title
                </label>
                <input
                  type="text"
                  value={step.title || ""}
                  onChange={(e) =>
                    updateProcessStep(index, "title", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Prepare Ingredients"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step Description
              </label>
              <textarea
                value={step.description || ""}
                onChange={(e) =>
                  updateProcessStep(index, "description", e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe what happens in this step in detail..."
              />
            </div>
          </div>
        ))}
      </div>

      {process.length > 0 && (
        <div className="text-sm text-gray-600 bg-purple-50 p-4 rounded-lg">
          <p className="font-medium">💡 Tip:</p>
          <p>
            Process steps help visualize the recipe flow. Each step should have
            a clear title, description, and optionally an image to illustrate
            the process.
          </p>
        </div>
      )}
    </div>
  );
};
