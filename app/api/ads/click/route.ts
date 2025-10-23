import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "@/lib/ad-service";

/**
 * POST /api/ads/click
 * Record ad click
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId } = body;

    if (!adId) {
      return NextResponse.json(
        { error: "Ad ID is required" },
        { status: 400 }
      );
    }

    await recordClick(adId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording click:", error);
    return NextResponse.json(
      { error: "Failed to record click" },
      { status: 500 }
    );
  }
}
