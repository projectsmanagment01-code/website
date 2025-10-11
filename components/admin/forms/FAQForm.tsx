import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { FAQItem } from "@/outils/types";

interface FAQFormProps {
  faq: FAQItem[];
  onChange: (faq: FAQItem[]) => void;
}

export const FAQForm: React.FC<FAQFormProps> = ({ faq, onChange }) => {
  const addFAQ = () => {
    onChange([
      ...faq,
      {
        question: "",
        answer: "",
      },
    ]);
  };

  const removeFAQ = (index: number) => {
    const updated = faq.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateFAQ = (index: number, field: keyof FAQItem, value: string) => {
    const updated = faq.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  const moveFAQ = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === faq.length - 1)
    ) {
      return;
    }

    const updated = [...faq];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Frequently Asked Questions
        </h3>
        <button
          type="button"
          onClick={addFAQ}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {faq.length === 0 && (
        <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p>No FAQ items added yet.</p>
          <p className="text-sm">Click "Add FAQ" to get started.</p>
        </div>
      )}

      <div className="space-y-4">
        {faq.map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 p-6 rounded-lg border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  FAQ {index + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveFAQ(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFAQ(index, "down")}
                    disabled={index === faq.length - 1}
                    className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFAQ(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Remove FAQ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => updateFAQ(index, "question", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What is the most common question about this recipe?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer
                </label>
                <textarea
                  value={item.answer}
                  onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Provide a detailed answer to help users..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {faq.length > 0 && (
        <div className="text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg">
          <p className="font-medium">💡 Tip:</p>
          <p>
            FAQ sections help address common concerns and questions readers
            might have. Think about substitutions, storage, troubleshooting, and
            variations.
          </p>
        </div>
      )}
    </div>
  );
};
