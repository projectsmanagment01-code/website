import React from "react";
import { RecipeImageManager } from "../RecipeImageManager";

interface BasicInfoFormProps {
  title: string;
  intro: string;
  img: string;
  heroImage?: string;
  images?: string[];
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  title,
  intro,
  img,
  heroImage = "",
  images = [],
  onChange,
  errors = {},
}) => {
  const handleMainImageChange = (url: string) => {
    onChange("img", url);
  };

  const handleHeroImageChange = (url: string) => {
    onChange("heroImage", url);
  };

  const handleAdditionalImagesChange = (newImages: string[]) => {
    onChange("images", newImages);
  };

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900">
        Basic Recipe Information
      </h3>

      {/* Basic Text Fields */}
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
        </div>
      </div>

      {/* Enhanced Image Management */}
      <RecipeImageManager
        mainImage={img}
        heroImage={heroImage}
        additionalImages={images}
        onMainImageChange={handleMainImageChange}
        onHeroImageChange={handleHeroImageChange}
        onAdditionalImagesChange={handleAdditionalImagesChange}
        errors={errors}
      />

      {/* Tips */}
      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
        <p className="font-medium">💡 Tips:</p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>• Choose a compelling title that describes your recipe</li>
          <li>• Write an engaging introduction that tells a story</li>
          <li>• Main image is required and will represent your recipe</li>
          <li>• Hero image is optional and used as a banner</li>
          <li>• Additional images can be referenced in your recipe steps</li>
        </ul>
      </div>
    </div>
  );
};
