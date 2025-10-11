export const dynamic = "force-static";
export const revalidate = 60;

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * POST /api/recipe/upload
 * Upload images for recipes with automatic categorization
 */
export async function POST(request: NextRequest) {
  try {
    // Auth is handled by middleware, so we can get user info from headers
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");

    console.log(`� Upload request from user: ${userEmail} (ID: ${userId})`);

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = (formData.get("category") as string) || "recipes";
    const recipeId = formData.get("recipeId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Create filename with recipe ID for better organization
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = recipeId
      ? `recipe-${recipeId}-${timestamp}.${extension}`
      : `recipe-${timestamp}.${extension}`;

    // In a real implementation, you'd upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll simulate the upload
    const uploadUrl = `/uploads/recipes/${filename}`;

    // Here you would typically:
    // 1. Upload to your cloud storage service
    // 2. Get the public URL
    // 3. Optionally save image metadata to database

    return NextResponse.json({
      success: true,
      url: uploadUrl,
      filename: filename,
      originalName: file.name,
      size: file.size,
      category: category,
      recipeId: recipeId,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
