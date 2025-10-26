import { NextRequest, NextResponse } from "next/server";
import { getAdsForPlacement, recordImpression } from "@/lib/ad-service";
import { AdPlacement } from "@prisma/client";

/**
 * GET /api/ads/display?placement=PLACEMENT_NAME
 * Get active ad for a specific placement
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const placement = searchParams.get("placement") as AdPlacement;

    if (!placement) {
      return NextResponse.json(
        { error: "Placement parameter is required" },
        { status: 400 }
      );
    }

    // Get ads for this placement
    const ads = await getAdsForPlacement(placement);

    // If no ads, return empty
    if (ads.length === 0) {
      return NextResponse.json({ ad: null });
    }

    // Get the highest priority ad (first in sorted array)
    const ad = ads[0];

    // Record impression (async, don't wait)
    recordImpression(ad.id).catch(console.error);

    return NextResponse.json({ ad });
  } catch (error) {
    console.error("Error fetching ad:", error);
    return NextResponse.json(
      { error: "Failed to fetch ad" },
      { status: 500 }
    );
  }
}
