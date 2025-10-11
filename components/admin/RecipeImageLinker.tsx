"use client";
import React, { useState, useEffect } from "react";
import { Search, Link, Unlink, Image as ImageIcon, X } from "lucide-react";
import { Recipe } from "@/outils/types";

interface RecipeImageLinkerProps {
  imageUrl: string;
  onClose: () => void;
  onImageLinked?: () => void;
}

interface RecipeOption {
  id: string;
  title: string;
  slug: string;
  img: string;
  heroImage: string;
  images: string[];
}

export const RecipeImageLinker: React.FC<RecipeImageLinkerProps> = ({
  imageUrl,
  onClose,
  onImageLinked,
}) => {
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeOption | null>(
    null
  );
  const [imageType, setImageType] = useState<"main" | "hero" | "additional">(
    "additional"
  );
  const [updating, setUpdating] = useState(false);

  // Find which recipes already use this image
  const linkedRecipes = recipes.filter(
    (recipe) =>
      recipe.img === imageUrl ||
      recipe.heroImage === imageUrl ||
      recipe.images.includes(imageUrl)
  );

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const response = await fetch("/api/recipe");
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error("Failed to load recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const linkImageToRecipe = async () => {
    if (!selectedRecipe) return;

    setUpdating(true);
    try {
      const updatedRecipe = { ...selectedRecipe };

      // Update the recipe based on selected image type
      switch (imageType) {
        case "main":
          updatedRecipe.img = imageUrl;
          break;
        case "hero":
          updatedRecipe.heroImage = imageUrl;
          break;
        case "additional":
          if (!updatedRecipe.images.includes(imageUrl)) {
            updatedRecipe.images = [...updatedRecipe.images, imageUrl];
          }
          break;
      }

      const response = await fetch(`/api/recipe`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...updatedRecipe, id: selectedRecipe.id }),
      });

      if (response.ok) {
        // Update local state
        setRecipes((prev) =>
          prev.map((r) => (r.id === selectedRecipe.id ? updatedRecipe : r))
        );
        onImageLinked?.();

        // Show success message
        alert(
          `Image successfully linked as ${imageType} image for "${selectedRecipe.title}"`
        );
      } else {
        throw new Error("Failed to update recipe");
      }
    } catch (error) {
      console.error("Error linking image:", error);
      alert("Failed to link image to recipe");
    } finally {
      setUpdating(false);
    }
  };

  const unlinkImageFromRecipe = async (
    recipe: RecipeOption,
    type: "main" | "hero" | "additional"
  ) => {
    setUpdating(true);
    try {
      const updatedRecipe = { ...recipe };

      switch (type) {
        case "main":
          updatedRecipe.img = "";
          break;
        case "hero":
          updatedRecipe.heroImage = "";
          break;
        case "additional":
          updatedRecipe.images = updatedRecipe.images.filter(
            (img) => img !== imageUrl
          );
          break;
      }

      const response = await fetch(`/api/recipe`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...updatedRecipe, id: recipe.id }),
      });

      if (response.ok) {
        setRecipes((prev) =>
          prev.map((r) => (r.id === recipe.id ? updatedRecipe : r))
        );
        onImageLinked?.();

        alert(`Image unlinked from "${recipe.title}"`);
      } else {
        throw new Error("Failed to update recipe");
      }
    } catch (error) {
      console.error("Error unlinking image:", error);
      alert("Failed to unlink image from recipe");
    } finally {
      setUpdating(false);
    }
  };

  const getImageTypeInRecipe = (recipe: RecipeOption): string[] => {
    const types: string[] = [];
    if (recipe.img === imageUrl) types.push("main");
    if (recipe.heroImage === imageUrl) types.push("hero");
    if (recipe.images.includes(imageUrl)) types.push("additional");
    return types;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Link className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Link Image to Recipe
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={updating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Image Preview */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={imageUrl}
                alt="Selected image"
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
              />
              <div>
                <p className="font-medium text-gray-900">Selected Image</p>
                <p className="text-sm text-gray-500 break-all">{imageUrl}</p>
              </div>
            </div>
          </div>

          {/* Currently Linked Recipes */}
          {linkedRecipes.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-3">
                Currently linked to {linkedRecipes.length} recipe(s):
              </h3>
              <div className="space-y-2">
                {linkedRecipes.map((recipe) => {
                  const types = getImageTypeInRecipe(recipe);
                  return (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between bg-white p-3 rounded border"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={recipe.img || "/placeholder.jpg"}
                          alt={recipe.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {recipe.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Linked as: {types.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {types.map((type) => (
                          <button
                            key={type}
                            onClick={() =>
                              unlinkImageFromRecipe(
                                recipe,
                                type as "main" | "hero" | "additional"
                              )
                            }
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            disabled={updating}
                          >
                            Unlink {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Link to New Recipe */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Link to Recipe</h3>

            {/* Image Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Type
              </label>
              <div className="flex space-x-4">
                {[
                  {
                    value: "main",
                    label: "Main Image",
                    desc: "Primary recipe photo",
                  },
                  {
                    value: "hero",
                    label: "Hero Image",
                    desc: "Banner/featured image",
                  },
                  {
                    value: "additional",
                    label: "Additional",
                    desc: "Process/ingredient shots",
                  },
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      value={option.value}
                      checked={imageType === option.value}
                      onChange={(e) =>
                        setImageType(
                          e.target.value as "main" | "hero" | "additional"
                        )
                      }
                      className="mr-2"
                    />
                    <div>
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Recipe Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Recipes
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by recipe title or slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Recipe Selection */}
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRecipe?.id === recipe.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={recipe.img || "/placeholder.jpg"}
                        alt={recipe.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {recipe.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          /{recipe.slug}
                        </p>
                      </div>
                      {linkedRecipes.some((r) => r.id === recipe.id) && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Already linked
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {filteredRecipes.length === 0 && searchTerm && (
                  <p className="text-center text-gray-500 py-4">
                    No recipes found matching "{searchTerm}"
                  </p>
                )}
              </div>
            )}

            {/* Link Button */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={linkImageToRecipe}
                disabled={!selectedRecipe || updating}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {updating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Link className="w-4 h-4 mr-2" />
                )}
                Link Image to Recipe
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={updating}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
