import React from "react";
import { getAdminSettings } from "@/lib/admin-settings";

export default async function Disclaimer() {
  const settings = await getAdminSettings();
  const disclaimerPageContent = settings.disclaimerPageContent;

  // If structured content exists, render it
  if (disclaimerPageContent && disclaimerPageContent.sections && disclaimerPageContent.sections.length > 0) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Hero Section */}
        {(disclaimerPageContent.heroTitle || disclaimerPageContent.heroSubtitle) && (
          <div className="text-center mb-12">
            {disclaimerPageContent.heroTitle && (
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {disclaimerPageContent.heroTitle}
              </h1>
            )}
            {disclaimerPageContent.heroSubtitle && (
              <p className="text-lg md:text-xl opacity-80 leading-relaxed">
                {disclaimerPageContent.heroSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Last Updated */}
        {disclaimerPageContent.lastUpdated && (
          <div className="text-center mb-8 pb-8 border-b">
            <p className="text-sm font-semibold opacity-70">
              Last Updated: {new Date(disclaimerPageContent.lastUpdated).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-10">
          {disclaimerPageContent.sections.map((section, index) => (
            <section key={section.id} className="scroll-mt-8 bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">
                {index + 1}. {section.title}
              </h2>
              <div 
                className="prose prose-lg max-w-none leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&>ol]:mb-4 [&>ol]:pl-6 [&>ol]:list-decimal [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: section.content }} 
              />
            </section>
          ))}
        </div>
      </div>
    );
  }

  // Fallback to old content if no structured data
  const disclaimerContent = settings.staticPages.disclaimer;
  if (disclaimerContent && disclaimerContent.trim()) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <div 
            className="prose prose-lg max-w-none leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&>ol]:mb-4 [&>ol]:pl-6 [&>ol]:list-decimal [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-3"
            dangerouslySetInnerHTML={{ __html: disclaimerContent }} 
          />
        </div>
      </div>
    );
  }

  // Default fallback content
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Disclaimer</h1>
        <p className="text-lg md:text-xl opacity-80">
          Important information about using our website and recipes.
        </p>
      </div>

      <div className="text-center mb-8 pb-8 border-b">
        <p className="text-sm font-semibold opacity-70">
          Last Updated: October 2025
        </p>
      </div>

      <div className="space-y-10">
        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">1. General Information</h2>
          <p className="leading-relaxed">
            The information provided on this website is for general informational purposes only. 
            All information on the site is provided in good faith.
          </p>
        </section>

        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">2. No Professional Advice</h2>
          <p className="leading-relaxed">
            The content on this website does not constitute professional advice. 
            Always seek the advice of qualified professionals for specific questions.
          </p>
        </section>

        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">3. Recipe Accuracy</h2>
          <p className="leading-relaxed">
            While we strive to provide accurate recipes, we make no warranties about 
            the completeness, reliability, or accuracy of this information.
          </p>
        </section>
      </div>
    </div>
  );
}
