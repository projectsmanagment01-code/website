import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

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
    const filePath = path.join(CONFIG_DIR, "home.json");

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(content);
      
      // Return only the fields needed for the public website
      return NextResponse.json({
        heroTitle: data.heroTitle || "",
        heroDescription: data.heroDescription || "",
        heroButtonText: data.heroButtonText || "",
        heroButtonLink: data.heroButtonLink || "",
        heroBackgroundImage: data.heroBackgroundImage || "",
        logoType: data.logoType || "text",
        logoText: data.logoText || "",
        logoTagline: data.logoTagline || "",
        logoImage: data.logoImage || "",
        favicon: data.favicon || "",
        footerCopyright: data.footerCopyright || "",
        footerVersion: data.footerVersion || "",
      });
    } catch (error) {
      // Return empty content if file doesn't exist
      return NextResponse.json({
        heroTitle: "",
        heroDescription: "",
        heroButtonText: "",
        heroButtonLink: "",
        heroBackgroundImage: "",
        logoType: "text",
        logoText: "",
        logoTagline: "",
        logoImage: "",
        favicon: "",
        footerCopyright: "",
        footerVersion: "",
      });
    }
  } catch (error) {
    console.error("Error loading home content:", error);
    
    // Return empty content on error
    return NextResponse.json({
      heroTitle: "",
      heroDescription: "",
      heroButtonText: "",
      heroButtonLink: "",
      heroBackgroundImage: "",
      logoType: "text",
      logoText: "",
      logoTagline: "",
      logoImage: "",
      favicon: "",
      footerCopyright: "",
      footerVersion: "",
    });
  }
}