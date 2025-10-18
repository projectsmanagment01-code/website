/**
 * Page Content Service
 * 
 * Manages all page content stored in the database.
 * Provides fallback to JSON files during migration period.
 * 
 * Supported pages:
 * - privacy
 * - terms
 * - about
 * - contact
 * - faq
 * - disclaimer
 * - cookies
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const CONFIG_DIR = path.join(process.cwd(), 'data', 'config');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'content');

export interface PageContentData {
  title?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroIntro?: string;
  content?: string; // HTML or text content
  metaTitle?: string;
  metaDescription?: string;
  data?: any; // Additional structured data (contact cards, FAQ items, etc.)
  lastUpdated?: string;
}

/**
 * Get page content from database with JSON fallback
 */
export async function getPageContent(pageName: string): Promise<PageContentData> {
  try {
    const pageContent = await prisma.pageContent.findUnique({
      where: { page: pageName },
    });

    if (pageContent) {
      return {
        title: pageContent.title || undefined,
        heroTitle: pageContent.heroTitle || undefined,
        heroDescription: pageContent.heroDescription || undefined,
        heroIntro: pageContent.heroIntro || undefined,
        content: pageContent.content || undefined,
        metaTitle: pageContent.metaTitle || undefined,
        metaDescription: pageContent.metaDescription || undefined,
        data: pageContent.data || undefined,
        lastUpdated: pageContent.updatedAt.toISOString(),
      };
    }
  } catch (error) {
    console.warn(`Failed to fetch ${pageName} content from database, falling back to JSON:`, error);
  }

  // Fallback to JSON files
  return await getPageContentFromJSON(pageName);
}

/**
 * Fallback: Read from JSON files
 */
async function getPageContentFromJSON(pageName: string): Promise<PageContentData> {
  // Try data/config directory first
  let jsonPath = path.join(CONFIG_DIR, `${pageName}-content.json`);
  if (fs.existsSync(jsonPath)) {
    try {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    } catch (error) {
      console.error(`Error reading ${jsonPath}:`, error);
    }
  }

  // Try uploads/content directory
  jsonPath = path.join(UPLOADS_DIR, `${pageName}.json`);
  if (fs.existsSync(jsonPath)) {
    try {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    } catch (error) {
      console.error(`Error reading ${jsonPath}:`, error);
    }
  }

  // Return default content
  return getDefaultPageContent(pageName);
}

/**
 * Update page content in database
 */
export async function updatePageContent(
  pageName: string,
  data: PageContentData,
  updatedBy?: string
): Promise<void> {
  await prisma.pageContent.upsert({
    where: { page: pageName },
    update: {
      title: data.title,
      heroTitle: data.heroTitle,
      heroDescription: data.heroDescription,
      heroIntro: data.heroIntro,
      content: data.content,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      data: data.data,
      updatedAt: new Date(),
      updatedBy,
    },
    create: {
      page: pageName,
      title: data.title,
      heroTitle: data.heroTitle,
      heroDescription: data.heroDescription,
      heroIntro: data.heroIntro,
      content: data.content,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      data: data.data,
      updatedBy,
    },
  });
}

/**
 * Get all pages content (for admin panel)
 */
export async function getAllPagesContent() {
  const pages = ['privacy', 'terms', 'about', 'contact', 'faq', 'disclaimer', 'cookies'];
  const content: Record<string, PageContentData> = {};

  for (const page of pages) {
    content[page] = await getPageContent(page);
  }

  return content;
}

/**
 * Default content for each page
 */
function getDefaultPageContent(pageName: string): PageContentData {
  const defaults: Record<string, PageContentData> = {
    privacy: {
      heroTitle: 'Privacy Policy',
      heroDescription: 'Your privacy is important to us',
      content: '<p>Privacy policy content goes here...</p>',
      metaTitle: 'Privacy Policy',
      metaDescription: 'Learn about our privacy policy and how we protect your data.',
    },
    terms: {
      heroTitle: 'Terms of Service',
      heroDescription: 'Please read our terms carefully',
      content: '<p>Terms of service content goes here...</p>',
      metaTitle: 'Terms of Service',
      metaDescription: 'Read our terms of service and usage guidelines.',
    },
    about: {
      heroTitle: 'About Us',
      heroDescription: 'Get to know our story',
      content: '<p>About us content goes here...</p>',
      metaTitle: 'About Us',
      metaDescription: 'Learn more about our recipe website and our mission.',
    },
    contact: {
      heroTitle: 'Contact Us',
      heroDescription: 'We\'d love to hear from you',
      content: '',
      metaTitle: 'Contact Us',
      metaDescription: 'Get in touch with us for any questions or inquiries.',
      data: {
        cards: [
          {
            id: 'general',
            title: 'General Inquiries',
            description: 'Have a question? Get in touch with us.',
            email: 'contact@example.com',
            icon: 'mail',
          },
        ],
      },
    },
    faq: {
      heroTitle: 'Frequently Asked Questions',
      heroDescription: 'Find answers to common questions',
      content: '',
      metaTitle: 'FAQ - Frequently Asked Questions',
      metaDescription: 'Find answers to frequently asked questions.',
      data: {
        categories: [
          {
            category: 'General',
            questions: [
              {
                question: 'How do I search for recipes?',
                answer: 'Use the search bar at the top of the page.',
              },
            ],
          },
        ],
      },
    },
    disclaimer: {
      heroTitle: 'Disclaimer',
      heroDescription: 'Important information about our content',
      content: '<p>Disclaimer content goes here...</p>',
      metaTitle: 'Disclaimer',
      metaDescription: 'Read our disclaimer and important notices.',
    },
    cookies: {
      heroTitle: 'Cookie Policy',
      heroDescription: 'Learn how we use cookies',
      content: '<p>Cookie policy content goes here...</p>',
      metaTitle: 'Cookie Policy',
      metaDescription: 'Learn about our cookie policy and how we use cookies.',
    },
  };

  return defaults[pageName] || {
    title: pageName.charAt(0).toUpperCase() + pageName.slice(1),
    content: '<p>Content coming soon...</p>',
    metaTitle: pageName.charAt(0).toUpperCase() + pageName.slice(1),
    metaDescription: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} page`,
  };
}
