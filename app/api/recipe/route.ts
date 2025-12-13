// Aggressive cache-busting configuration
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Updated main recipe route with better error handling
// app/api/recipe/route.ts (Enhanced version)
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { checkHybridAuthOrRespond } from "@/lib/auth-standard";
import prisma from "@/lib/prisma";
import { withRetry } from "@/lib/prisma-helpers";
import { revalidateTag, revalidatePath } from "next/cache";
import { processRecipeAuthor } from "@/lib/author-integration";
import { revalidateAdminPaths } from "@/lib/cache-busting";

// Ensure Node.js types are available
declare const process: {
  env: {
    NEXT_PUBLIC_BASE_URL?: string;
    ADMIN_SECRET?: string;
    REVALIDATE_SECRET?: string;
  };
};

/**
 * GET /api/recipe
 * Gets a single recipe by id, or all recipes if id is not provided
 * @param {NextRequest} request
 * @returns {NextResponse} a JSON response containing the recipe(s)
 */
/**
 * POST /api/recipe
 * Creates a new recipe
 * @param {NextRequest} request
 * @returns {NextResponse} a JSON response containing the created recipe
 */

export async function GET(request: NextRequest) {
  const url = new URL(request.nextUrl);
  const id = url.searchParams.get("id");
  const slug = url.searchParams.get("slug");
  const page = url.searchParams.get("page");
  const limit = url.searchParams.get("limit");
  const includePrivate = url.searchParams.get("includePrivate"); // For admin requests

  // Check if this is an admin request (with auth)
  const isAdminRequest = includePrivate === "true";
  let isAuthenticated = false;
  
  if (isAdminRequest) {
    try {
      const token = await auth.getToken(request);
      isAuthenticated = !!token;
    } catch (error) {
      isAuthenticated = false;
    }
  }

  // Define where clause based on request type
  const whereClause = (isAdminRequest && isAuthenticated) 
    ? {} // Show all recipes for authenticated admin requests
    : { href: { not: null } }; // Only show published recipes (with href) for public requests

  try {
    // Handle slug query
    if (slug) {
      const recipe = await withRetry(() =>
        prisma.recipe.findFirst({
          where: {
            slug: {
              equals: slug,
              mode: "insensitive",
            },
            ...whereClause,
          },
        })
      );

      if (!recipe) {
        return NextResponse.json(
          { error: "Recipe not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(recipe);
    }

    // Handle id query
    if (id) {
      const recipe = await withRetry(() =>
        prisma.recipe.findUnique({
          where: {
            id: id,
          },
        })
      );

      if (!recipe) {
        return NextResponse.json(
          { error: "Recipe not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(recipe);
    }

    // Handle pagination
    if (page && limit) {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const [recipes, totalCount] = await Promise.all([
        withRetry(() =>
          prisma.recipe.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            skip: skip,
            take: limitNum,
          })
        ),
        withRetry(() => prisma.recipe.count({ where: whereClause })),
      ]);

      return NextResponse.json({
        recipes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      });
    }

    // Default: return all recipes (for backward compatibility)
    const recipes = await withRetry(() =>
      prisma.recipe.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      })
    );

    // Return consistent format like paginated results
    return NextResponse.json({
      recipes,
      pagination: {
        page: 1,
        limit: recipes.length,
        total: recipes.length,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error("[RECIPES_GET] Database error:", error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication (supports both JWT and API tokens)
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    let recipe;
    try {
      recipe = await request.json();
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          details: parseError instanceof Error ? parseError.message : String(parseError),
          hint: "Ensure the request body contains valid JSON data"
        },
        { status: 400 }
      );
    }

    console.log("📥 Received recipe data:", {
      title: recipe.title,
      keys: Object.keys(recipe),
      hasAuthor: !!recipe.author,
      hasAuthorId: !!recipe.authorId
    });

    // ============================================
    // SANITIZE AND FIX COMMON JSON ISSUES
    // ============================================
    
    // Helper to sanitize string values - removes problematic characters
    const sanitizeString = (value: unknown): string | null => {
      if (value === null || value === undefined) return null;
      if (typeof value !== 'string') return String(value);
      
      // Remove repeated special characters that might be AI artifacts
      let cleaned = value
        .replace(/~{5,}/g, '') // Remove long sequences of tildes
        .replace(/={5,}/g, '') // Remove long sequences of equals
        .replace(/-{10,}/g, '---') // Reduce long dashes
        .replace(/_{5,}/g, '___') // Reduce long underscores
        .trim();
      
      return cleaned || null;
    };

    // Helper to recursively sanitize an object
    const sanitizeObject = (obj: unknown): unknown => {
      if (obj === null || obj === undefined) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item)).filter(item => item !== null && item !== '');
      }
      
      if (typeof obj === 'string') {
        return sanitizeString(obj);
      }
      
      if (typeof obj === 'object') {
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
          const sanitizedValue = sanitizeObject(value);
          // Skip null/undefined/empty values
          if (sanitizedValue !== null && sanitizedValue !== undefined && sanitizedValue !== '') {
            sanitized[key] = sanitizedValue;
          }
        }
        return sanitized;
      }
      
      return obj;
    };

    // Sanitize the entire recipe object
    recipe = sanitizeObject(recipe) as typeof recipe;
    console.log("🧹 Recipe sanitized");

    // ============================================
    // SPECIAL HANDLING FOR TOOLS FIELD (SUPPORTS BOTH FORMATS)
    // Format 1: ["Stand Mixer", "Cake Pans"] - array of strings
    // Format 2: [{tool: "Stand Mixer", description: "..."}, ...] - array of objects
    // ============================================
    if (recipe.tools) {
      if (Array.isArray(recipe.tools)) {
        console.log("🔧 Processing tools field. Type: array, Length:", recipe.tools.length);
        recipe.tools = recipe.tools.map((toolItem: any) => {
          // If already a string, keep it
          if (typeof toolItem === 'string') {
            return toolItem.trim();
          }
          // If it's an object, extract tool name and description
          if (typeof toolItem === 'object' && toolItem !== null) {
            const tool = toolItem.tool || toolItem.name || toolItem.title || '';
            const description = toolItem.description || toolItem.note || toolItem.text || '';
            const toolStr = String(tool).trim();
            const descStr = String(description).trim();
            
            if (toolStr && descStr) {
              return `${toolStr}: ${descStr}`;
            } else if (toolStr) {
              return toolStr;
            } else if (descStr) {
              return descStr;
            }
            // Fallback: stringify entire object (skip if empty)
            const jsonStr = JSON.stringify(toolItem);
            return jsonStr !== '{}' ? jsonStr : '';
          }
          // Fallback for other types
          return String(toolItem);
        }).filter((s: string) => s && s.trim() !== '' && s !== '{}');
        console.log("✅ Tools converted to strings:", recipe.tools.length, "items");
      } else if (typeof recipe.tools === 'string') {
        // Single string -> wrap in array
        console.log("🔧 Converting single tool string to array");
        recipe.tools = [recipe.tools];
      } else {
        // Invalid type -> empty array
        console.warn("⚠️ Tools field has invalid type:", typeof recipe.tools, "- resetting to empty array");
        recipe.tools = [];
      }
    } else {
      recipe.tools = [];
    }

    // Validate required fields
    const requiredFields = ['title'];
    const missingFields = requiredFields.filter(field => !recipe[field]);
    
    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields,
          hint: `Please provide: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Log complete recipe structure for debugging
    console.log("📋 Recipe fields:", {
      title: recipe.title,
      slug: recipe.slug,
      category: recipe.category,
      description: recipe.description,
      imagesCount: Array.isArray(recipe.images) ? recipe.images.length : 0,
      ingredientsCount: Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0,
      instructionsCount: Array.isArray(recipe.instructions) ? recipe.instructions.length : 0,
      hasAuthor: !!recipe.author,
      authorId: recipe.authorId,
      timing: recipe.timing
    });

    // Process author data and get authorId
    let finalAuthorId = recipe.authorId;
    
    // If recipe has embedded author but no authorId, process it
    if (recipe.author && !recipe.authorId) {
      console.log("🔄 Processing embedded author to create authorId relationship");
      try {
        finalAuthorId = await processRecipeAuthor(recipe.author);
        console.log("✅ Created/found author with ID:", finalAuthorId);
      } catch (error) {
        console.error("❌ Failed to process embedded author:", error);
        // Continue without authorId - recipe will use embedded author
      }
    }
    
    // If authorId is provided, validate it exists
    if (finalAuthorId) {
      console.log("🔍 Validating authorId:", finalAuthorId);
      const authorExists = await prisma.author.findUnique({
        where: { id: finalAuthorId }
      });
      
      if (!authorExists) {
        console.error("❌ Author with ID", finalAuthorId, "does not exist");
        return NextResponse.json(
          { error: `Author with ID ${finalAuthorId} does not exist` }, 
          { status: 400 }
        );
      }
      console.log("✅ Author validation passed:", authorExists.name);
    }

    // Generate UUID for recipe ID if not provided
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    // Generate slug from title if not provided
    const generatedSlug = recipe.slug || recipe.title?.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/-+/g, '-')            // Replace multiple hyphens with single
      .trim();

    // Fetch category info from categoryId if provided
    let categoryData = null;
    if (recipe.categoryId) {
      console.log("🔍 Fetching category data from categoryId:", recipe.categoryId);
      categoryData = await prisma.category.findUnique({
        where: { id: recipe.categoryId }
      });
      if (categoryData) {
        console.log("✅ Category found:", categoryData.name);
      } else {
        console.warn("⚠️ Category not found for ID:", recipe.categoryId);
      }
    }

    // Prepare recipe data for database with auto-generated fields
    const recipeData = {
      ...recipe,
      id: recipe.id || generateUUID(), // Use provided ID or generate UUID
      authorId: finalAuthorId, // Use processed/validated authorId
      slug: generatedSlug,
      updatedDate: recipe.updatedDate || new Date().toISOString(),
      // Auto-generate category fields from categoryId lookup
      category: recipe.category || categoryData?.name || '',
      categoryLink: recipe.categoryLink || (categoryData ? `/categories/${categoryData.slug}` : ''),
      featuredText: recipe.featuredText || recipe.shortDescription || recipe.description || '',
      href: recipe.href || `/recipes/${generatedSlug}`,
    };

    // Ensure author field exists - if we have authorId, create embedded author data
    if (finalAuthorId && !recipeData.author) {
      console.log("🔍 Fetching author data for embedded author field...");
      const authorData = await prisma.author.findUnique({
        where: { id: finalAuthorId }
      });
      
      if (authorData) {
        recipeData.author = {
          name: authorData.name,
          bio: authorData.bio || "",
          avatar: authorData.avatar || authorData.img || "",
          link: authorData.link || `/authors/${authorData.slug}`
        };
        console.log("✅ Created embedded author:", recipeData.author);
      } else {
        console.error("❌ Author not found for ID:", finalAuthorId);
      }
    }

    // Ensure author field is always present (required by schema)
    if (!recipeData.author) {
      console.error("❌ No author field found in recipe data");
      return NextResponse.json(
        { error: "Author information is required. Please select an author or provide author details." }, 
        { status: 400 }
      );
    }

    console.log("💾 Creating recipe with data:", {
      title: recipeData.title,
      authorId: recipeData.authorId,
      hasEmbeddedAuthor: !!recipeData.author
    });

    // Check if recipe with this slug already exists and generate unique slug if needed
    let finalSlug = recipeData.slug;
    let slugSuffix = 1;
    let existingRecipe = await prisma.recipe.findUnique({
      where: { slug: finalSlug }
    });

    // Keep incrementing suffix until we find a unique slug
    while (existingRecipe) {
      finalSlug = `${recipeData.slug}-${slugSuffix}`;
      console.log(`⚠️ Slug '${recipeData.slug}' already exists, trying '${finalSlug}'`);
      
      existingRecipe = await prisma.recipe.findUnique({
        where: { slug: finalSlug }
      });
      
      slugSuffix++;
      
      // Safety check to prevent infinite loops
      if (slugSuffix > 100) {
        console.error("❌ Could not generate unique slug after 100 attempts");
        return NextResponse.json(
          { 
            error: "Failed to generate unique slug",
            details: "Too many recipes with similar slugs exist. Please provide a more unique title.",
            originalSlug: recipeData.slug
          },
          { status: 400 }
        );
      }
    }

    // Update the slug if it was modified
    if (finalSlug !== recipeData.slug) {
      console.log(`✅ Generated unique slug: ${finalSlug}`);
      recipeData.slug = finalSlug;
    }

    // ============================================
    // COMPREHENSIVE FIELD TYPE VALIDATION & CONVERSION
    // ============================================

    // 1. String[] fields - convert object arrays to string arrays
    const stringArrayFields = [
      'tools', 'notes', 'mustKnowTips', 'professionalSecrets', 'keywords',
      'pairings', 'shoppingList', 'equipmentNotes', 'ingredientPrep',
      'commonMistakes', 'flavorBoosters', 'specialNotes', 'servingSuggestions',
      'images' // images is also String[]
    ];

    // Helper to convert object array to string array
    const convertObjectArrayToStrings = (arr: unknown[]): string[] => {
      return arr.map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          // Try various common field names
          const name = obj.tool || obj.name || obj.title || obj.item || obj.tip || obj.secret || '';
          const desc = obj.description || obj.note || obj.text || obj.content || '';
          const nameStr = String(name);
          const descStr = String(desc);
          // If we found a name, format properly
          if (nameStr) {
            return descStr ? `${nameStr}: ${descStr}` : nameStr;
          }
          // If only description exists, return that
          if (descStr) return descStr;
          // Fallback: stringify the whole object
          return JSON.stringify(item);
        }
        return String(item);
      }).filter(s => s && s.trim() !== '' && s !== '{}'); // Remove empty strings
    };

    for (const field of stringArrayFields) {
      // Ensure field is an array
      if (recipeData[field] === null || recipeData[field] === undefined) {
        recipeData[field] = [];
      } else if (Array.isArray(recipeData[field])) {
        // Convert object arrays to string arrays if needed
        if (recipeData[field].length > 0 && typeof recipeData[field][0] === 'object') {
          console.log(`🔄 Converting ${field} from objects to strings...`);
          recipeData[field] = convertObjectArrayToStrings(recipeData[field]);
        }
        // Ensure all items are strings
        recipeData[field] = recipeData[field].map((item: unknown) => 
          typeof item === 'string' ? item : String(item)
        );
      } else if (typeof recipeData[field] === 'string') {
        // Single string -> array with one item
        recipeData[field] = [recipeData[field]];
      }
    }

    // 2. Numeric fields - ensure correct types
    // aggregateRating: Float?
    if (recipeData.aggregateRating !== null && recipeData.aggregateRating !== undefined) {
      const rating = parseFloat(String(recipeData.aggregateRating));
      recipeData.aggregateRating = isNaN(rating) ? null : rating;
    }
    
    // reviewCount: Int?
    if (recipeData.reviewCount !== null && recipeData.reviewCount !== undefined) {
      const count = parseInt(String(recipeData.reviewCount), 10);
      recipeData.reviewCount = isNaN(count) ? null : count;
    }

    // views: Int (default 0)
    if (recipeData.views !== null && recipeData.views !== undefined) {
      const views = parseInt(String(recipeData.views), 10);
      recipeData.views = isNaN(views) ? 0 : views;
    }

    // 3. String fields that might come as empty objects or arrays
    const stringFields = [
      'title', 'category', 'description', 'allergyInfo', 'categoryLink',
      'featuredText', 'heroImage', 'href', 'imageAlt', 'img', 'featureImage',
      'cookingImage', 'preparationImage', 'finalPresentationImage', 'intro',
      'nutritionDisclaimer', 'serving', 'shortDescription', 'slug', 'storage',
      'story', 'testimonial', 'updatedDate', 'videoUrl', 'videoDuration',
      'recipeOrigin', 'makeAhead', 'leftovers', 'difficultyReasoning', 'seasonality',
      'status', 'authorId', 'categoryId'
    ];

    for (const field of stringFields) {
      if (recipeData[field] !== null && recipeData[field] !== undefined) {
        if (typeof recipeData[field] === 'object') {
          // Object in string field - convert to JSON string or extract value
          console.warn(`⚠️ Field ${field} is object, converting to string`);
          recipeData[field] = JSON.stringify(recipeData[field]);
        } else if (typeof recipeData[field] !== 'string') {
          recipeData[field] = String(recipeData[field]);
        }
      }
    }

    // 4. Json fields - ensure they're proper objects (not strings)
    const jsonFields = [
      'author', 'completeProcess', 'essIngredientGuide', 'faq', 'ingredientGuide',
      'questions', 'recipeInfo', 'relatedRecipes', 'sections', 'timing',
      'whyYouLove', 'ingredients', 'instructions', 'nutrition', 'tasteProfile',
      'textureProfile', 'variations', 'substitutions', 'dietaryAdaptations',
      'temperatureNotes', 'timeline'
    ];

    for (const field of jsonFields) {
      if (recipeData[field] !== null && recipeData[field] !== undefined) {
        // If it's a string, try to parse it as JSON
        if (typeof recipeData[field] === 'string') {
          try {
            recipeData[field] = JSON.parse(recipeData[field]);
            console.log(`🔄 Parsed ${field} from JSON string`);
          } catch {
            // If parsing fails, wrap in an object
            console.warn(`⚠️ Field ${field} is invalid JSON string, wrapping`);
            recipeData[field] = { value: recipeData[field] };
          }
        }
      }
    }

    // 5. Remove any fields that aren't in the schema to prevent Prisma errors
    const validRecipeFields = new Set([
      'id', 'title', 'category', 'categoryId', 'description', 'allergyInfo', 'author',
      'categoryHref', 'categoryLink', 'completeProcess', 'essIngredientGuide', 'faq',
      'featuredText', 'heroImage', 'href', 'imageAlt', 'images', 'img', 'featureImage',
      'cookingImage', 'preparationImage', 'finalPresentationImage', 'ingredientGuide',
      'intro', 'mustKnowTips', 'notes', 'nutritionDisclaimer', 'professionalSecrets',
      'questions', 'recipeInfo', 'relatedRecipes', 'sections', 'serving', 'shortDescription',
      'slug', 'storage', 'story', 'testimonial', 'timing', 'tools', 'updatedDate',
      'whyYouLove', 'ingredients', 'instructions', 'views', 'authorId', 'status',
      'videoUrl', 'videoDuration', 'nutrition', 'aggregateRating', 'reviewCount',
      'keywords', 'tasteProfile', 'textureProfile', 'recipeOrigin', 'variations',
      'substitutions', 'dietaryAdaptations', 'pairings', 'shoppingList', 'makeAhead',
      'leftovers', 'equipmentNotes', 'ingredientPrep', 'temperatureNotes', 'timeline',
      'commonMistakes', 'flavorBoosters', 'specialNotes', 'difficultyReasoning',
      'servingSuggestions', 'seasonality'
    ]);

    // Remove unknown fields
    const originalKeys = Object.keys(recipeData);
    for (const key of originalKeys) {
      if (!validRecipeFields.has(key)) {
        console.warn(`⚠️ Removing unknown field: ${key}`);
        delete recipeData[key];
      }
    }

    console.log("✅ Field validation complete. Final data keys:", Object.keys(recipeData).length);

    // Create the recipe using processed data with unique slug
    const createdRecipe = await prisma.recipe.create({
      data: recipeData,
    });

    // Automatically revalidate affected pages using tags
    try {
      const categorySlug = recipe.category?.toLowerCase().replace(/\s+/g, "-");

      // Call our admin revalidation API with tag-based revalidation
      const revalidateResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/admin/revalidate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_secret:
              process.env.ADMIN_SECRET || process.env.REVALIDATE_SECRET,
            action: "new-recipe",
            recipe_slug: createdRecipe.slug,
            recipe_category: categorySlug,
            tags: [
              "recipes",
              "all-recipes",
              "latest",
              "/",
              "trending",
              "categories",
              ...(categorySlug ? [`category-${categorySlug}`] : []),
            ],
          }),
        }
      );

      if (revalidateResponse.ok) {
        console.log("✅ Auto-revalidation successful");
      } else {
        console.warn(
          "⚠️ Auto-revalidation failed:",
          await revalidateResponse.text()
        );
      }
    } catch (revalidateError) {
      console.warn("❌ Failed to auto-revalidate:", revalidateError);
    }

    // CRITICAL: Revalidate admin paths
    await revalidateAdminPaths();

    return NextResponse.json(createdRecipe);
  } catch (error) {
    // Detailed error logging and response
    console.error("❌ RECIPE CREATION ERROR - DETAILED REPORT:");
    console.error("=====================================");
    
    // Error type and message
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error Type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error Message:", errorMessage);
    
    // Stack trace for debugging
    if (error instanceof Error && error.stack) {
      console.error("Stack Trace:", error.stack);
    }
    
    // Handle PrismaClientValidationError (type mismatch errors)
    if (error instanceof Error && error.constructor.name === 'PrismaClientValidationError') {
      console.error("🔴 Prisma Validation Error - Type Mismatch Detected");
      
      // Extract the problematic field from error message
      const fieldMatch = errorMessage.match(/Argument `(\w+)`/);
      const expectedMatch = errorMessage.match(/Expected (\w+)/);
      const providedMatch = errorMessage.match(/provided (\w+)/);
      
      const problemField = fieldMatch ? fieldMatch[1] : 'unknown';
      const expectedType = expectedMatch ? expectedMatch[1] : 'unknown';
      const providedType = providedMatch ? providedMatch[1] : 'unknown';
      
      return NextResponse.json(
        {
          error: "Failed to create recipe",
          type: "PrismaClientValidationError",
          details: `Field "${problemField}" has wrong type. Expected ${expectedType}, got ${providedType}.`,
          hint: `The field "${problemField}" is receiving data in the wrong format. This should be auto-fixed, but if you see this error, please report it.`,
          rawError: errorMessage.substring(0, 500) // First 500 chars
        },
        { status: 400 }
      );
    }
    
    // Prisma-specific errors (database errors)
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      console.error("Prisma Error Code:", prismaError.code);
      console.error("Prisma Meta:", prismaError.meta);
      
      // Common Prisma error codes
      const prismaErrorMap: Record<string, string> = {
        'P2002': 'Unique constraint violation - duplicate slug or field',
        'P2003': 'Foreign key constraint failed - invalid authorId or reference',
        'P2025': 'Record not found',
        'P2000': 'Value too long for field',
        'P2001': 'Record does not exist',
        'P2011': 'Null constraint violation - required field is missing',
        'P2012': 'Missing required value',
        'P2014': 'Relation violation',
      };
      
      const errorDescription = prismaErrorMap[prismaError.code] || 'Unknown database error';
      console.error("Error Description:", errorDescription);
      
      // Return detailed error for Prisma errors
      return NextResponse.json(
        {
          error: "Failed to create recipe",
          details: errorDescription,
          code: prismaError.code,
          message: errorMessage,
          meta: prismaError.meta,
          hint: getErrorHint(prismaError.code, prismaError.meta)
        },
        { status: 500 }
      );
    }
    
    // Validation errors
    if (errorMessage.includes('required') || errorMessage.includes('validation')) {
      console.error("Validation Error Detected");
      return NextResponse.json(
        {
          error: "Validation failed",
          details: errorMessage,
          hint: "Check that all required fields are provided with valid data types"
        },
        { status: 400 }
      );
    }
    
    // JSON parsing errors
    if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
      console.error("JSON Parsing Error Detected");
      return NextResponse.json(
        {
          error: "Invalid JSON data",
          details: errorMessage,
          hint: "Check that the request body contains valid JSON"
        },
        { status: 400 }
      );
    }
    
    // Generic error response with as much detail as possible
    return NextResponse.json(
      {
        error: "Failed to create recipe",
        details: errorMessage,
        type: error instanceof Error ? error.constructor.name : typeof error,
        hint: "Check server logs for full error details"
      },
      { status: 500 }
    );
  }
}

// Helper function to provide actionable hints based on error
function getErrorHint(code: string, meta: any): string {
  switch (code) {
    case 'P2002':
      const target = meta?.target?.[0] || 'field';
      return `The ${target} already exists. Try using a different value or check for duplicates.`;
    case 'P2003':
      const field = meta?.field_name || 'reference field';
      return `The ${field} references a record that doesn't exist. Verify that the related record (e.g., author) exists first.`;
    case 'P2011':
      const nullField = meta?.constraint || 'required field';
      return `The ${nullField} cannot be null. Provide a valid value for this required field.`;
    case 'P2000':
      return `One or more field values are too long. Check string lengths and reduce if necessary.`;
    case 'P2025':
      return `The related record was not found in the database. Ensure all references exist before creating the recipe.`;
    default:
      return `Check the error details and verify all data is correctly formatted.`;
  }
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.nextUrl);
  var id = url.searchParams.get("id");

  let recipe;
  try {
    recipe = await request.json(); // Parse body once
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  // Check for id in query params first, then fall back to body
  if (!id) {
    id = recipe.id;
  }

  if (!id) {
    return NextResponse.json(
      { error: "Recipe ID is required" },
      { status: 400 }
    );
  }

  try {
    // Check authentication (supports both JWT and API tokens)
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    // Remove fields that don't exist in schema or are relationship fields
    const { categoryId, authorId, seoScore, ...recipeData } = recipe;
    
    // ============================================
    // COMPREHENSIVE FIELD TYPE VALIDATION & CONVERSION (PUT)
    // ============================================

    // 1. String[] fields - convert object arrays to string arrays
    const stringArrayFields = [
      'tools', 'notes', 'mustKnowTips', 'professionalSecrets', 'keywords',
      'pairings', 'shoppingList', 'equipmentNotes', 'ingredientPrep',
      'commonMistakes', 'flavorBoosters', 'specialNotes', 'servingSuggestions',
      'images'
    ];

    // Helper to convert object array to string array
    const convertObjectArrayToStrings = (arr: unknown[]): string[] => {
      return arr.map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          const name = obj.tool || obj.name || obj.title || obj.item || obj.tip || obj.secret || '';
          const desc = obj.description || obj.note || obj.text || obj.content || '';
          const nameStr = String(name);
          const descStr = String(desc);
          if (nameStr) return descStr ? `${nameStr}: ${descStr}` : nameStr;
          if (descStr) return descStr;
          return JSON.stringify(item);
        }
        return String(item);
      }).filter(s => s && s.trim() !== '' && s !== '{}');
    };

    for (const field of stringArrayFields) {
      if (recipeData[field] === null || recipeData[field] === undefined) {
        continue; // Don't set default for update - might not want to change
      } else if (Array.isArray(recipeData[field])) {
        if (recipeData[field].length > 0 && typeof recipeData[field][0] === 'object') {
          console.log(`🔄 [PUT] Converting ${field} from objects to strings...`);
          recipeData[field] = convertObjectArrayToStrings(recipeData[field]);
        }
        recipeData[field] = recipeData[field].map((item: unknown) => 
          typeof item === 'string' ? item : String(item)
        );
      } else if (typeof recipeData[field] === 'string') {
        recipeData[field] = [recipeData[field]];
      }
    }

    // 2. Numeric fields
    if (recipeData.aggregateRating !== null && recipeData.aggregateRating !== undefined) {
      const rating = parseFloat(String(recipeData.aggregateRating));
      recipeData.aggregateRating = isNaN(rating) ? null : rating;
    }
    if (recipeData.reviewCount !== null && recipeData.reviewCount !== undefined) {
      const count = parseInt(String(recipeData.reviewCount), 10);
      recipeData.reviewCount = isNaN(count) ? null : count;
    }
    if (recipeData.views !== null && recipeData.views !== undefined) {
      const views = parseInt(String(recipeData.views), 10);
      recipeData.views = isNaN(views) ? 0 : views;
    }

    // 3. Remove any fields that aren't in the schema
    const validRecipeFields = new Set([
      'id', 'title', 'category', 'categoryId', 'description', 'allergyInfo', 'author',
      'categoryHref', 'categoryLink', 'completeProcess', 'essIngredientGuide', 'faq',
      'featuredText', 'heroImage', 'href', 'imageAlt', 'images', 'img', 'featureImage',
      'cookingImage', 'preparationImage', 'finalPresentationImage', 'ingredientGuide',
      'intro', 'mustKnowTips', 'notes', 'nutritionDisclaimer', 'professionalSecrets',
      'questions', 'recipeInfo', 'relatedRecipes', 'sections', 'serving', 'shortDescription',
      'slug', 'storage', 'story', 'testimonial', 'timing', 'tools', 'updatedDate',
      'whyYouLove', 'ingredients', 'instructions', 'views', 'authorId', 'status',
      'videoUrl', 'videoDuration', 'nutrition', 'aggregateRating', 'reviewCount',
      'keywords', 'tasteProfile', 'textureProfile', 'recipeOrigin', 'variations',
      'substitutions', 'dietaryAdaptations', 'pairings', 'shoppingList', 'makeAhead',
      'leftovers', 'equipmentNotes', 'ingredientPrep', 'temperatureNotes', 'timeline',
      'commonMistakes', 'flavorBoosters', 'specialNotes', 'difficultyReasoning',
      'servingSuggestions', 'seasonality'
    ]);

    const originalKeys = Object.keys(recipeData);
    for (const key of originalKeys) {
      if (!validRecipeFields.has(key)) {
        console.warn(`⚠️ [PUT] Removing unknown field: ${key}`);
        delete recipeData[key];
      }
    }

    // Build update data object
    const updateData: any = {
      ...recipeData,
      updatedAt: new Date(),
    };
    
    // Only include authorId if it's a valid string (not null/undefined)
    if (authorId && typeof authorId === 'string') {
      updateData.authorId = authorId;
    }
    
    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: updateData,
    });

    // Automatically revalidate affected pages using tags
    try {
      const categorySlug = recipe.category?.toLowerCase().replace(/\s+/g, "-");

      // Call our admin revalidation API with tag-based revalidation
      const revalidateResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/admin/revalidate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_secret:
              process.env.ADMIN_SECRET || process.env.REVALIDATE_SECRET,
            action: "update-recipe",
            recipe_slug: updatedRecipe.slug,
            recipe_category: categorySlug,
            tags: [
              "recipes",
              "/",
              "all-recipes",
              `recipe-${updatedRecipe.slug}`,
              `${updatedRecipe.slug}`,
              "latest",
              "trending",
              "categories",
              ...(categorySlug ? [`category-${categorySlug}`] : []),
              ...(categorySlug ? [`${categorySlug}`] : []),
            ],
          }),
        }
      );

      if (revalidateResponse.ok) {
        console.log("✅ Auto-revalidation successful for updated recipe");
      } else {
        console.warn(
          "⚠️ Auto-revalidation failed:",
          await revalidateResponse.text()
        );
      }
    } catch (revalidateError) {
      console.warn("❌ Failed to auto-revalidate:", revalidateError);
    }

    // CRITICAL: Revalidate admin paths
    await revalidateAdminPaths();

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    // Detailed error logging for UPDATE operations
    console.error("❌ RECIPE UPDATE ERROR - DETAILED REPORT:");
    console.error("=====================================");
    console.error("Recipe ID:", id);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error Type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error Message:", errorMessage);
    
    if (error instanceof Error && error.stack) {
      console.error("Stack Trace:", error.stack);
    }
    
    // Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      console.error("Prisma Error Code:", prismaError.code);
      console.error("Prisma Meta:", prismaError.meta);
      
      return NextResponse.json(
        {
          error: "Failed to update recipe",
          details: errorMessage,
          code: prismaError.code,
          meta: prismaError.meta,
          recipeId: id,
          hint: getErrorHint(prismaError.code, prismaError.meta)
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        error: "Failed to update recipe",
        details: errorMessage,
        recipeId: id,
        type: error instanceof Error ? error.constructor.name : typeof error,
        hint: "Check server logs for full error details"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.nextUrl);
  var id = url.searchParams.get("id");
  // Check for id in query params first, then fall back to checking the request body
  if (!id) {
    try {
      const payload = await request.json();
      id = payload.id;
    } catch (e) {
      // If request has no body or parsing fails, continue with null id
      return NextResponse.json(
        { error: "Recipe ID is required" },
        { status: 400 }
      );
    }
  }

  if (!id) {
    return NextResponse.json(
      { error: "Recipe ID is required" },
      { status: 400 }
    );
  }

  try {
    // Auth is handled by middleware, no need to check again

    const deletedRecipe = await prisma.recipe.delete({
      where: {
        id: id,
      },
    });

    // Immediately clear all recipe-related caches
    revalidateTag("recipes");
    revalidateTag("all-recipes");
    revalidateTag("latest");
    revalidateTag("trending");
    revalidateTag("categories");

    // Force revalidate the home page
    revalidatePath("/");

    // Automatically revalidate affected pages using tags
    try {
      const categorySlug = deletedRecipe.category
        ?.toLowerCase()
        .replace(/\s+/g, "-");

      // Call our admin revalidation API with tag-based revalidation
      const revalidateResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/admin/revalidate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_secret:
              process.env.ADMIN_SECRET || process.env.REVALIDATE_SECRET,
            action: "delete-recipe",
            recipe_slug: deletedRecipe.slug,
            recipe_category: categorySlug,
            tags: [
              "recipes",
              "/",
              "all-recipes",
              `recipe-${deletedRecipe.slug}`,
              `${deletedRecipe.slug}`,
              "latest",
              "trending",
              "categories",
              ...(categorySlug ? [`category-${categorySlug}`] : []),
              ...(categorySlug ? [`${categorySlug}`] : []),
            ],
          }),
        }
      );

      if (revalidateResponse.ok) {
        console.log("✅ Auto-revalidation successful for deleted recipe");
      } else {
        console.warn(
          "⚠️ Auto-revalidation failed:",
          await revalidateResponse.text()
        );
      }
    } catch (revalidateError) {
      console.warn("❌ Failed to auto-revalidate:", revalidateError);
    }

    // CRITICAL: Revalidate admin paths
    await revalidateAdminPaths();

    return NextResponse.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
