import "server-only";
import { promises as fs } from "fs";
import path from "path";

// This ensures this file can only be imported in server components/API routes
// Content directory path
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const CONTENT_DIR = path.join(UPLOADS_DIR, "content");

// Type definitions
export interface HeroContent {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  heroBackgroundImage: string;
}

export interface LogoSettings {
  logoType: "text" | "image";
  logoText: string;
  logoImage: string;
  logoTagline?: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  favicon: string;
  logoSettings: LogoSettings;
}

// Default fallback content (brand-consistent)
const DEFAULT_HERO_CONTENT: HeroContent = {
  title: "Welcome to Calama Team Recipes",
  subtitle: "Discover delicious, family-friendly recipes that bring people together around the table",
  buttonText: "Explore Recipes",
  buttonLink: "/recipes",
  heroBackgroundImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f97316;stop-opacity:0.8'/%3E%3Cstop offset='100%25' style='stop-color:%23ea580c;stop-opacity:0.9'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg)'/%3E%3C/svg%3E"
};

const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  logoType: "text",
  logoText: "Calama Team Recipes",
  logoImage: ""
};

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: "Calama Team Recipes - Delicious Family-Friendly Recipes",
  siteDescription: "Discover amazing recipes from the Calama team. Easy-to-follow instructions for delicious meals that bring families together.",
  siteUrl: "https://yoursite.com",
  favicon: "/favicon.ico",
  logoSettings: DEFAULT_LOGO_SETTINGS
};

// Utility function to check if an image URL is valid
async function isValidImageUrl(imageUrl: string): Promise<boolean> {
  if (!imageUrl || imageUrl.startsWith("data:")) {
    return true; // Data URLs are always "valid"
  }

  try {
    // For local files, check if they exist
    if (imageUrl.startsWith("/uploads/") || !imageUrl.startsWith("http")) {
      const imagePath = path.join(process.cwd(), "public", imageUrl);
      await fs.access(imagePath);
      return true;
    }
    return true; // Assume external URLs are valid
  } catch {
    return false;
  }
}

// Safe file reader with error handling
async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (error) {
    console.warn(`Could not read ${filePath}, using fallback:`, error);
    return fallback;
  }
}

// Server-side content fetchers
export async function getHeroContent(): Promise<HeroContent> {
  const homeJsonPath = path.join(CONTENT_DIR, "home.json");
  return readJsonFile(homeJsonPath, DEFAULT_HERO_CONTENT);
}

export async function getLogoSettings(): Promise<LogoSettings> {
  const siteJsonPath = path.join(CONTENT_DIR, "site.json");
  const siteData = await readJsonFile(siteJsonPath, { logoSettings: DEFAULT_LOGO_SETTINGS });
  return siteData.logoSettings || DEFAULT_LOGO_SETTINGS;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const siteJsonPath = path.join(CONTENT_DIR, "site.json");
  return readJsonFile(siteJsonPath, DEFAULT_SITE_SETTINGS);
}

// Validated content getters (with image validation)
export async function getValidatedHeroContent(): Promise<HeroContent> {
  const heroContent = await getHeroContent();
  
  // Validate background image
  const isValidBg = await isValidImageUrl(heroContent.heroBackgroundImage);
  if (!isValidBg) {
    console.warn("Hero background image not found, using fallback");
    heroContent.heroBackgroundImage = DEFAULT_HERO_CONTENT.heroBackgroundImage;
  }
  
  return heroContent;
}

export async function getValidatedLogoSettings(): Promise<LogoSettings> {
  const logoSettings = await getLogoSettings();
  
  // If it's an image logo, validate the image exists
  if (logoSettings.logoType === "image" && logoSettings.logoImage) {
    const isValidLogo = await isValidImageUrl(logoSettings.logoImage);
    if (!isValidLogo) {
      console.warn("Logo image not found, falling back to text logo");
      return {
        ...logoSettings,
        logoType: "text",
        logoText: logoSettings.logoText || DEFAULT_LOGO_SETTINGS.logoText
      };
    }
  }
  
  return logoSettings;
}