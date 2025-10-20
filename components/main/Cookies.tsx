import React from "react";
import { getAdminSettings } from "@/lib/admin-settings";

export default async function Cookies() {
  const settings = await getAdminSettings();
  const cookiesPageContent = settings.cookiesPageContent;

  // If structured content exists, render it
  if (cookiesPageContent && cookiesPageContent.sections && cookiesPageContent.sections.length > 0) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Hero Section */}
        {(cookiesPageContent.heroTitle || cookiesPageContent.heroSubtitle) && (
          <div className="text-center mb-12">
            {cookiesPageContent.heroTitle && (
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {cookiesPageContent.heroTitle}
              </h1>
            )}
            {cookiesPageContent.heroSubtitle && (
              <p className="text-lg md:text-xl opacity-80 leading-relaxed">
                {cookiesPageContent.heroSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Last Updated */}
        {cookiesPageContent.lastUpdated && (
          <div className="text-center mb-8 pb-8 border-b">
            <p className="text-sm font-semibold opacity-70">
              Last Updated: {new Date(cookiesPageContent.lastUpdated).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-10">
          {cookiesPageContent.sections.map((section, index) => (
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
  const cookiesContent = settings.staticPages.cookies;
  if (cookiesContent && cookiesContent.trim()) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <div 
            className="prose prose-lg max-w-none leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&>ol]:mb-4 [&>ol]:pl-6 [&>ol]:list-decimal [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-3"
            dangerouslySetInnerHTML={{ __html: cookiesContent }} 
          />
        </div>
      </div>
    );
  }

  // Default fallback content
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-lg md:text-xl opacity-80">
          Learn about how we use cookies and similar technologies.
        </p>
      </div>

      <div className="text-center mb-8 pb-8 border-b">
        <p className="text-sm font-semibold opacity-70">
          Last Updated: October 2025
        </p>
      </div>

      <div className="space-y-10">
        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">1. What Are Cookies</h2>
          <p className="leading-relaxed">
            Cookies are small text files placed on your device when you visit our website. 
            They help us provide you with a better browsing experience.
          </p>
        </section>

        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">2. Types of Cookies</h2>
          <p className="leading-relaxed mb-4">We use several types of cookies:</p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li><strong className="font-semibold">Essential Cookies:</strong> Necessary for website functionality</li>
            <li><strong className="font-semibold">Analytics Cookies:</strong> Help us understand how visitors use our site</li>
            <li><strong className="font-semibold">Advertising Cookies:</strong> Used to deliver relevant ads</li>
          </ul>
        </section>

        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">3. How to Control Cookies</h2>
          <p className="leading-relaxed">
            You can control cookies through your browser settings. Most browsers allow you to 
            view, block, and delete cookies. Note that disabling cookies may affect website functionality.
          </p>
        </section>
      </div>
    </div>
  );
}
