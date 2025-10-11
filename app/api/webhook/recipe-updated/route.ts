import { NextRequest, NextResponse } from "next/server";
import {
  revalidateAfterNewRecipe,
  revalidateAfterRecipeUpdate,
} from "@/data/data";

/**
 * POST /api/webhook/recipe-updated
 * Webhook endpoint to trigger revalidation after recipe changes
 * Call this endpoint after adding/updating recipes in your database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action, // "created" | "updated" | "deleted"
      recipe_slug,
      recipe_category,
      webhook_secret,
    } = body;

    // Verify webhook secret
    const expectedSecret = process.env.WEBHOOK_SECRET || "your-webhook-secret";
    if (webhook_secret !== expectedSecret) {
      return NextResponse.json(
        { message: "Invalid webhook secret" },
        { status: 401 }
      );
    }

    console.log(`🔄 Webhook received: ${action} recipe`, {
      recipe_slug,
      recipe_category,
    });

    let revalidated = false;

    switch (action) {
      case "created":
        revalidated = await revalidateAfterNewRecipe(recipe_category);
        break;

      case "updated":
        revalidated = await revalidateAfterRecipeUpdate(
          recipe_slug,
          recipe_category
        );
        break;

      case "deleted":
        // Revalidate everything for deletions to be safe
        revalidated = await revalidateAfterNewRecipe(recipe_category);
        break;

      default:
        return NextResponse.json(
          { message: "Invalid action. Use 'created', 'updated', or 'deleted'" },
          { status: 400 }
        );
    }

    if (revalidated) {
      return NextResponse.json({
        message: `Successfully revalidated after recipe ${action}`,
        recipe_slug,
        recipe_category,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { message: "Revalidation failed or skipped" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      {
        message: "Webhook processing failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhook/recipe-updated
 * Returns webhook documentation
 */
export async function GET() {
  return NextResponse.json({
    message: "Recipe Update Webhook Endpoint",
    usage: {
      method: "POST",
      url: "/api/webhook/recipe-updated",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        action: "created | updated | deleted",
        recipe_slug: "recipe-slug-here",
        recipe_category: "recipe-category-here",
        webhook_secret: "your-webhook-secret",
      },
    },
    examples: {
      newRecipe: {
        action: "created",
        recipe_slug: "delicious-pasta",
        recipe_category: "main-dishes",
        webhook_secret: "your-webhook-secret",
      },
      updatedRecipe: {
        action: "updated",
        recipe_slug: "delicious-pasta",
        recipe_category: "main-dishes",
        webhook_secret: "your-webhook-secret",
      },
    },
    environment_variables: {
      WEBHOOK_SECRET: "Set this to secure your webhook endpoint",
      REVALIDATE_SECRET: "Set this for the revalidation API",
    },
  });
}
