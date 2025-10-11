import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * POST /api/revalidate
 * On-demand revalidation endpoint
 * Allows you to revalidate specific pages or data without rebuilding
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, path, tag, type = "path" } = body;

    // Check for secret to confirm this is a valid request
    const revalidateSecret =
      process.env.REVALIDATE_SECRET || "your-secret-token";

    if (secret !== revalidateSecret) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    if (type === "tag" && tag) {
      // Revalidate by cache tag
      await revalidateTag(tag);
      console.log(`✅ Revalidated cache tag: ${tag}`);

      return NextResponse.json({
        revalidated: true,
        type: "tag",
        target: tag,
        now: Date.now(),
        message: `Cache tag "${tag}" has been revalidated`,
      });
    }

    if (type === "path" && path) {
      // Revalidate specific path
      await revalidatePath(path);
      console.log(`✅ Revalidated path: ${path}`);

      return NextResponse.json({
        revalidated: true,
        type: "path",
        target: path,
        now: Date.now(),
        message: `Path "${path}" has been revalidated`,
      });
    }

    // Default: revalidate common recipe-related paths
    const defaultPaths = [
      "/",
      "/recipes",
      "/categories",
      "/explore",
      "/api/recipe",
      "/api/categories",
    ];

    for (const defaultPath of defaultPaths) {
      await revalidatePath(defaultPath);
    }

    // Also revalidate common tags
    const commonTags = ["recipes", "categories", "trending"];
    for (const commonTag of commonTags) {
      await revalidateTag(commonTag);
    }

    console.log(`✅ Revalidated default paths and tags`);

    return NextResponse.json({
      revalidated: true,
      type: "default",
      paths: defaultPaths,
      tags: commonTags,
      now: Date.now(),
      message: "Default paths and cache tags have been revalidated",
    });
  } catch (error) {
    console.error("❌ Revalidation error:", error);
    return NextResponse.json(
      {
        message: "Error revalidating",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/revalidate
 * On-demand revalidation endpoint via query parameters
 * Allows you to revalidate specific pages or data without rebuilding
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");
    const path = url.searchParams.get("path");
    const tag = url.searchParams.get("tag");
    const type = url.searchParams.get("type") || "path";

    // Check for secret to confirm this is a valid request
    const revalidateSecret =
      process.env.REVALIDATE_SECRET || "your-secret-token";

    if (secret !== revalidateSecret) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    if (type === "tag" && tag) {
      // Revalidate by cache tag
      await revalidateTag(tag);
      console.log(`✅ Revalidated cache tag: ${tag}`);

      return NextResponse.json({
        revalidated: true,
        type: "tag",
        target: tag,
        now: Date.now(),
        message: `Cache tag "${tag}" has been revalidated`,
      });
    }

    if (type === "path" && path) {
      // Revalidate specific path
      await revalidatePath(path);
      console.log(`✅ Revalidated path: ${path}`);

      return NextResponse.json({
        revalidated: true,
        type: "path",
        target: path,
        now: Date.now(),
        message: `Path "${path}" has been revalidated`,
      });
    }

    // Default: revalidate common recipe-related paths
    const defaultPaths = [
      "/",
      "/recipes",
      "/categories",
      "/explore",
      "/api/recipe",
      "/api/categories",
    ];

    for (const defaultPath of defaultPaths) {
      await revalidatePath(defaultPath);
    }

    // Also revalidate common tags
    const commonTags = ["recipes", "categories", "trending"];
    for (const commonTag of commonTags) {
      await revalidateTag(commonTag);
    }

    console.log(`✅ Revalidated default paths and tags`);

    return NextResponse.json({
      revalidated: true,
      type: "default",
      paths: defaultPaths,
      tags: commonTags,
      now: Date.now(),
      message: "Default paths and cache tags have been revalidated",
    });
  } catch (error) {
    console.error("❌ Revalidation error:", error);
    return NextResponse.json(
      {
        message: "Error revalidating",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/revalidate (documentation)
 * Returns information about revalidation endpoints
 */
export async function OPTIONS() {
  return NextResponse.json({
    message: "On-demand revalidation endpoint",
    usage: {
      method: "GET",
      queryParams: {
        secret: "your-revalidate-secret (required)",
        type: "path | tag | default (optional, defaults to path)",
        path: "/path/to/revalidate (required if type=path)",
        tag: "cache-tag-name (required if type=tag)",
      },
    },
    examples: {
      revalidateAllRecipes: `/api/revalidate?secret=your-secret&type=tag&tag=recipes`,
      revalidateHomePage: `/api/revalidate?secret=your-secret&type=path&path=/`,
      revalidateDefaults: `/api/revalidate?secret=your-secret`,
    },
  });
}
