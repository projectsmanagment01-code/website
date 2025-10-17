import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// SECURE: Path to store content files - NOT publicly accessible
const CONFIG_DIR = path.join(process.cwd(), "data", "config");

export async function GET() {
  try {
    const filePath = path.join(CONFIG_DIR, "site.json");

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