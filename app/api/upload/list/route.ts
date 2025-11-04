import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_BASE_DIR = path.join(process.cwd(), "uploads");

// Recursively get all image files from uploads directory
async function getAllImages(dir: string, category: string = ""): Promise<any[]> {
  const images: any[] = [];
  
  if (!existsSync(dir)) {
    return images;
  }

  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      // Recursively search subdirectories
      const subCategory = category ? `${category}/${file.name}` : file.name;
      const subImages = await getAllImages(fullPath, subCategory);
      images.push(...subImages);
    } else if (file.isFile()) {
      // Check if it's an image file
      const ext = path.extname(file.name).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(ext)) {
        const stats = await stat(fullPath);
        const relativePath = path.relative(
          path.join(process.cwd(), "uploads"),
          fullPath
        );
        const url = `/uploads/${relativePath.replace(/\\/g, "/")}`;
        
        images.push({
          name: file.name,
          path: relativePath,
          url: url,
          category: category || "general",
          size: stats.size,
          modifiedAt: stats.mtime,
        });
      }
    }
  }

  return images;
}

// GET list all images from file system
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let images = await getAllImages(UPLOAD_BASE_DIR);

    // Filter by category if specified
    if (category && category !== "all") {
      images = images.filter(img => 
        img.category === category || 
        img.category.startsWith(`${category}/`)
      );
    }

    // Sort by modified date (newest first)
    images.sort((a, b) => 
      new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
    );

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error listing images:", error);
    return NextResponse.json(
      { error: "Failed to list images" },
      { status: 500 }
    );
  }
}
