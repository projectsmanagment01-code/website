import React from "react";
import { getAdminSettings } from "@/lib/admin-settings";

export default async function Contact() {
  let heroTitle = "";
  let heroSubtitle = "";

  try {
    const settings = await getAdminSettings();
    console.log('🔍 Contact - Full settings:', JSON.stringify(settings, null, 2));
    const contactPageContent = settings.contactPageContent;
    console.log('🔍 Contact - contactPageContent:', JSON.stringify(contactPageContent, null, 2));
    
    if (contactPageContent) {
      heroTitle = contactPageContent.heroTitle || "";
      heroSubtitle = contactPageContent.heroSubtitle || "";
      console.log('🔍 Contact - heroTitle:', heroTitle);
      console.log('🔍 Contact - heroSubtitle:', heroSubtitle);
    } else {
      console.log('❌ Contact - No contactPageContent found');
    }
  } catch (error) {
    console.error("❌ Error loading contact content:", error);
  }

  console.log('📊 Contact - Rendering with:', { heroTitle, heroSubtitle, willRender: !!(heroTitle || heroSubtitle) });

  return (
    <>
      {/* Hero Section */}
      {(heroTitle || heroSubtitle) && (
        <div className="text-center space-y-4 mb-12">
          {heroTitle && (
            <h1 className="text-4xl md:text-5xl font-bold text-black">
              {heroTitle}
            </h1>
          )}
          {heroSubtitle && (
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {heroSubtitle}
            </p>
          )}
        </div>
      )}
    </>
  );
}