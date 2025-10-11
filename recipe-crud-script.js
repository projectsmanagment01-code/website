#!/usr/bin/env node

/**
 * Recipe CRUD Script - Upload images and create recipes via API
 * Usage: node recipe-crud-script.js [options]
 */

const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

// Configuration
const CONFIG = {
  API_BASE_URL: "http://localhost:3000", // Use relative URLs when running locally
  UPLOAD_ENDPOINT: "/api/upload",
  RECIPE_ENDPOINT: "/api/recipe",
  DEFAULT_CATEGORY: "recipes",
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// Utility functions
function log(message, type = "info") {
  const timestamp = new Date().toISOString();
  const colors = {
    info: "\x1b[36m",
    success: "\x1b[32m",
    error: "\x1b[31m",
    warning: "\x1b[33m",
    reset: "\x1b[0m",
  };
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryOperation(operation, maxRetries = CONFIG.MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      log(
        `Attempt ${attempt} failed, retrying in ${CONFIG.RETRY_DELAY}ms...`,
        "warning"
      );
      await delay(CONFIG.RETRY_DELAY * attempt);
    }
  }
}

/**
 * Upload a single image file
 * @param {string} imagePath - Path to the image file
 * @param {string} category - Category for the image
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
async function uploadImage(imagePath, category = CONFIG.DEFAULT_CATEGORY) {
  return retryOperation(async () => {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    const form = new FormData();
    const imageBuffer = fs.readFileSync(imagePath);
    const fileName = path.basename(imagePath);

    form.append("file", imageBuffer, {
      filename: fileName,
      contentType: getContentType(fileName),
    });

    if (category) {
      form.append("category", category);
    }

    log(`Uploading image: ${fileName}`, "info");

    const response = await fetch(
      `${CONFIG.API_BASE_URL}${CONFIG.UPLOAD_ENDPOINT}`,
      {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`Upload failed: ${result.error || "Unknown error"}`);
    }

    log(`✅ Image uploaded successfully: ${result.filename}`, "success");
    return result;
  });
}

/**
 * Upload multiple images
 * @param {string[]} imagePaths - Array of image file paths
 * @param {string} category - Category for the images
 * @returns {Promise<Object[]>} Array of upload results
 */
async function uploadImages(imagePaths, category = CONFIG.DEFAULT_CATEGORY) {
  const results = [];
  log(`Starting upload of ${imagePaths.length} images...`, "info");

  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i];
    try {
      log(
        `[${i + 1}/${imagePaths.length}] Processing: ${path.basename(
          imagePath
        )}`,
        "info"
      );
      const result = await uploadImage(imagePath, category);
      results.push(result);
    } catch (error) {
      log(
        `❌ Failed to upload ${path.basename(imagePath)}: ${error.message}`,
        "error"
      );
      // Continue with other images
    }
  }

  log(
    `Upload complete. ${results.length}/${imagePaths.length} images uploaded successfully.`,
    "info"
  );
  return results;
}

/**
 * Create a recipe with uploaded image URLs
 * @param {Object} recipeData - Recipe data object
 * @param {Object[]} uploadedImages - Array of uploaded image results
 * @returns {Promise<Object>} Created recipe
 */
async function createRecipe(recipeData, uploadedImages = []) {
  return retryOperation(async () => {
    // Replace image placeholders with actual URLs
    const processedRecipe = processRecipeImages(recipeData, uploadedImages);

    log(`Creating recipe: ${processedRecipe.title}`, "info");

    const response = await fetch(
      `${CONFIG.API_BASE_URL}${CONFIG.RECIPE_ENDPOINT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedRecipe),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Recipe creation failed (${response.status}): ${errorText}`
      );
    }

    const result = await response.json();
    log(
      `✅ Recipe created successfully: ${result.title} (ID: ${result.id})`,
      "success"
    );
    return result;
  });
}

/**
 * Process recipe data to replace image references with uploaded URLs
 * @param {Object} recipeData - Original recipe data
 * @param {Object[]} uploadedImages - Array of uploaded image results
 * @returns {Object} Processed recipe data
 */
function processRecipeImages(recipeData, uploadedImages) {
  const processed = { ...recipeData };

  // Create a map of original filenames to uploaded URLs
  const imageMap = {};
  uploadedImages.forEach((upload) => {
    imageMap[upload.originalName] = upload.url;
    imageMap[path.basename(upload.originalName)] = upload.url;
  });

  // Replace hero image
  if (processed.heroImage && typeof processed.heroImage === "string") {
    const heroUrl = imageMap[processed.heroImage] || processed.heroImage;
    processed.heroImage = heroUrl;
  }

  // Replace images array
  if (processed.images && Array.isArray(processed.images)) {
    processed.images = processed.images.map((img) => {
      if (typeof img === "string") {
        return imageMap[img] || img;
      }
      return img;
    });
  }

  // Replace img field
  if (processed.img && typeof processed.img === "string") {
    const imgUrl = imageMap[processed.img] || processed.img;
    processed.img = imgUrl;
  }

  return processed;
}

/**
 * Get content type based on file extension
 * @param {string} filename - Filename
 * @returns {string} Content type
 */
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return types[ext] || "application/octet-stream";
}

/**
 * Load recipe data from JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Object|Object[]} Recipe data
 */
function loadRecipeFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Recipe file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content);
}

/**
 * Main function to handle recipe creation workflow
 * @param {Object} options - Options object
 */
async function main(options = {}) {
  try {
    const {
      recipeFile,
      imageFiles = [],
      category = CONFIG.DEFAULT_CATEGORY,
      outputFile,
    } = options;

    log("🚀 Starting Recipe CRUD Script", "info");
    log(`API Base URL: ${CONFIG.API_BASE_URL}`, "info");

    let recipeData;
    let uploadedImages = [];

    // Load recipe data
    if (recipeFile) {
      log(`Loading recipe from: ${recipeFile}`, "info");
      recipeData = loadRecipeFromFile(recipeFile);
    } else {
      throw new Error("Recipe file is required. Use --recipe-file option.");
    }

    // Upload images if provided
    if (imageFiles.length > 0) {
      log(`Uploading ${imageFiles.length} images...`, "info");
      uploadedImages = await uploadImages(imageFiles, category);
    }

    // Handle single recipe
    if (!Array.isArray(recipeData)) {
      const result = await createRecipe(recipeData, uploadedImages);

      if (outputFile) {
        fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
        log(`Result saved to: ${outputFile}`, "success");
      }

      return result;
    }

    // Handle multiple recipes
    log(`Processing ${recipeData.length} recipes...`, "info");
    const results = [];

    for (let i = 0; i < recipeData.length; i++) {
      const recipe = recipeData[i];
      try {
        log(
          `[${i + 1}/${recipeData.length}] Processing recipe: ${recipe.title}`,
          "info"
        );
        const result = await createRecipe(recipe, uploadedImages);
        results.push(result);
      } catch (error) {
        log(
          `❌ Failed to create recipe ${recipe.title}: ${error.message}`,
          "error"
        );
        results.push({ error: error.message, recipe: recipe.title });
      }
    }

    if (outputFile) {
      fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
      log(`Results saved to: ${outputFile}`, "success");
    }

    log(
      `✅ Script completed. ${results.filter((r) => !r.error).length}/${
        recipeData.length
      } recipes created successfully.`,
      "success"
    );
    return results;
  } catch (error) {
    log(`❌ Script failed: ${error.message}`, "error");
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Simple argument parsing
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--recipe-file":
      case "-r":
        options.recipeFile = args[++i];
        break;
      case "--image-files":
      case "-i":
        options.imageFiles = args[++i].split(",");
        break;
      case "--category":
      case "-c":
        options.category = args[++i];
        break;
      case "--output":
      case "-o":
        options.outputFile = args[++i];
        break;
      case "--help":
      case "-h":
        console.log(`
Recipe CRUD Script

Usage: node recipe-crud-script.js [options]

Options:
  -r, --recipe-file <file>    Path to recipe JSON file (required)
  -i, --image-files <files>   Comma-separated list of image files to upload
  -c, --category <category>   Image category (default: recipes)
  -o, --output <file>         Output file for results
  -h, --help                  Show this help

Examples:
  node recipe-crud-script.js -r recipe.json -i image1.jpg,image2.png
  node recipe-crud-script.js --recipe-file recipes.json --category recipes --output results.json
        `);
        process.exit(0);
    }
  }

  if (!options.recipeFile) {
    console.error(
      "❌ Recipe file is required. Use --recipe-file option or --help for usage."
    );
    process.exit(1);
  }

  main(options);
}

// Export functions for programmatic use
module.exports = {
  uploadImage,
  uploadImages,
  createRecipe,
  processRecipeImages,
  main,
};
