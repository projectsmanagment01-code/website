export const dynamic = "force-dynamic";

import React from "react";
import { Metadata } from "next";
import { getPageContent } from "@/lib/page-content-service";

import Faq from "@/components/main/Faq";

// Function to get FAQ data at page level
async function getFAQData() {
  try {
    const pageContent = await getPageContent('faq');
    
    return {
      heroTitle: pageContent.heroTitle || "Frequently Asked Questions",
      heroIntro: pageContent.heroIntro || "Find answers to common questions about our recipes and cooking tips.",
      metaTitle: pageContent.metaTitle || "FAQ - Frequently Asked Questions",
      metaDescription: pageContent.metaDescription || "Get answers to frequently asked questions about recipes, cooking tips, and website features.",
      content: pageContent.content || ""
    };
  } catch (error) {
    console.error("Error loading FAQ data:", error);
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
