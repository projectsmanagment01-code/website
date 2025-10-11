import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

// Path to store content files
const CONTENT_DIR = path.join(process.cwd(), "uploads", "content");

// Ensure content directory exists
async function ensureContentDir() {
  try {
    await fs.access(CONTENT_DIR);
  } catch {
    await fs.mkdir(CONTENT_DIR, { recursive: true });
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureContentDir();
    const filePath = path.join(CONTENT_DIR, "home.json");

    try {
      const content = await fs.readFile(filePath, "utf-8");
      return NextResponse.json(JSON.parse(content));
    } catch (error) {
      // Return default content if file doesn't exist
      const defaultContent = {
        heroTitle: "Plant-Based Recipes Made Simple",
        heroDescription: "The go-to place for simple, plant-based recipes that fuel your body, fit your busy life, and make eating more fruits and veggies feel easy—not guilty. Because progress isn't about perfection: it's about small, healthy changes... like sipping a green smoothie and still enjoying Taco Bell.",
        heroButtonText: "ALL RECIPES",
        heroButtonLink: "/recipes",
        heroBackgroundImage: "/uploads/general/1759185684697-uctquox2hz-a (2).webp?w=1920&q=85&f=webp",
        metaTitle: "Recipes by Calama - Plant-Based Recipes Made Simple",
        metaDescription: "Discover simple, delicious plant-based recipes that fit your busy lifestyle. Easy healthy cooking made simple.",
        socialMediaLinks: [
          { platform: "Facebook", url: "", enabled: false, icon: "facebook" },
          { platform: "Instagram", url: "", enabled: false, icon: "instagram" },
          { platform: "YouTube", url: "", enabled: false, icon: "youtube" },
          { platform: "Twitter/X", url: "", enabled: false, icon: "twitter" },
          { platform: "Pinterest", url: "", enabled: false, icon: "pinterest" },
          { platform: "Email", url: "", enabled: false, icon: "email" },
        ],
        lastUpdated: null,
      };
      return NextResponse.json(defaultContent);
    }
  } catch (error) {
    console.error("Error loading home content:", error);
    return NextResponse.json(
      { error: "Failed to load content" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    await ensureContentDir();
    const filePath = path.join(CONTENT_DIR, "home.json");

    // Save content to file
    await fs.writeFile(filePath, JSON.stringify(body, null, 2));

    // Create response with cache invalidation headers
    const response = NextResponse.json({ success: true });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response;
  } catch (error) {
    console.error("Error saving home content:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}