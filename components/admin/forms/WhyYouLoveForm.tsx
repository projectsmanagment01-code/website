import React from "react";
import { WhyYouLove } from "@/outils/types";

interface WhyYouLoveFormProps {
  whyYouLove: WhyYouLove;
  onChange: (whyYouLove: WhyYouLove) => void;
}

export const WhyYouLoveForm: React.FC<WhyYouLoveFormProps> = ({
  whyYouLove,
  onChange,
}) => {
  const updateWhyYouLove = (
    field: keyof WhyYouLove,
    value: string | string[]
  ) => {
    onChange({ ...whyYouLove, [field]: value });
  };

  const updateItems = (value: string) => {
    const items = value.split("\n").filter((item) => item.trim());
    updateWhyYouLove("items", items);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Why You'll Love It Section
      </h3>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Type
            </label>
            <input
              type="text"
              value={whyYouLove.type}
              onChange={(e) => updateWhyYouLove("type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Card, List, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={whyYouLove.title}
              onChange={(e) => updateWhyYouLove("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Why You'll Love It"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reasons (one per line, use ** for bold text)
          </label>
          <textarea
            value={whyYouLove.items.join("\n")}
            onChange={(e) => updateItems(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder={`**Better than takeout** - All those familiar sweet and savory flavors but made fresh in your own kitchen
**Quick weeknight solution** - Ready in 30 minutes from start to finish, perfect for busy evenings
**One-pan simplicity** - Everything comes together in one skillet for easy cleanup
**Kid-approved vegetables** - Even picky eaters love broccoli when it's covered in this amazing sauce`}
          />
          <p className="text-sm text-gray-600 mt-2">
            Tip: Use **text** to make portions bold. Each line becomes a
            separate reason.
          </p>
        </div>

        {/* Preview */}
        {whyYouLove.items.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">
                {whyYouLove.title}
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {whyYouLove.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: item.replace(
                          /\*\*(.*?)\*\*/g,
                          "<strong>$1</strong>"
                        ),
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg">
        <p className="font-medium">💡 Tip:</p>
        <p>
          This section helps convince readers to try your recipe. Focus on the
          benefits, unique features, and what makes this recipe special. Use
          compelling language and highlight the value proposition.
        </p>
      </div>
    </div>
  );
};
