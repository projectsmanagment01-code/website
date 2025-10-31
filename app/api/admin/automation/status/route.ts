import { NextRequest, NextResponse } from "next/server";
import { getQueueStats, getRecentJobs } from "@/automation";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request);

    if (!authResult.success) {
      return NextResponse.json(
        { error: "Unauthorized", message: authResult.error || "Authentication failed" },
        { status: 401 }
      );
    }

    // Get queue statistics and recent jobs
    const [stats, recentJobs] = await Promise.all([
      getQueueStats(),
      getRecentJobs(),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      recentJobs,
    });
  } catch (error) {
    console.error("Failed to get automation status:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Failed to get status",
      },
      { status: 500 }
    );
  }
}
