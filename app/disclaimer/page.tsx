export const dynamic = "force-static";

import React from "react";
import { getAdminSettings } from "@/lib/admin-settings";
import { Metadata } from "next";
import Disclaimer from "@/components/main/Disclaimer";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getAdminSettings();
    const disclaimerPageContent = settings.disclaimerPageContent;

    if (disclaimerPageContent && disclaimerPageContent.metaTitle) {
      return {
        title: disclaimerPageContent.metaTitle,
        description: disclaimerPageContent.metaDescription || "Read important disclaimers about our recipes and content.",
      };
    }
  } catch (error) {
    console.error("Error generating disclaimer metadata:", error);
  }

  return {
    title: "Disclaimer",
    description: "Read important disclaimers about our recipes and content.",
  };
}

export default async function DisclaimerPage({}) {
  return (
    <main className="container-md section-md">
      <Disclaimer />
    </main>
  );
}
