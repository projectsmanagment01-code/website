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

    // Parse request body
    const body = await request.json();
    const { rowNumber, title } = body;

    if (!rowNumber || typeof rowNumber !== "number") {
      return NextResponse.json(
        { error: "Validation Error", message: "Row number is required and must be a number" },
        { status: 400 }
      );
    }

    // Start automation
    const jobId = await startAutomation(rowNumber, title);

    return NextResponse.json({
      success: true,
      jobId,
      message: `Automation started for row ${rowNumber}`,
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
