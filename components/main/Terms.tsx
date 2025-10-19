import React from "react";
import { getAdminSettings } from "@/lib/admin-settings";

export default async function Terms() {
  const settings = await getAdminSettings();
  const termsPageContent = settings.termsPageContent;

  // If structured content exists, render it
  if (termsPageContent && termsPageContent.sections && termsPageContent.sections.length > 0) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Hero Section */}
        {(termsPageContent.heroTitle || termsPageContent.heroSubtitle) && (
          <div className="text-center mb-12">
            {termsPageContent.heroTitle && (
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {termsPageContent.heroTitle}
              </h1>
            )}
            {termsPageContent.heroSubtitle && (
              <p className="text-lg md:text-xl opacity-80 leading-relaxed">
                {termsPageContent.heroSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Last Updated */}
        {termsPageContent.lastUpdated && (
          <div className="text-center mb-8 pb-8 border-b">
            <p className="text-sm font-semibold opacity-70">
              Last Updated: {new Date(termsPageContent.lastUpdated).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-10">
          {termsPageContent.sections.map((section, index) => (
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
  const termsContent = settings.staticPages.terms;
  if (termsContent && termsContent.trim()) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <div 
            className="prose prose-lg max-w-none leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&>ol]:mb-4 [&>ol]:pl-6 [&>ol]:list-decimal [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-3"
            dangerouslySetInnerHTML={{ __html: termsContent }} 
          />
        </div>
      </div>
    );
  }

  // Default fallback content
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
        <p className="text-lg md:text-xl opacity-80">
          Terms and conditions for using our website and services.
        </p>
      </div>

      <div className="text-center mb-8 pb-8 border-b">
        <p className="text-sm font-semibold opacity-70">
          Last Updated: October 2025
        </p>
      </div>

      <div className="space-y-10">
        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">1. Agreement to Terms</h2>
          <p className="leading-relaxed">
            By accessing our website, you accept and agree to be bound by these terms. 
            If you do not agree, please do not use this service.
          </p>
        </section>

        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">2. Use License</h2>
          <p className="leading-relaxed">
            Permission is granted for personal, non-commercial use only. 
            You may not modify, distribute, or commercially exploit our content.
          </p>
        </section>

        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">3. User Responsibilities</h2>
          <p className="leading-relaxed">
            Users must not engage in unlawful activities, infringe intellectual property, 
            or submit harmful or offensive content.
          </p>
        </section>
      </div>
    </div>
  );
}
