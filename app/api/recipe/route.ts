export const dynamic = "force-dynamic";
//export const revalidate = 60;
// Updated main recipe route with better error handling
// app/api/recipe/route.ts (Enhanced version)
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { withRetry } from "@/lib/prisma-helpers";
import { revalidateTag, revalidatePath } from "next/cache";
import { processRecipeAuthor } from "@/lib/author-integration";

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
    const token = await auth.getToken(request);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const recipe = await request.json();
    console.log("📥 Received recipe data:", {
      title: recipe.title,
      keys: Object.keys(recipe),
      hasAuthor: !!recipe.author,
      hasAuthorId: !!recipe.authorId
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

    return NextResponse.json(createdRecipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
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
    const token = await auth.getToken(request);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...recipe,
        updatedAt: new Date(),
      },
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

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
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

    return NextResponse.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
