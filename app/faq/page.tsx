export const dynamic = "force-dynamic";

import React from "react";
import { Metadata } from "next";
import { getAdminSettings } from "@/lib/admin-settings";

import Faq from "@/components/main/Faq";

// Function to get FAQ data at page level
async function getFAQData() {
  try {
    const settings = await getAdminSettings();
    const faqContent = settings.staticPages.faq;
    
    // Try to parse stored FAQ data first
    if (faqContent && faqContent.trim()) {
      try {
        const parsedData = JSON.parse(faqContent);
        if (parsedData.heroTitle || parsedData.metaTitle) {
          return parsedData;
        }
      } catch {
        // If not JSON, treat as HTML content
      }
    }
    
    // Return default data
    return {
      heroTitle: "Frequently Asked Questions",
      heroIntro: "Find answers to common questions about our recipes and cooking tips.",
      metaTitle: "FAQ - Frequently Asked Questions",
      metaDescription: "Get answers to frequently asked questions about recipes, cooking tips, and website features.",
      content: faqContent || ""
    };
  } catch {
    return {
      heroTitle: "Frequently Asked Questions", 
      heroIntro: "Find answers to common questions about our recipes and cooking tips.",
      metaTitle: "FAQ - Frequently Asked Questions",
      metaDescription: "Get answers to frequently asked questions about recipes, cooking tips, and website features.",
      content: ""
    };
  }
}

// Generate metadata for the page
export async function generateMetadata(): Promise<Metadata> {
  const faqData = await getFAQData();
  
  return {
    title: faqData.metaTitle,
    description: faqData.metaDescription,
  };
}

export default async function Page() {
  const faqData = await getFAQData();

  return (
    <main className="container-md section-md">
      <Faq faqData={faqData} />
    </main>
  );
}
