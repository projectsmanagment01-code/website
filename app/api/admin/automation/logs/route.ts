import { NextRequest, NextResponse } from "next/server";
import { getAutomationLogs } from "@/automation";
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const automationId = searchParams.get("id");
    const level = searchParams.get("level") as "DEBUG" | "INFO" | "WARN" | "ERROR" | undefined;

    // Get logs
    const logs = automationId
      ? await getAutomationLogs(automationId, level)
      : await getAllRecentLogs(level);

    return NextResponse.json({
      success: true,
      logs,
      count: logs.length,
    });
  } catch (error) {
    console.error("Failed to get automation logs:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Failed to get logs",
      },
      { status: 500 }
    );
  }
}

// Helper function to get recent logs across all automations
async function getAllRecentLogs(level?: "DEBUG" | "INFO" | "WARN" | "ERROR") {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const logs = await prisma.automationLog.findMany({
      where: level ? { level } : undefined,
      orderBy: {
        timestamp: "desc",
      },
      take: 100,
    });

    return logs;
  } finally {
    await prisma.$disconnect();
  }
}
