import "server-only";
import { promises as fs } from "fs";
import path from "path";

// This ensures this file can only be imported in server components/API routes
// Content directory path - SECURE: Not publicly accessible via uploads
const CONFIG_DIR = path.join(process.cwd(), "data", "config");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Legacy - keeping for backward compatibility during migration
const OLD_CONTENT_DIR = path.join(UPLOADS_DIR, "content");

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

/**
 * Migrates a JSON file from old uploads/content location to secure data/config location
 */
async function migrateConfigFile(filename: string): Promise<void> {
  const oldPath = path.join(OLD_CONTENT_DIR, filename);
  const newPath = path.join(CONFIG_DIR, filename);
  
  try {
    // Check if old file exists and new one doesn't
    await fs.access(oldPath);
    try {
      await fs.access(newPath);
      // New file exists, no need to migrate
      return;
    } catch {
      // New file doesn't exist, migrate
      console.log(`🔒 Migrating ${filename} to secure location...`);
      await fs.mkdir(CONFIG_DIR, { recursive: true });
      await fs.copyFile(oldPath, newPath);
      console.log(`✅ Migrated ${filename} successfully`);
      
      // Optionally delete old file (commented out for safety)
      // await fs.unlink(oldPath);
    }
  } catch {
    // Old file doesn't exist, no migration needed
  }
}

/**
 * Read config file with automatic migration from old location
 */
async function readConfigFile<T>(filename: string, fallback: T): Promise<T> {
  await migrateConfigFile(filename);
  const securePath = path.join(CONFIG_DIR, filename);
  return readJsonFile(securePath, fallback);
}

// Server-side content fetchers
export async function getHeroContent(): Promise<HeroContent> {
  return readConfigFile("home.json", DEFAULT_HERO_CONTENT);
}

export async function getLogoSettings(): Promise<LogoSettings> {
  const siteData = await readConfigFile("site.json", { logoSettings: DEFAULT_LOGO_SETTINGS });
  return siteData.logoSettings || DEFAULT_LOGO_SETTINGS;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return readConfigFile("site.json", DEFAULT_SITE_SETTINGS);
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