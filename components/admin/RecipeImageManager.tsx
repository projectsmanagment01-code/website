import React, { useState } from "react";
import { FileUpload } from "./FileUpload";
import { ImageGallery } from "./ImageGallery";
import { RecipeImageLinker } from "./RecipeImageLinker";
import {
  Plus,
  X,
  Image as ImageIcon,
  Star,
  Link as LinkIcon,
} from "lucide-react";

interface RecipeImageManagerProps {
  mainImage: string;
  heroImage: string;
  additionalImages: string[];
  onMainImageChange: (url: string) => void;
  onHeroImageChange: (url: string) => void;
  onAdditionalImagesChange: (images: string[]) => void;
  errors?: Record<string, string>;
}

export const RecipeImageManager: React.FC<RecipeImageManagerProps> = ({
  mainImage,
  heroImage,
  additionalImages = [],
  onMainImageChange,
  onHeroImageChange,
  onAdditionalImagesChange,
  errors = {},
}) => {
  const [showGallery, setShowGallery] = useState(false);
  const [showLinker, setShowLinker] = useState(false);
  const [selectedImageForLinking, setSelectedImageForLinking] =
    useState<string>("");
  const [selectedImageType, setSelectedImageType] = useState<
    "main" | "hero" | "additional"
  >("main");

  const handleImageSelect = (imageUrl: string) => {
    switch (selectedImageType) {
      case "main":
        onMainImageChange(imageUrl);
        break;
      case "hero":
        onHeroImageChange(imageUrl);
        break;
      case "additional":
        if (!additionalImages.includes(imageUrl)) {
          onAdditionalImagesChange([...additionalImages, imageUrl]);
        }
        break;
    }
    setShowGallery(false);
  };

  const openGalleryFor = (type: "main" | "hero" | "additional") => {
    setSelectedImageType(type);
    setShowGallery(true);
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    onAdditionalImagesChange(newImages);
  };

  const setAsMainImage = (url: string) => {
    onMainImageChange(url);
  };

  const setAsHeroImage = (url: string) => {
    onHeroImageChange(url);
  };

  const openRecipeLinker = (
    imageUrl: string,
    type: "main" | "hero" | "additional"
  ) => {
    setSelectedImageForLinking(imageUrl);
    setSelectedImageType(type);
    setShowLinker(true);
  };

  const closeRecipeLinker = () => {
    setShowLinker(false);
    setSelectedImageForLinking("");
  };

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900">Recipe Images</h3>

      {/* Main Recipe Image */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-500" />
          Main Recipe Image *
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <FileUpload
              category="recipes"
              currentImage={mainImage}
              onFileUploaded={(url: string) => onMainImageChange(url)}
              label="Upload Main Image"
            />
          </div>

          <div className="space-y-3">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => openGalleryFor("main")}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Choose from Gallery
              </button>
              <button
                type="button"
                onClick={() => openRecipeLinker("", "main")}
                className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg text-sm hover:bg-blue-50 flex items-center justify-center"
                title="Link existing images"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>

            {mainImage && (
              <div className="relative">
                <img
                  src={mainImage}
                  alt="Main recipe"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => onMainImageChange("")}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {errors.img && (
          <p className="mt-2 text-sm text-red-600">{errors.img}</p>
        )}
      </div>

      {/* Hero Image */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Hero Image (Banner)
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <FileUpload
              category="recipes"
              currentImage={heroImage}
              onFileUploaded={(url: string) => onHeroImageChange(url)}
              label="Upload Hero Image"
            />
          </div>

          <div className="space-y-3">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => openGalleryFor("hero")}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Choose from Gallery
              </button>
              <button
                type="button"
                onClick={() => openRecipeLinker("", "hero")}
                className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg text-sm hover:bg-blue-50 flex items-center justify-center"
                title="Link existing images"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>

            {mainImage && !heroImage && (
              <button
                type="button"
                onClick={() => setAsHeroImage(mainImage)}
                className="w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100"
              >
                Use Main Image as Hero
              </button>
            )}

            {heroImage && (
              <div className="relative">
                <img
                  src={heroImage}
                  alt="Hero"
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => onHeroImageChange("")}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Hero image appears at the top of the recipe page. If not set, main
          image will be used.
        </p>
      </div>

      {/* Additional Images */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Additional Images
        </h4>

        <div className="space-y-4">
          {/* Upload new additional image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <FileUpload
                category="recipes"
                onFileUploaded={(url: string) => {
                  if (!additionalImages.includes(url)) {
                    onAdditionalImagesChange([...additionalImages, url]);
                  }
                }}
                label="Add More Images"
              />
            </div>

            <div className="space-y-3">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => openGalleryFor("additional")}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add from Gallery
                </button>
                <button
                  type="button"
                  onClick={() => openRecipeLinker("", "additional")}
                  className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg text-sm hover:bg-blue-50 flex items-center justify-center"
                  title="Link existing images"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Display additional images */}
          {additionalImages.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Additional Images ({additionalImages.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {additionalImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Additional ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                    />

                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                        <button
                          type="button"
                          onClick={() => setAsMainImage(image)}
                          className="p-1 bg-white bg-opacity-90 rounded text-xs hover:bg-opacity-100"
                          title="Set as main"
                        >
                          <Star className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="p-1 bg-white bg-opacity-90 rounded text-xs hover:bg-opacity-100"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="mt-3 text-sm text-gray-500">
          These images can be used throughout your recipe content, cooking
          steps, and ingredients.
        </p>
      </div>

      {/* Image Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-full overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Select Image for{" "}
                  {selectedImageType === "main"
                    ? "Main"
                    : selectedImageType === "hero"
                    ? "Hero"
                    : "Additional Images"}
                </h3>
                <button
                  onClick={() => setShowGallery(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <ImageGallery
                category="recipes"
                onImageSelect={handleImageSelect}
                showSelectButton={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
        <p className="font-medium">💡 Image Tips:</p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>
            • Main image: Primary photo that represents your recipe (required)
          </li>
          <li>
            • Hero image: Large banner image for the recipe page (optional)
          </li>
          <li>
            • Additional images: Step-by-step photos, ingredients, variations
          </li>
          <li>• Use high-resolution images (1200px+ width recommended)</li>
          <li>• Images are automatically organized in the /recipes category</li>
        </ul>
      </div>

      {/* Recipe Image Linker Modal */}
      {showLinker && (
        <RecipeImageLinker
          imageUrl={selectedImageForLinking}
          onClose={closeRecipeLinker}
          onImageLinked={() => {
            closeRecipeLinker();
            // The image has been linked to a recipe
          }}
        />
      )}
    </div>
  );
};
