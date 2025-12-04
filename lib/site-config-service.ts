/**
 * Site Configuration Service
 * 
 * Manages site configuration stored in the database.
 * Provides fallback to JSON files during migration period.
 */

import { prisma } from '@/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_DIR = path.join(process.cwd(), 'data', 'config');

export interface HeroConfig {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  metaTitle: string;
  metaDescription: string;
}

export interface SiteInfo {
  logoType: string;
  logoText: string;
  logoTagline: string;
  logoImage: string;
  favicon: string;
  footerCopyright: string;
  footerVersion: string;
  siteTitle: string;
  siteDescription: string;
  siteDomain: string;
  siteUrl: string;
  siteEmail: string;
  lastUpdated?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
  icon: string;
}

/**
 * Get hero configuration from database with JSON fallback
 */
export async function getHeroConfig(): Promise<HeroConfig> {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key: 'hero' },
    });

    if (config) {
      return config.data as HeroConfig;
    }
  } catch (error) {
    console.warn('Failed to fetch hero config from database, falling back to JSON:', error);
  }

  // Fallback to JSON file
  const jsonPath = path.join(CONFIG_DIR, 'home.json');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    return {
      title: data.heroTitle,
      description: data.heroDescription,
      buttonText: data.heroButtonText,
      buttonLink: data.heroButtonLink,
      backgroundImage: data.heroBackgroundImage,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
    };
  }

  // Default fallback
  return {
    title: 'Welcome to Our Recipe Site',
    description: 'Discover delicious recipes',
    buttonText: 'Explore Recipes',
    buttonLink: '/recipes',
    backgroundImage: '/images/hero-default.jpg',
    metaTitle: 'Recipe Site',
    metaDescription: 'Discover amazing recipes',
  };
}

/**
 * Update hero configuration in database
 */
export async function updateHeroConfig(data: HeroConfig, updatedBy?: string): Promise<void> {
  await prisma.siteConfig.upsert({
    where: { key: 'hero' },
    update: {
      data,
      updatedAt: new Date(),
      updatedBy,
    },
    create: {
      key: 'hero',
      data,
      updatedBy,
    },
  });
}

/**
 * Get site information from database with JSON fallback
 */
export async function getSiteInfo(): Promise<SiteInfo> {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key: 'site' },
    });

    if (config) {
      return config.data as SiteInfo;
    }
  } catch (error) {
    console.warn('Failed to fetch site config from database, falling back to JSON:', error);
  }

  // Fallback to JSON file
  const jsonPath = path.join(CONFIG_DIR, 'site.json');
  if (fs.existsSync(jsonPath)) {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  }

  // Default fallback
  return {
    logoType: 'text',
    logoText: 'Recipe Site',
    logoTagline: 'Delicious Recipes',
    logoImage: '',
    favicon: '',
    footerCopyright: '2025 Recipe Site. All rights reserved.',
    footerVersion: 'v1.0',
    siteTitle: 'Recipe Site',
    siteDescription: 'Discover amazing recipes',
    siteDomain: 'example.com',
    siteUrl: 'https://example.com',
    siteEmail: 'contact@example.com',
  };
}

/**
 * Update site information in database
 */
export async function updateSiteInfo(data: SiteInfo, updatedBy?: string): Promise<void> {
  await prisma.siteConfig.upsert({
    where: { key: 'site' },
    update: {
      data: { ...data, lastUpdated: new Date().toISOString() },
      updatedAt: new Date(),
      updatedBy,
    },
    create: {
      key: 'site',
      data: { ...data, lastUpdated: new Date().toISOString() },
      updatedBy,
    },
  });
}

/**
 * Get social links from database with JSON fallback
 */
export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key: 'social_links' },
    });

    if (config) {
      return config.data as SocialLink[];
    }
  } catch (error) {
    console.warn('Failed to fetch social links from database, falling back to JSON:', error);
  }

  // Fallback to JSON file
  const jsonPath = path.join(CONFIG_DIR, 'home.json');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    if (data.socialMediaLinks && data.socialMediaLinks.length > 0) {
      return data.socialMediaLinks;
    }
  }

  // Default fallback with empty social links template
  return [
    { platform: "Facebook", url: "", enabled: false, icon: "facebook" },
    { platform: "Instagram", url: "", enabled: false, icon: "instagram" },
    { platform: "YouTube", url: "", enabled: false, icon: "youtube" },
    { platform: "Twitter/X", url: "", enabled: false, icon: "twitter" },
    { platform: "Pinterest", url: "", enabled: false, icon: "pinterest" },
    { platform: "Email", url: "", enabled: false, icon: "email" },
  ];
}

/**
 * Update social links in database
 */
export async function updateSocialLinks(links: SocialLink[], updatedBy?: string): Promise<void> {
  await prisma.siteConfig.upsert({
    where: { key: 'social_links' },
    update: {
      data: links,
      updatedAt: new Date(),
      updatedBy,
    },
    create: {
      key: 'social_links',
      data: links,
      updatedBy,
    },
  });
}

/**
 * Get all configuration (for admin panel)
 */
export async function getAllConfig() {
  const [hero, site, socialLinks] = await Promise.all([
    getHeroConfig(),
    getSiteInfo(),
    getSocialLinks(),
  ]);

  return {
    hero,
    site,
    socialLinks,
  };
}
