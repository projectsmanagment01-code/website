import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { getAdminSettings, saveAdminSettings } from "@/lib/admin-settings";
import { revalidatePath } from "next/cache";
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

export async function GET(
  request: NextRequest,
  { params }: { params: { page: string } }
) {
  try {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureContentDir();
    const filePath = path.join(CONTENT_DIR, `${params.page}.json`);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(content);
      
      // For static pages, also check admin settings for latest content
      const staticPages = ['privacy', 'terms', 'about', 'contact', 'faq', 'disclaimer', 'cookies'];
      if (staticPages.includes(params.page)) {
        try {
          const adminSettings = await getAdminSettings();
          const adminContent = adminSettings.staticPages[params.page as keyof typeof adminSettings.staticPages];
          if (adminContent) {
            data.content = adminContent;
          }
          // Add hero fields for disclaimer
          if (params.page === 'disclaimer') {
            data.heroTitle = adminSettings.staticPages.disclaimerHeroTitle || '';
            data.heroIntro = adminSettings.staticPages.disclaimerHeroIntro || '';
          }
        } catch (error) {
          console.error(`Error loading ${params.page} from admin settings:`, error);
        }
      }
      
      return NextResponse.json(data);
    } catch (error) {
      // Return default content if file doesn't exist
      const defaultContent = {
        title: "",
        content: "",
        heroTitle: "",
        heroIntro: "",
        metaTitle: "",
        metaDescription: "",
        lastUpdated: null,
      };
      
      // For static pages, try to load from admin settings
      const staticPages = ['privacy', 'terms', 'about', 'contact', 'faq', 'disclaimer', 'cookies'];
      if (staticPages.includes(params.page)) {
        try {
          const adminSettings = await getAdminSettings();
          const adminContent = adminSettings.staticPages[params.page as keyof typeof adminSettings.staticPages];
          if (adminContent) {
            defaultContent.content = adminContent;
          }
          // Add hero fields for disclaimer
          if (params.page === 'disclaimer') {
            defaultContent.heroTitle = adminSettings.staticPages.disclaimerHeroTitle || '';
            defaultContent.heroIntro = adminSettings.staticPages.disclaimerHeroIntro || '';
          }
        } catch (error) {
          console.error(`Error loading ${params.page} from admin settings:`, error);
        }
      }
      
      return NextResponse.json(defaultContent);
    }
  } catch (error) {
    console.error("Error loading content:", error);
    return NextResponse.json(
      { error: "Failed to load content" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { page: string } }
) {
  try {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    await ensureContentDir();
    const filePath = path.join(CONTENT_DIR, `${params.page}.json`);

    // Save content to file
    await fs.writeFile(filePath, JSON.stringify(body, null, 2));

    // For static pages, also save to admin settings so they appear on the public site
    const staticPages = ['privacy', 'terms', 'about', 'contact', 'faq', 'disclaimer', 'cookies'];
    if (staticPages.includes(params.page)) {
      try {
        const adminSettings = await getAdminSettings();
        adminSettings.staticPages[params.page as keyof typeof adminSettings.staticPages] = body.content || '';
        adminSettings.lastUpdated = new Date().toISOString();
        adminSettings.updatedBy = authResult.payload?.email || 'admin';
        await saveAdminSettings(adminSettings);
        console.log(`Updated ${params.page} content in admin settings`);
        
        // Revalidate the public page
        const pageRoutes: { [key: string]: string } = {
          'privacy': '/privacy',
          'terms': '/terms',
          'about': '/about',
          'contact': '/contact',
          'faq': '/faq',
          'disclaimer': '/disclaimer',
          'cookies': '/cookies'
        };
        
        const route = pageRoutes[params.page];
        if (route) {
          revalidatePath(route);
          console.log(`Revalidated public page: ${route}`);
        }
      } catch (error) {
        console.error(`Error updating ${params.page} in admin settings:`, error);
        // Don't fail the request if admin settings update fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving content:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}