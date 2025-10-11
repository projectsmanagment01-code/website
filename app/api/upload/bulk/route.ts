import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { checkHybridAuthOrRespond } from "@/lib/auth-standard";

// Next.js configuration for API route
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication (supports both JWT and API tokens)
    const authCheck = await checkHybridAuthOrRespond(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const body = await request.json();
    const { fileNames } = body;

    if (!fileNames || !Array.isArray(fileNames)) {
      return NextResponse.json(
        { success: false, error: "File names array is required" },
        { status: 400 }
      );
    }

    const results: { fileName: string; success: boolean; error?: string }[] = [];

    // Delete each file
    for (const fileName of fileNames) {
      try {
        const filePath = path.join(UPLOAD_DIR, fileName);
        await unlink(filePath);
        results.push({ fileName, success: true });
      } catch (error) {
        console.error(`Error deleting file ${fileName}:`, error);
        results.push({ 
          fileName, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: failureCount === 0,
      message: `Successfully deleted ${successCount} file${successCount !== 1 ? 's' : ''}${
        failureCount > 0 ? `, ${failureCount} failed` : ''
      }`,
      results,
      deletedCount: successCount,
      failedCount: failureCount
    });

  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete files" },
      { status: 500 }
    );
  }
}