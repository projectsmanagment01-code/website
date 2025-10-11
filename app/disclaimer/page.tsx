export const dynamic = "force-dynamic";

import React from "react";
import { getAdminSettings } from "@/lib/admin-settings";
import { Metadata } from "next";
import Disclaimer from "@/components/main/Disclaimer";

// Function to get disclaimer data for metadata
async function getDisclaimerData() {
  try {
    const settings = await getAdminSettings();
    return {
      heroTitle: settings.staticPages.disclaimerHeroTitle || "Disclaimer",
      heroIntro: settings.staticPages.disclaimerHeroIntro || "Important disclaimers for using our food blog and recipes.",
      metaTitle: "Disclaimer | Recipe Website Legal Notice",
      metaDescription: "Read our disclaimer covering cooking results, nutritional information, food safety, and liability limitations for our recipe website.",
    };
  } catch {
    return {
      heroTitle: "Disclaimer",
      heroIntro: "Important disclaimers for using our food blog and recipes.",
      metaTitle: "Disclaimer | Recipe Website Legal Notice", 
      metaDescription: "Read our disclaimer covering cooking results, nutritional information, food safety, and liability limitations for our recipe website.",
    };
  }
}

// Generate metadata for the page
export async function generateMetadata(): Promise<Metadata> {
  const disclaimerData = await getDisclaimerData();
  
  return {
    title: disclaimerData.metaTitle,
    description: disclaimerData.metaDescription,
  };
}

export default async function DisclaimerPage({}) {
  return (
    <main className="container-md section-md">
      <Disclaimer />
    </main>
  );
}
