// lib/image-manager.ts
// Comprehensive image management for recipes

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

export interface RecipeImageData {
  mainImage?: string;
  heroImage?: string;
  additionalImages?: string[];
  processImages?: string[];
  ingredientImages?: string[];
}

/**
 * Upload a single image file
 */
export async function uploadImage(
  file: File,
  category: string = "recipes",
  prefix?: string
): Promise<ImageUploadResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    if (prefix) formData.append("prefix", prefix);

    const response = await fetch("/api/recipe/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Upload multiple images in parallel
 */
export async function uploadMultipleImages(
  files: File[],
  category: string = "recipes"
): Promise<ImageUploadResult[]> {
  const uploadPromises = files.map((file, index) =>
    uploadImage(file, category, `image-${index}`)
  );

  return Promise.all(uploadPromises);
}

/**
 * Convert base64 to File object for upload
 */
export function base64ToFile(base64Data: string, filename: string): File {
  const byteCharacters = atob(base64Data.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const mimeType = base64Data.match(
    /data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/
  )![1];

  return new File([byteArray], filename, { type: mimeType });
}

/**
 * Coordinate recipe creation with image uploads
 */
export async function createRecipeWithImages(
  recipeData: any,
  imageFiles: RecipeImageData
): Promise<{ recipe: any; imageResults: any }> {
  try {
    // Step 1: Upload all images first
    const imageResults: any = {};

    // Upload main image
    if (imageFiles.mainImage) {
      if (
        typeof imageFiles.mainImage === "string" &&
        imageFiles.mainImage.startsWith("data:")
      ) {
        // Base64 image
        const file = base64ToFile(imageFiles.mainImage, "main-image.jpg");
        const result = await uploadImage(file, "recipes", "main");
        imageResults.mainImage = result;
        if (result.success && result.url) {
          recipeData.img = result.url;
        }
      } else if (typeof imageFiles.mainImage === "string") {
        // URL provided
        recipeData.img = imageFiles.mainImage;
      }
    }

    // Upload hero image
    if (imageFiles.heroImage) {
      if (
        typeof imageFiles.heroImage === "string" &&
        imageFiles.heroImage.startsWith("data:")
      ) {
        const file = base64ToFile(imageFiles.heroImage, "hero-image.jpg");
        const result = await uploadImage(file, "recipes", "hero");
        imageResults.heroImage = result;
        if (result.success && result.url) {
          recipeData.heroImage = result.url;
        }
      } else if (typeof imageFiles.heroImage === "string") {
        recipeData.heroImage = imageFiles.heroImage;
      }
    }

    // Upload additional images
    if (imageFiles.additionalImages && imageFiles.additionalImages.length > 0) {
      const additionalResults = await Promise.all(
        imageFiles.additionalImages.map(async (img, index) => {
          if (typeof img === "string" && img.startsWith("data:")) {
            const file = base64ToFile(img, `additional-${index}.jpg`);
            return await uploadImage(file, "recipes", `additional-${index}`);
          }
          return { success: true, url: img }; // URL provided
        })
      );

      imageResults.additionalImages = additionalResults;
      recipeData.images = additionalResults
        .filter((result) => result.success && result.url)
        .map((result) => result.url);
    }

    // Step 2: Create recipe with all image URLs
    const response = await fetch("/api/recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipeData),
    });

    if (!response.ok) {
      throw new Error("Failed to create recipe");
    }

    const recipe = await response.json();

    return { recipe, imageResults };
  } catch (error) {
    console.error("Error creating recipe with images:", error);
    throw error;
  }
}

/**
 * Update recipe with new images
 */
export async function updateRecipeImages(
  recipeId: string,
  imageFiles: RecipeImageData
): Promise<{ success: boolean; imageResults: any }> {
  try {
    // Upload new images
    const imageResults = await createRecipeWithImages({}, imageFiles);

    // Update recipe with new image URLs
    const updateData: any = {};

    if (imageResults.imageResults.mainImage?.url) {
      updateData.img = imageResults.imageResults.mainImage.url;
    }

    if (imageResults.imageResults.heroImage?.url) {
      updateData.heroImage = imageResults.imageResults.heroImage.url;
    }

    if (imageResults.imageResults.additionalImages) {
      updateData.images = imageResults.imageResults.additionalImages
        .filter((result: any) => result.success && result.url)
        .map((result: any) => result.url);
    }

    // Update recipe
    const response = await fetch(`/api/recipe?id=${recipeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error("Failed to update recipe");
    }

    return {
      success: true,
      imageResults: imageResults.imageResults,
    };
  } catch (error) {
    console.error("Error updating recipe images:", error);
    return {
      success: false,
      imageResults: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}
