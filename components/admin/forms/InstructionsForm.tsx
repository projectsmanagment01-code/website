import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Instruction } from "@/outils/types";

interface InstructionsFormProps {
  instructions: Instruction[];
  onChange: (instructions: Instruction[]) => void;
}

export const InstructionsForm: React.FC<InstructionsFormProps> = ({
  instructions,
  onChange,
}) => {
  const addInstruction = () => {
    onChange([
      ...instructions,
      {
        step: `Step ${String(instructions.length + 1).padStart(2, "0")}`,
        instruction: "",
      },
    ]);
  };

  const removeInstruction = (index: number) => {
    const updated = instructions.filter((_, i) => i !== index);
    // Renumber the steps
    const renumbered = updated.map((instruction, i) => ({
      ...instruction,
      step: `Step ${String(i + 1).padStart(2, "0")}`,
    }));
    onChange(renumbered);
  };

  const updateInstruction = (
    index: number,
    field: keyof Instruction,
    value: string
  ) => {
    const updated = instructions.map((instruction, i) =>
      i === index ? { ...instruction, [field]: value } : instruction
    );
    onChange(updated);
  };

  const moveInstruction = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === instructions.length - 1)
    ) {
      return;
    }

    const updated = [...instructions];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    // Renumber steps
    const renumbered = updated.map((instruction, i) => ({
      ...instruction,
      step: `Step ${String(i + 1).padStart(2, "0")}`,
    }));

    onChange(renumbered);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
        <button
          type="button"
          onClick={addInstruction}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4" />
          Add Step
        </button>
      </div>

      {instructions.length === 0 && (
        <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p>No instructions added yet.</p>
          <p className="text-sm">Click "Add Step" to get started.</p>
        </div>
      )}

      <div className="space-y-4">
        {instructions.map((instruction, index) => (
          <div
            key={index}
            className="bg-gray-50 p-6 rounded-lg border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {instruction.step}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveInstruction(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveInstruction(index, "down")}
                    disabled={index === instructions.length - 1}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Remove instruction"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instruction Details
              </label>
              <textarea
                value={instruction.instruction}
                onChange={(e) =>
                  updateInstruction(index, "instruction", e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe this step in detail..."
              />
            </div>
          </div>
        ))}
      </div>

      {instructions.length > 0 && (
        <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
          <p className="font-medium">💡 Tip:</p>
          <p>
            Write clear, detailed instructions. Use action words and be specific
            about timing, temperatures, and techniques.
          </p>
        </div>
      )}
    </div>
  );
};
