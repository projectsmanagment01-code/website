import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";
import { checkHybridAuthOrRespond } from "@/lib/auth-standard";

// Next.js configuration for API route
export const dynamic = "force-dynamic";

// Configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 20; // Maximum files per bulk upload
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Generate filename keeping original name with WebP extension
function generateFileName(originalName: string): string {
  const nameWithoutExt = path.parse(originalName).name;
  return `${nameWithoutExt}.webp`;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication (supports both JWT and API tokens)
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    await ensureUploadDir();

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const category = (formData.get("category") as string) || "general";

    // Validate number of files
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_FILES} files allowed per upload` },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Create category directory
    const categoryDir = path.join(UPLOAD_DIR, category);
    if (!existsSync(categoryDir)) {
      await mkdir(categoryDir, { recursive: true });
    }

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Validate file
        if (!file || !file.name) {
          errors.push(`File ${i + 1}: No file provided`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}: File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
          continue;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
          errors.push(`${file.name}: File type ${file.type} not allowed`);
          continue;
        }

        // Generate filename
        const fileName = generateFileName(file.name);
        const filePath = path.join(categoryDir, fileName);

        // Check if file already exists
        if (existsSync(filePath)) {
          errors.push(`${file.name}: File with this name already exists`);
          continue;
        }

        // Process and save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Convert to WebP and resize if needed
        const processedBuffer = await sharp(buffer)
          .webp({ quality: 85 })
          .resize(1200, 1200, { 
            fit: "inside", 
            withoutEnlargement: true 
          })
          .toBuffer();

        await writeFile(filePath, processedBuffer);

        // Add to results
        results.push({
          success: true,
          originalName: file.name,
          fileName,
          url: `/uploads/${category}/${fileName}`,
          size: processedBuffer.length,
          category,
          uploadedAt: new Date().toISOString(),
        });

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Processing failed'}`);
      }
    }

    const successCount = results.length;
    const errorCount = errors.length;

    return NextResponse.json({
      success: errorCount === 0,
      message: `Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}${
        errorCount > 0 ? `, ${errorCount} failed` : ''
      }`,
      results,
      errors,
      uploadedCount: successCount,
      failedCount: errorCount,
    });

  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload files" },
      { status: 500 }
    );
  }
}