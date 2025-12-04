import { prisma } from "@/lib/prisma";
import { unstable_cache, revalidateTag } from "next/cache";

export interface AboutPageSection {
  id: string;
  title: string;
  items: string[];
  icon: string;
  position: "left" | "right";
}

export interface AboutPageContent {
  heroTitle: string;
  heroSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  recipesCardTitle: string;
  recipesCardItems: string[];
  recipesCardIcon: string;
  recipesCardPosition: "left" | "right";
  meetAuthorCardTitle: string;
  meetAuthorCardItems: string[];
  meetAuthorCardIcon: string;
  meetAuthorCardPosition: "left" | "right";
  missionCardTitle: string;
  missionCardItems: string[];
  missionCardIcon: string;
  missionCardPosition: "left" | "right";
  customSections?: AboutPageSection[];
}

export interface ContactPageContent {
  heroTitle: string;
  heroSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string | null;
}

export interface PrivacyPageContent {
  heroTitle: string;
  heroSubtitle: string;
  sections: {
    id: string;
    title: string;
    content: string;
  }[];
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string | null;
}

export interface TermsPageContent {
  heroTitle: string;
  heroSubtitle: string;
  sections: {
    id: string;
    title: string;
    content: string;
  }[];
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string | null;
}

export interface DisclaimerPageContent {
  heroTitle: string;
  heroSubtitle: string;
  sections: {
    id: string;
    title: string;
    content: string;
  }[];
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string | null;
}

export interface CookiesPageContent {
  heroTitle: string;
  heroSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  sections: {
    id: string;
    title: string;
    content: string;
  }[];
  lastUpdated: string | null;
}

export interface AdminSettingsData {
  header: {
    html: string[];
    css: string[];
    javascript: string[];
  };
  body: {
    html: string[];
    css: string[];
    javascript: string[];
  };
  footer: {
    html: string[];
    css: string[];
    javascript: string[];
  };
  adsTxt: string;
  robotsTxt: string;
  hero: {
    page: string;
    content: string;
  };
  staticPages: {
    about: string;
    contact: string;
    privacy: string;
    terms: string;
    faq: string;
    disclaimer: string;
    disclaimerHeroTitle?: string;
    disclaimerHeroIntro?: string;
    cookies: string;
  };
  aboutPageContent?: AboutPageContent;
  contactPageContent?: ContactPageContent;
  privacyPageContent?: PrivacyPageContent;
  termsPageContent?: TermsPageContent;
  disclaimerPageContent?: DisclaimerPageContent;
  cookiesPageContent?: CookiesPageContent;
  aiContextSettings?: {
    websiteName: string;
    businessType: string;
    ownerName: string;
    country: string;
    primaryLanguage: string;
    siteDomain: string;
  };
  googleTagManagerId?: string;
  emailSettings?: {
    provider: 'gmail' | 'custom';
    email: string;
    appPassword?: string; // For Gmail
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    from?: string;
  };
  lastUpdated: string | null;
  updatedBy: string | null;
}

export async function getAdminSettings(): Promise<AdminSettingsData> {
  return unstable_cache(
    async (): Promise<AdminSettingsData> => {
      try {
        const settings = await prisma.adminSettings.findMany();

        // Convert database records to structured object
        const settingsMap = new Map(
          settings.map((setting) => [setting.key, setting.value])
        );

        return {
          header: {
            html: JSON.parse(settingsMap.get("header_html") || "[]"),
            css: JSON.parse(settingsMap.get("header_css") || "[]"),
            javascript: JSON.parse(
              settingsMap.get("header_javascript") || "[]"
            ),
          },
          body: {
            html: JSON.parse(settingsMap.get("body_html") || "[]"),
            css: JSON.parse(settingsMap.get("body_css") || "[]"),
            javascript: JSON.parse(settingsMap.get("body_javascript") || "[]"),
          },
          footer: {
            html: JSON.parse(settingsMap.get("footer_html") || "[]"),
            css: JSON.parse(settingsMap.get("footer_css") || "[]"),
            javascript: JSON.parse(
              settingsMap.get("footer_javascript") || "[]"
            ),
          },
          adsTxt:
            settingsMap.get("adsTxt") ||
            "# ads.txt file\n# Add your authorized seller information here",
          robotsTxt:
            settingsMap.get("robotsTxt") ||
            `User-agent: *
Allow: /

# Sitemap
Sitemap: https://yourdomain.com/sitemap.xml

# Disallow admin pages
Disallow: /admin/
Disallow: /api/

# Allow search engines to crawl everything else
Allow: /recipes/
Allow: /categories/
Allow: /about
Allow: /contact
Allow: /faq
Allow: /explore
Allow: /search`,
          hero: {
            page: settingsMap.get("hero_page") || "home",
            content: settingsMap.get("hero_content") || "",
          },
          staticPages: {
            about: settingsMap.get("about_content") || "",
            contact: settingsMap.get("contact_content") || "",
            privacy: settingsMap.get("privacy_content") || "",
            terms: settingsMap.get("terms_content") || "",
            faq: settingsMap.get("faq_content") || "",
            disclaimer: settingsMap.get("disclaimer_content") || "",
            disclaimerHeroTitle: settingsMap.get("disclaimerHeroTitle") || "",
            disclaimerHeroIntro: settingsMap.get("disclaimerHeroIntro") || "",
            cookies: settingsMap.get("cookies_content") || "",
          },
          aboutPageContent: settingsMap.get("aboutPageContent") 
            ? JSON.parse(settingsMap.get("aboutPageContent")!) 
            : undefined,
          contactPageContent: settingsMap.get("contactPageContent") 
            ? JSON.parse(settingsMap.get("contactPageContent")!) 
            : undefined,
          privacyPageContent: settingsMap.get("privacyPageContent") 
            ? JSON.parse(settingsMap.get("privacyPageContent")!) 
            : undefined,
          termsPageContent: settingsMap.get("termsPageContent") 
            ? JSON.parse(settingsMap.get("termsPageContent")!) 
            : undefined,
          disclaimerPageContent: settingsMap.get("disclaimerPageContent") 
            ? JSON.parse(settingsMap.get("disclaimerPageContent")!) 
            : undefined,
          cookiesPageContent: settingsMap.get("cookiesPageContent")
            ? JSON.parse(settingsMap.get("cookiesPageContent")!)
            : undefined,
          aiContextSettings: settingsMap.get("aiContextSettings")
            ? JSON.parse(settingsMap.get("aiContextSettings")!)
            : undefined,
          googleTagManagerId: settingsMap.get("googleTagManagerId") || undefined,
          emailSettings: settingsMap.get("emailSettings")
            ? JSON.parse(settingsMap.get("emailSettings")!)
            : undefined,
          lastUpdated: settingsMap.get("lastUpdated") || null,
          updatedBy: settingsMap.get("updatedBy") || null,
        };
      } catch (error) {
        console.error("Error reading admin settings:", error);
        // Return default settings
        return {
          header: { html: [], css: [], javascript: [] },
          body: { html: [], css: [], javascript: [] },
          footer: { html: [], css: [], javascript: [] },
          adsTxt:
            "# ads.txt file\n# Add your authorized seller information here",
          robotsTxt: `User-agent: *
Allow: /

# Sitemap
Sitemap: https://yourdomain.com/sitemap.xml

# Disallow admin pages
Disallow: /admin/
Disallow: /api/

# Allow search engines to crawl everything else
Allow: /recipes/
Allow: /categories/
Allow: /about
Allow: /contact
Allow: /faq
Allow: /explore
Allow: /search`,
          hero: {
            page: "home",
            content: "",
          },
          staticPages: {
            about: "",
            contact: "",
            privacy: "",
            terms: "",
            faq: "",
            disclaimer: "",
            disclaimerHeroTitle: "",
            disclaimerHeroIntro: "",
            cookies: "",
          },
          aboutPageContent: undefined,
          cookiesPageContent: undefined,
          aiContextSettings: undefined,
          lastUpdated: null,
          updatedBy: null,
        };
      }
    },
    ["admin-settings"],
    { tags: ["admin-settings"] }
  )();
}

export async function saveAdminSettings(
  settings: AdminSettingsData,
  updatedBy?: string
): Promise<boolean> {
  try {
    const updates = [
      { key: "header_html", value: JSON.stringify(settings.header.html) },
      { key: "header_css", value: JSON.stringify(settings.header.css) },
      {
        key: "header_javascript",
        value: JSON.stringify(settings.header.javascript),
      },
      { key: "body_html", value: JSON.stringify(settings.body.html) },
      { key: "body_css", value: JSON.stringify(settings.body.css) },
      {
        key: "body_javascript",
        value: JSON.stringify(settings.body.javascript),
      },
      { key: "footer_html", value: JSON.stringify(settings.footer.html) },
      { key: "footer_css", value: JSON.stringify(settings.footer.css) },
      {
        key: "footer_javascript",
        value: JSON.stringify(settings.footer.javascript),
      },
      { key: "adsTxt", value: settings.adsTxt },
      { key: "robotsTxt", value: settings.robotsTxt },
      { key: "hero_page", value: settings.hero.page },
      { key: "hero_content", value: settings.hero.content },
      { key: "about_content", value: settings.staticPages.about },
      { key: "contact_content", value: settings.staticPages.contact },
      { key: "privacy_content", value: settings.staticPages.privacy },
      { key: "terms_content", value: settings.staticPages.terms },
      { key: "faq_content", value: settings.staticPages.faq },
      { key: "disclaimer_content", value: settings.staticPages.disclaimer },
      { key: "disclaimerHeroTitle", value: settings.staticPages.disclaimerHeroTitle || "" },
      { key: "disclaimerHeroIntro", value: settings.staticPages.disclaimerHeroIntro || "" },
      { key: "cookies_content", value: settings.staticPages.cookies },
      { 
        key: "aboutPageContent", 
        value: settings.aboutPageContent ? JSON.stringify(settings.aboutPageContent) : "" 
      },
      { 
        key: "contactPageContent", 
        value: settings.contactPageContent ? JSON.stringify(settings.contactPageContent) : "" 
      },
      { 
        key: "privacyPageContent", 
        value: settings.privacyPageContent ? JSON.stringify(settings.privacyPageContent) : "" 
      },
      { 
        key: "termsPageContent", 
        value: settings.termsPageContent ? JSON.stringify(settings.termsPageContent) : "" 
      },
      { 
        key: "disclaimerPageContent", 
        value: settings.disclaimerPageContent ? JSON.stringify(settings.disclaimerPageContent) : "" 
      },
      { 
        key: "cookiesPageContent", 
        value: settings.cookiesPageContent ? JSON.stringify(settings.cookiesPageContent) : "" 
      },
      { 
        key: "aiContextSettings", 
        value: settings.aiContextSettings ? JSON.stringify(settings.aiContextSettings) : "" 
      },
      { key: "googleTagManagerId", value: settings.googleTagManagerId || "" },
      { 
        key: "emailSettings", 
        value: settings.emailSettings ? JSON.stringify(settings.emailSettings) : "" 
      },
      { key: "lastUpdated", value: new Date().toISOString() },
      { key: "updatedBy", value: updatedBy || "admin" },
    ];

    // Use transaction to update all settings atomically
    await prisma.$transaction(
      updates.map((update) =>
        prisma.adminSettings.upsert({
          where: { key: update.key },
          update: { value: update.value },
          create: { key: update.key, value: update.value },
        })
      )
    );

    revalidateTag("admin-settings");
    return true;
  } catch (error) {
    console.error("Error saving admin settings:", error);
    return false;
  }
}

export async function getSettingValue(key: string): Promise<string | null> {
  try {
    const setting = await prisma.adminSettings.findUnique({
      where: { key },
    });
    return setting?.value || null;
  } catch (error) {
    console.error(`Error reading setting ${key}:`, error);
    return null;
  }
}
