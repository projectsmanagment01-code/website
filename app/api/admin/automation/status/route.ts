import { NextRequest, NextResponse } from "next/server";
import { getQueueStats, getRecentJobs } from "@/automation";
import { verifyAdminToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Get recent automations from database
    const recentJobs = await prisma.recipeAutomation.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        recipeRowNumber: true,
        spyTitle: true,
        status: true,
        currentStep: true,
        totalSteps: true,
        startedAt: true,
        completedAt: true,
        error: true,
      }
    });

    // Get queue statistics from DATABASE, not Redis
    const activeCount = await prisma.recipeAutomation.count({
      where: { status: 'PROCESSING' }
    });
    const waitingCount = await prisma.recipeAutomation.count({
      where: { status: 'PENDING' }
    });
    const completedCount = await prisma.recipeAutomation.count({
      where: { status: { in: ['SUCCESS', 'COMPLETED'] } }
    });
    const failedCount = await prisma.recipeAutomation.count({
      where: { status: 'FAILED' }
    });

    const queueStats = {
      active: activeCount,
      waiting: waitingCount,
      completed: completedCount,
      failed: failedCount,
    };

    // Calculate automation stats from database
    const totalAutomations = await prisma.recipeAutomation.count();
    const successfulAutomations = await prisma.recipeAutomation.count({
      where: { status: 'SUCCESS' }
    });
    const completedAutomations = await prisma.recipeAutomation.findMany({
      where: {
        status: 'SUCCESS',
        NOT: {
          completedAt: null,
        },
      },
      select: {
        startedAt: true,
        completedAt: true,
      }
    });

    // Calculate average time
    let averageTime = 0;
    if (completedAutomations.length > 0) {
      const totalTime = completedAutomations.reduce((sum: number, auto: any) => {
        const duration = new Date(auto.completedAt!).getTime() - new Date(auto.startedAt).getTime();
        return sum + duration;
      }, 0);
      averageTime = Math.round(totalTime / completedAutomations.length / 60000); // Convert to minutes
    }

    const automationStats = {
      totalRuns: totalAutomations,
      successRate: totalAutomations > 0 ? Math.round((successfulAutomations / totalAutomations) * 100) : 0,
      averageTime,
      lastRun: recentJobs && recentJobs.length > 0 ? recentJobs[0].startedAt.toISOString() : undefined
    };

    return NextResponse.json({
      success: true,
      queueStats,
      recentJobs,
      automationStats,
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
