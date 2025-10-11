"use client";
import React, { useState, useEffect } from "react";
import { Recipe } from "@/outils/types";
import { Image as ImageIcon, Link, Unlink, Search } from "lucide-react";

interface ImageUsageViewerProps {
  onImageSelect?: (imageUrl: string) => void;
}

interface ImageUsage {
  url: string;
  filename: string;
  usages: {
    recipeId: string;
    recipeTitle: string;
    type: "main" | "hero" | "additional";
  }[];
}

export const ImageUsageViewer: React.FC<ImageUsageViewerProps> = ({
  onImageSelect,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [imageUsages, setImageUsages] = useState<ImageUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all recipes
      const response = await fetch("/api/recipe");
      if (response.ok) {
        const recipesData = await response.json();
        setRecipes(recipesData);

        // Build image usage map
        const usageMap: Record<string, ImageUsage> = {};

        recipesData.forEach((recipe: Recipe) => {
          // Main image
          if (recipe.img) {
            if (!usageMap[recipe.img]) {
              usageMap[recipe.img] = {
                url: recipe.img,
                filename: recipe.img.split("/").pop() || recipe.img,
                usages: [],
              };
            }
            usageMap[recipe.img].usages.push({
              recipeId: recipe.id,
              recipeTitle: recipe.title,
              type: "main",
            });
          }

          // Hero image
          if (recipe.heroImage) {
            if (!usageMap[recipe.heroImage]) {
              usageMap[recipe.heroImage] = {
                url: recipe.heroImage,
                filename: recipe.heroImage.split("/").pop() || recipe.heroImage,
                usages: [],
              };
            }
            usageMap[recipe.heroImage].usages.push({
              recipeId: recipe.id,
              recipeTitle: recipe.title,
              type: "hero",
            });
          }

          // Additional images
          recipe.images?.forEach((imageUrl) => {
            if (!usageMap[imageUrl]) {
              usageMap[imageUrl] = {
                url: imageUrl,
                filename: imageUrl.split("/").pop() || imageUrl,
                usages: [],
              };
            }
            usageMap[imageUrl].usages.push({
              recipeId: recipe.id,
              recipeTitle: recipe.title,
              type: "additional",
            });
          });
        });

        setImageUsages(Object.values(usageMap));
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsages = imageUsages.filter(
    (usage) =>
      usage.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usage.usages.some((u) =>
        u.recipeTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "main":
        return "bg-blue-100 text-blue-800";
      case "hero":
        return "bg-purple-100 text-purple-800";
      case "additional":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Image Usage Overview
        </h2>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search images or recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {imageUsages.length}
          </div>
          <div className="text-sm text-blue-600">Total Images</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {imageUsages.filter((u) => u.usages.length > 0).length}
          </div>
          <div className="text-sm text-green-600">Used Images</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {imageUsages.filter((u) => u.usages.length === 0).length}
          </div>
          <div className="text-sm text-red-600">Unused Images</div>
        </div>
      </div>

      {/* Image Usage List */}
      <div className="space-y-4">
        {filteredUsages.map((usage) => (
          <div
            key={usage.url}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-4">
              <img
                src={usage.url}
                alt={usage.filename}
                className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                onClick={() => onImageSelect?.(usage.url)}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate">
                    {usage.filename}
                  </h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(usage.url)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                  >
                    Copy URL
                  </button>
                </div>

                {usage.usages.length === 0 ? (
                  <div className="flex items-center text-sm text-gray-500">
                    <ImageIcon className="w-4 h-4 mr-1" />
                    <span>Not used in any recipe</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Used in {usage.usages.length} recipe(s):
                    </p>
                    <div className="space-y-2">
                      {usage.usages.map((usage_item, index) => (
                        <div
                          key={`${usage_item.recipeId}-${usage_item.type}-${index}`}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {usage_item.recipeTitle}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getTypeColor(
                                usage_item.type
                              )}`}
                            >
                              {usage_item.type}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              /* TODO: Implement unlink functionality */
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Unlink from recipe"
                          >
                            <Unlink className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredUsages.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            No images found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};
