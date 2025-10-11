export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSettingValue } from "@/lib/admin-settings";

export async function GET() {
  try {
    const adsTxtContent = await getSettingValue("adsTxt");

    const content =
      adsTxtContent ||
      "# ads.txt file\n# Add your authorized seller information here";

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error in GET /ads.txt:", error);
    return new NextResponse("# Error loading ads.txt", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
