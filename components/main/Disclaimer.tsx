import React from "react";
import { getAdminSettings } from "@/lib/admin-settings";

export default async function Disclaimer() {
  const settings = await getAdminSettings();
  const heroTitle = settings.staticPages.disclaimerHeroTitle || "Disclaimer";
  const heroIntro = settings.staticPages.disclaimerHeroIntro || "Important disclaimers for using our food blog and recipes.";
  const disclaimerContent = settings.staticPages.disclaimer;

  console.log("Disclaimer hero data:", { heroTitle, heroIntro }); // Debug log

  return (
    <div className="w-full mx-auto">
      <div className="bg-stone-100 box-border border border-dashed border-black rounded-[40px] overflow-hidden py-8 pr-8 pl-4 shadow-lg mb-12">
        <div className="text-center mb-12">
          <h1 className="text-[2.28rem] font-bold text-black mb-4">
            {heroTitle}
          </h1>
          <p className="text-lg text-black max-w-3xl mx-auto">
            {heroIntro}
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          {disclaimerContent && disclaimerContent.trim() ? (
            <div 
              className="prose prose-lg max-w-none text-black"
              dangerouslySetInnerHTML={{ __html: disclaimerContent }} 
            />
          ) : (
            <div className="prose prose-lg max-w-none text-black">
              <p className="text-gray-600 mb-6">
                <strong>Last updated:</strong> January 2025
              </p>
              {/* Default disclaimer content would go here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
