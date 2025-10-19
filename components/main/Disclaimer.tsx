import React from "react";
import { getAdminSettings } from "@/lib/admin-settings";

export default async function Disclaimer() {
  const settings = await getAdminSettings();
  const disclaimerPageContent = settings.disclaimerPageContent;

  // If structured content exists, render it stylishly
  if (disclaimerPageContent && disclaimerPageContent.sections && disclaimerPageContent.sections.length > 0) {
    return (
      <div className="w-full mx-auto">
        {/* Hero Section */}
        {(disclaimerPageContent.heroTitle || disclaimerPageContent.heroSubtitle) && (
          <div className="text-center mb-12">
            {disclaimerPageContent.heroTitle && (
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
                {disclaimerPageContent.heroTitle}
              </h1>
            )}
            {disclaimerPageContent.heroSubtitle && (
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                {disclaimerPageContent.heroSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-8">
          {disclaimerPageContent.sections.map((section, index) => (
            <div
              key={section.id}
              className="bg-stone-100 box-border border border-dashed border-black rounded-[40px] overflow-hidden p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
                {section.title}
              </h2>
              <div
                className="prose prose-lg max-w-none text-black"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
          ))}
        </div>

        {/* Last Updated */}
        {disclaimerPageContent.lastUpdated && (
          <div className="text-center mt-12 text-gray-600">
            <p className="text-sm">
              Last updated: {new Date(disclaimerPageContent.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Fallback to old content if exists
  const heroTitle = settings.staticPages.disclaimerHeroTitle || "Disclaimer";
  const heroIntro = settings.staticPages.disclaimerHeroIntro || "Important disclaimers for using our food blog and recipes.";
  const disclaimerContent = settings.staticPages.disclaimer;

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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
