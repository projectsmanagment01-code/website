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
    console.error("Error fetching recipes:", error);
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

    // Prepare recipe data for database
    const recipeData = {
      ...recipe,
      authorId: finalAuthorId, // Use processed/validated authorId
      slug: recipe.slug || recipe.title?.toLowerCase().replace(/\s+/g, "-"),
      updatedDate: recipe.updatedDate || new Date().toISOString(),
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

    // Check if recipe with this slug already exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { slug: recipeData.slug }
    });

    if (existingRecipe) {
      console.log("⚠️ Recipe with slug already exists, updating instead");
      const createdRecipe = await prisma.recipe.update({
        where: { slug: recipeData.slug },
        data: recipeData,
      });
      
      return NextResponse.json({
        message: "Recipe updated successfully (slug already existed)",
        recipe: createdRecipe,
      });
    }

    // Create the recipe using processed data
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
    
    // Prisma-specific errors
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
