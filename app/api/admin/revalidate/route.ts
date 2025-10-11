const dynamic = "force-static";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * POST /api/admin/revalidate
 * Manual revalidation endpoint for admin use
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { admin_secret, action, recipe_slug, recipe_category, paths, tags } =
      body;

    // Verify admin secret
    const expectedSecret =
      process.env.ADMIN_SECRET || process.env.REVALIDATE_SECRET;
    if (admin_secret !== expectedSecret) {
      return NextResponse.json(
        { message: "Invalid admin secret" },
        { status: 401 }
      );
    }

    let result = false;
    let revalidatedPaths: string[] = [];
    let revalidatedTags: string[] = [];

    switch (action) {
      case "new-recipe":
        // Revalidate paths after new recipe
        const newRecipePaths = [
          "/",
          "/recipes",
          "/categories",
          "/explore",
          ...(recipe_category ? [`/categories/${recipe_category}`] : []),
        ];

        for (const path of newRecipePaths) {
          await revalidatePath(path);
          revalidatedPaths.push(path);
        }

        // Revalidate tags
        const newRecipeTags = ["recipes", "all-recipes", "latest", "trending"];
        for (const tag of newRecipeTags) {
          await revalidateTag(tag);
          revalidatedTags.push(tag);
        }
        result = true;
        break;

      case "update-recipe":
        // Revalidate paths after recipe update
        const updatePaths = [
          "/",
          "/recipes",
          "/categories",
          ...(recipe_slug ? [`/recipes/${recipe_slug}`] : []),
          ...(recipe_category ? [`/categories/${recipe_category}`] : []),
        ];

        for (const path of updatePaths) {
          await revalidatePath(path);
          revalidatedPaths.push(path);
        }

        // Revalidate tags - must match data.ts cache tags exactly
        const updateTags = [
          "recipes", // matches getData() and getRecipes()
          "all-recipes", // matches getData() and getRecipes()
          "latest", // matches getLatest()
          "trending", // matches getTrending()
          "categories", // matches getCategories()
        ];
        for (const tag of updateTags) {
          await revalidateTag(tag);
          revalidatedTags.push(tag);
        }
        result = true;
        break;

      case "delete-recipe":
        // Revalidate paths after recipe deletion
        const deletePaths = [
          "/",
          "/recipes",
          "/categories",
          "/explore",
          ...(recipe_slug ? [`/recipes/${recipe_slug}`] : []),
          ...(recipe_category ? [`/categories/${recipe_category}`] : []),
        ];

        for (const path of deletePaths) {
          await revalidatePath(path);
          revalidatedPaths.push(path);
        }

        // Revalidate tags - must match data.ts cache tags exactly
        const deleteTags = [
          "recipes", // matches getData() and getRecipes()
          "all-recipes", // matches getData() and getRecipes()
          "latest", // matches getLatest() - was "latest-recipes"
          "trending", // matches getTrending()
          "categories", // matches getCategories()
        ];
        for (const tag of deleteTags) {
          await revalidateTag(tag);
          revalidatedTags.push(tag);
        }
        result = true;
        break;

      case "custom":
        // Custom revalidation
        if (paths && Array.isArray(paths)) {
          for (const path of paths) {
            await revalidatePath(path);
            revalidatedPaths.push(path);
          }
        }

        if (tags && Array.isArray(tags)) {
          for (const tag of tags) {
            await revalidateTag(tag);
            revalidatedTags.push(tag);
          }
        }
        result = true;
        break;

      case "all":
        // Revalidate everything
        const allPaths = ["/", "/recipes", "/categories", "/explore"];
        for (const path of allPaths) {
          await revalidatePath(path);
          revalidatedPaths.push(path);
        }

        const allTags = [
          "recipes", // matches getData() and getRecipes()
          "all-recipes", // matches getData() and getRecipes()
          "latest", // matches getLatest() - was "latest-recipes"
          "trending", // matches getTrending()
          "categories", // matches getCategories()
        ];
        for (const tag of allTags) {
          await revalidateTag(tag);
          revalidatedTags.push(tag);
        }
        result = true;
        break;

      default:
        return NextResponse.json(
          {
            message:
              "Invalid action. Use 'new-recipe', 'update-recipe', 'delete-recipe', 'custom', or 'all'",
          },
          { status: 400 }
        );
    }

    console.log(`✅ Admin revalidation completed:`, {
      action,
      revalidatedPaths,
      revalidatedTags,
    });

    return NextResponse.json({
      success: result,
      message: result
        ? "Revalidation triggered successfully"
        : "Revalidation failed",
      action,
      revalidatedPaths,
      revalidatedTags,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Admin revalidation error:", error);
    return NextResponse.json(
      {
        message: "Revalidation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/revalidate
 * Returns admin revalidation documentation
 */
export async function GET() {
  return NextResponse.json({
    message: "Admin Revalidation Endpoint",
    usage: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        admin_secret: "your-admin-secret",
        action: "new-recipe | update-recipe | custom | all",
        recipe_slug: "only-for-update-recipe",
        recipe_category: "optional-category",
        paths: "array-for-custom-action",
        tags: "array-for-custom-action",
      },
    },
    examples: {
      revalidateAfterNewRecipe: {
        admin_secret: "your-secret",
        action: "new-recipe",
        recipe_category: "desserts",
      },
      revalidateAfterUpdate: {
        admin_secret: "your-secret",
        action: "update-recipe",
        recipe_slug: "chocolate-cake",
        recipe_category: "desserts",
      },
      revalidateAll: {
        admin_secret: "your-secret",
        action: "all",
      },
      customRevalidation: {
        admin_secret: "your-secret",
        action: "custom",
        paths: ["/", "/recipes"],
        tags: ["recipes"],
      },
    },
  });
}
