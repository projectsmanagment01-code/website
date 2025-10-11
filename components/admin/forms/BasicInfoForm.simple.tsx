import React from "react";
import { ImageIcon } from "lucide-react";

interface BasicInfoFormProps {
  title: string;
  intro: string;
  img: string;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  title,
  intro,
  img,
  onChange,
  errors = {},
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Basic Recipe Information
      </h3>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Honey Sesame Chicken and Broccoli"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Introduction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Introduction *
            </label>
            <textarea
              value={intro}
              onChange={(e) => onChange("intro", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Tell the story behind this recipe. What makes it special? Why will readers love it?"
            />
            {errors.intro && (
              <p className="mt-1 text-sm text-red-600">{errors.intro}</p>
            )}
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Image URL *
            </label>
            <div className="space-y-3">
              <input
                type="url"
                value={img}
                onChange={(e) => onChange("img", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
              {errors.img && (
                <p className="mt-1 text-sm text-red-600">{errors.img}</p>
              )}

              {/* Image Preview */}
              {img && (
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Preview:
                  </p>
                  <img
                    src={img}
                    alt="Recipe preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              {!img && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">
                    Add an image URL to see preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
        <p className="font-medium">💡 Tips:</p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>• Choose a compelling title that describes your recipe</li>
          <li>• Write an engaging introduction that tells a story</li>
          <li>• Use high-quality images that showcase the final dish</li>
        </ul>
      </div>
    </div>
  );
};
