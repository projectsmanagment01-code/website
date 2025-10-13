import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    // Get settings from database
    const settings = await prisma.adminSettings.findFirst({
      where: { key: "google_search_config" },
    });

    if (!settings || !settings.value) {
      return NextResponse.json(
        { cx: "", apiKey: "" },
        { status: 200 }
      );
    }

    const config = JSON.parse(settings.value);
    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error("Error fetching Google Search settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const verified = verifyToken(token);
    if (!verified) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { cx, apiKey } = body;

    if (!cx || !apiKey) {
      return NextResponse.json(
        { error: "cx and apiKey are required" },
        { status: 400 }
      );
    }

    // Save or update settings
    await prisma.adminSettings.upsert({
      where: { key: "google_search_config" },
      update: {
        value: JSON.stringify({ cx, apiKey }),
        updatedAt: new Date(),
      },
      create: {
        key: "google_search_config",
        value: JSON.stringify({ cx, apiKey }),
      },
    });

    return NextResponse.json(
      { message: "Settings saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving Google Search settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
