import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import mime from "mime";
import sharp from "sharp";

export async function GET(
  req: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathParts } = await context.params;
    const filePath = path.join(process.cwd(), "uploads", ...pathParts);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    const url = new URL(req.url);
    const width = url.searchParams.get("w");
    const quality = url.searchParams.get("q");

    const mimeType = mime.getType(filePath) || "application/octet-stream";
    const isImage = mimeType.startsWith("image/") && 
      ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(mimeType);

    // Non-image files - serve directly
    if (!isImage) {
      const fileBuffer = await fs.readFile(filePath);
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Image optimization - simplified and fast
    try {
      let sharpInstance = sharp(filePath);
      
      // Resize only if width is specified
      if (width) {
        const w = parseInt(width);
        sharpInstance = sharpInstance.resize(w, null, {
          fit: "inside",
          withoutEnlargement: true
        });
      }

      // Use optimized quality settings
      const q = quality ? Math.min(parseInt(quality), 85) : 75; // Max 85% for speed
      
      // Try AVIF first (best compression), fallback to WebP
      const acceptHeader = req.headers.get("accept") || "";
      
      let optimizedBuffer: Buffer;
      let contentType: string;
      
      if (acceptHeader.includes("image/avif")) {
        // AVIF: 50% smaller than WebP, excellent quality
        optimizedBuffer = await sharpInstance
          .avif({ quality: q, effort: 2 }) // effort: 2 for good compression vs speed balance
          .toBuffer();
        contentType = "image/avif";
      } else {
        // WebP fallback: widely supported, good compression
        optimizedBuffer = await sharpInstance
          .webp({ quality: q, effort: 1 }) // effort: 1 for fastest processing
          .toBuffer();
        contentType = "image/webp";
      }

      return new NextResponse(new Uint8Array(optimizedBuffer), {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    } catch (err) {
      console.error("Image optimization failed, serving original:", err);
      // Fallback to original file
      const fileBuffer = await fs.readFile(filePath);
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  } catch (err) {
    console.error("File serving error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
