import { NextRequest, NextResponse } from "next/server";
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

export async function GET() {
  try {
    await ensureContentDir();
    const filePath = path.join(CONTENT_DIR, "home.json");

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