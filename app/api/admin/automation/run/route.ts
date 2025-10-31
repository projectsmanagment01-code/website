import { NextRequest, NextResponse } from "next/server";
import { startAutomation } from "@/automation";
import { verifyAdminToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);

    if (!authResult.success) {
      return NextResponse.json(
        { error: "Unauthorized", message: authResult.error || "Authentication failed" },
        { status: 401 }
      );
    }

    // Start automation (will automatically find eligible row)
    const jobId = await startAutomation();

    return NextResponse.json({
      success: true,
      jobId,
      message: "Automation started - finding eligible recipe automatically",
    });
  } catch (error) {
    console.error("Failed to start automation:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Failed to start automation",
      },
      { status: 500 }
    );
  }
}
