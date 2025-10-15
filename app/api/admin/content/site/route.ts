import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

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

export async function GET() {
  try {
    await ensureContentDir();
    const filePath = path.join(CONTENT_DIR, "site.json");

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(content);
      
      return NextResponse.json(data);
    } catch (error) {
      // Return default content if file doesn't exist
      return NextResponse.json({
        logoType: "text",
        logoText: "Recipes website",
        logoTagline: "Recipe Collection",
        logoImage: "",
        favicon: "",
        footerCopyright: "2025 Recipes website. All rights reserved.",
        footerVersion: "V0.1",
        siteTitle: "Recipes website - Delicious Friendly Recipes",
        siteDescription: "Discover amazing recipes from Guelma Team. Perfect for family meals, special occasions, and everyday cooking.",
        siteDomain: "example.com",
        siteUrl: "https://example.com",
        siteEmail: "contact@example.com",
        lastUpdated: null,
      });
    }
  } catch (error) {
    console.error("Error loading site settings:", error);
    
    // Return default content on error
    return NextResponse.json({
      logoType: "text",
      logoText: "Recipes website",
      logoTagline: "Recipe Collection",
      logoImage: "",
      favicon: "",
      footerCopyright: "2025 Recipes website. All rights reserved.",
      footerVersion: "V0.1",
      siteTitle: "Recipes website - Delicious Family-Friendly Recipes",
      siteDescription: "Discover amazing recipes from Guelma Team. Perfect for family meals, special occasions, and everyday cooking.",
      siteDomain: "example.com",
      siteUrl: "https://example.com",
      siteEmail: "contact@example.com",
      lastUpdated: null,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = await auth.getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureContentDir();
    
    const data = await request.json();
    const filePath = path.join(CONTENT_DIR, "site.json");
    
    // Write the data to file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    console.log("✅ Site settings saved successfully");
    
    return NextResponse.json({ 
      success: true, 
      message: "Site settings saved successfully",
      data 
    });
  } catch (error) {
    console.error("Error saving site settings:", error);
    return NextResponse.json(
      { error: "Failed to save site settings" },
      { status: 500 }
    );
  }
}