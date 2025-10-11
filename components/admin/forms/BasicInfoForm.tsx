import React, { useState, useEffect } from "react";
import { ImageIcon } from "lucide-react";
import { FileUpload } from "../FileUpload";

interface BasicInfoFormProps {
  title: string;
  intro: string;
  category?: string;
  categoryLink?: string;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  title,
  intro,
  category = "",
  categoryLink = "",
  onChange,
  errors = {},
}) => {
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch available categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const categories = await response.json();
          setAvailableCategories(categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (selectedCategory: string) => {
    onChange("category", selectedCategory);
    // Auto-generate category link
    const link = `/categories/${selectedCategory
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    onChange("categoryLink", link);
  };
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

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Category *
            </label>
            {isLoadingCategories ? (
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-500">
                  Loading categories...
                </span>
              </div>
            ) : (
              <>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category...</option>
                  {availableCategories.map((cat: any) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.title} ({cat.recipeCount || 0} recipes)
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Or type a new category name..."
                  />
                </div>
                {categoryLink && (
                  <p className="mt-1 text-xs text-gray-500">
                    Category URL: {categoryLink}
                  </p>
                )}
              </>
            )}
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
        <p className="font-medium">💡 Tips:</p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>• Choose a compelling title that describes your recipe</li>
          <li>• Write an engaging introduction that tells a story</li>
          <li>• Select an existing category or create a new one</li>
          <li>• Categories help organize and filter your recipes</li>
          <li>• Images can be uploaded in the dedicated "Images" tab</li>
        </ul>
      </div>
    </div>
  );
};
