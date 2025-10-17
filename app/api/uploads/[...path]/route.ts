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
      
      // Get image metadata for responsive sizing
      const metadata = await sharpInstance.metadata();
      
      // Resize only if width is specified
      if (width) {
        const w = parseInt(width);
        sharpInstance = sharpInstance.resize(w, null, {
          fit: "inside",
          withoutEnlargement: true
        });
      }

      // Use optimized quality settings
      // For hero images: prioritize speed over quality
      const q = quality ? Math.min(parseInt(quality), 90) : 80;
      
      // Try AVIF first (best compression), fallback to WebP
      const acceptHeader = req.headers.get("accept") || "";
      
      let optimizedBuffer: Buffer;
      let contentType: string;
      
      if (acceptHeader.includes("image/avif")) {
        // AVIF: 50% smaller than WebP, excellent quality
        optimizedBuffer = await sharpInstance
          .avif({ quality: q, effort: 1, chromaSubsampling: '4:2:0' }) // effort: 1 for fastest
          .toBuffer();
        contentType = "image/avif";
      } else {
        // WebP fallback: widely supported, good compression
        optimizedBuffer = await sharpInstance
          .webp({ quality: q, effort: 0, smartSubsample: true }) // effort: 0 for maximum speed
          .toBuffer();
        contentType = "image/webp";
      }

      return new NextResponse(new Uint8Array(optimizedBuffer), {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
          "X-Image-Width": metadata.width?.toString() || '',
          "X-Image-Height": metadata.height?.toString() || '',
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
