import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

// SECURE: Path to store content files - NOT publicly accessible
const CONFIG_DIR = path.join(process.cwd(), "data", "config");

// Ensure config directory exists
async function ensureConfigDir() {
  try {
    await fs.access(CONFIG_DIR);
  } catch {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    console.log("✅ Created secure config directory");
  }
}

export async function GET() {
  try {
    await ensureConfigDir();
    const filePath = path.join(CONFIG_DIR, "site.json");

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

    await ensureConfigDir();
    
    const data = await request.json();
    const filePath = path.join(CONFIG_DIR, "site.json");
    
    // Write the data to file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    console.log("✅ Site settings saved successfully to secure location");
    
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