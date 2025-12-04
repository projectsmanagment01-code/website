import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const UPLOAD_BASE_DIR = path.join(process.cwd(), "uploads");

// Ensure directory exists
async function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

// Generate filename
function generateFileName(originalName: string): string {
  const nameWithoutExt = path.parse(originalName).name;
  const timestamp = Date.now();
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${sanitized}-${timestamp}.webp`;
}

// POST upload image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = (formData.get("category") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WEBP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Setup directories
    const categoryDir = path.join(UPLOAD_BASE_DIR, category);
    await ensureDir(categoryDir);

    // Generate filename
    const fileName = generateFileName(file.name);
    const filePath = path.join(categoryDir, fileName);
    const publicUrl = `/uploads/${category}/${fileName}`;

    // Convert to buffer and optimize with sharp
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image with sharp
    const processedImage = await sharp(buffer)
      .webp({ quality: 85 })
      .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
      .toBuffer();

    // Get image dimensions
    const metadata = await sharp(processedImage).metadata();

    // Save file
    await writeFile(filePath, processedImage);

    // Create media record in database
    const media = await prisma.media.create({
      data: {
        filename: fileName,
        originalName: file.name,
        path: `uploads/${category}/${fileName}`,
        url: publicUrl,
        category,
        mimeType: "image/webp",
        size: processedImage.length,
        width: metadata.width || 0,
        height: metadata.height || 0,
        uploadedBy: "admin", // You can get this from session
        uploadedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      media,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
