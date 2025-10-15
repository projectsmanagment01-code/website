import fs from "fs/promises";
import path from "path";

export default async function WebsiteSchema() {
  // Get site settings from site.json
  const getSiteSettings = async () => {
    try {
      const contentDir = path.join(process.cwd(), "uploads", "content");
      const filePath = path.join(contentDir, "site.json");
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch {
      return {
        siteTitle: "Recipe Collection",
        siteDescription: "Delicious recipes for every occasion",
        siteDomain: "localhost:3000",
        siteUrl: "http://localhost:3000",
        siteEmail: "contact@localhost:3000"
      };
    }
  };

  const siteSettings = await getSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || siteSettings.siteUrl || 'http://localhost:3000';

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteSettings.siteTitle,
    description: siteSettings.siteDescription,
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    publisher: {
      "@type": "Organization",
      name: siteSettings.logoText || siteSettings.siteTitle,
      url: baseUrl,
      ...(siteSettings.logoImage && {
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}${siteSettings.logoImage}`
        }
      }),
      ...(siteSettings.siteEmail && {
        contactPoint: {
          "@type": "ContactPoint",
          email: siteSettings.siteEmail,
          contactType: "customer service"
        }
      })
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteData, null, 2)
      }}
    />
  );
}