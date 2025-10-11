import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Path to store content files
const CONTENT_DIR = path.join(process.cwd(), "uploads", "content");

export async function GET() {
  try {
    const filePath = path.join(CONTENT_DIR, "site.json");

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(content);
      
      return NextResponse.json(data);
    } catch (error) {
      // Return empty content if file doesn't exist
      return NextResponse.json({
        logoType: "text",
        logoText: "",
        logoTagline: "",
        logoImage: "",
        favicon: "",
        footerCopyright: "",
        footerVersion: "",
        siteTitle: "",
        siteDescription: "",
        siteDomain: "",
        siteUrl: "",
        siteEmail: "",
        lastUpdated: null,
      });
    }
  } catch (error) {
    console.error("Error loading site settings:", error);
    
    // Return empty content on error
    return NextResponse.json({
      logoType: "text",
      logoText: "",
      logoTagline: "",
      logoImage: "",
      favicon: "",
      footerCopyright: "",
      footerVersion: "",
      siteTitle: "",
      siteDescription: "",
      siteDomain: "",
      siteUrl: "",
      siteEmail: "",
      lastUpdated: null,
    });
  }
}