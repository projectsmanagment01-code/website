import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Section } from "@/outils/types";

interface SectionsFormProps {
  sections: Section[];
  onChange: (sections: Section[]) => void;
}

export const SectionsForm: React.FC<SectionsFormProps> = ({
  sections,
  onChange,
}) => {
  const addSection = () => {
    onChange([
      ...sections,
      {
        title: "",
        content: "",
        description: "",
      },
    ]);
  };

  const removeSection = (index: number) => {
    const updated = sections.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateSection = (
    index: number,
    field: keyof Section,
    value: string | string[]
  ) => {
    const updated = sections.map((section, i) =>
      i === index ? { ...section, [field]: value } : section
    );
    onChange(updated);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }

    const updated = [...sections];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    onChange(updated);
  };

  const updateSectionItems = (index: number, value: string) => {
    const items = value.split("\n").filter((item) => item.trim());
    updateSection(index, "items", items);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Recipe Sections</h3>
        <button
          type="button"
          onClick={addSection}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      {sections.length === 0 && (
        <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p>No sections added yet.</p>
          <p className="text-sm">Click "Add Section" to get started.</p>
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div
            key={index}
            className="bg-gray-50 p-6 rounded-lg border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  Section {index + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(index, "down")}
                    disabled={index === sections.length - 1}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeSection(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Remove section"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={section.title || ""}
                  onChange={(e) =>
                    updateSection(index, "title", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Preparation Tips"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Type
                </label>
                <input
                  type="text"
                  value={section.type || ""}
                  onChange={(e) => updateSection(index, "type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., tips, notes, variations"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={section.img || ""}
                  onChange={(e) => updateSection(index, "img", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={section.placeholder || ""}
                  onChange={(e) =>
                    updateSection(index, "placeholder", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Placeholder text"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={section.content || ""}
                  onChange={(e) =>
                    updateSection(index, "content", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Main content for this section..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={section.description || ""}
                  onChange={(e) =>
                    updateSection(index, "description", e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Additional description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items (one per line)
                </label>
                <textarea
                  value={section.items?.join("\n") || ""}
                  onChange={(e) => updateSectionItems(index, e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder={`Tip 1: Keep ingredients cold\nTip 2: Use fresh herbs\nTip 3: Don't overcook`}
                />
              </div>

              {section.after && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    After Content
                  </label>
                  <input
                    type="text"
                    value={section.after}
                    onChange={(e) =>
                      updateSection(index, "after", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Content to show after..."
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {sections.length > 0 && (
        <div className="text-sm text-gray-600 bg-indigo-50 p-4 rounded-lg">
          <p className="font-medium">💡 Tip:</p>
          <p>
            Sections help organize your recipe content into digestible chunks.
            Use them for tips, variations, storage instructions, or any
            additional information.
          </p>
        </div>
      )}
    </div>
  );
};
