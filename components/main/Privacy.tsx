import React from "react";
import { getAdminSettings } from "@/lib/admin-settings";

export default async function Privacy() {
  const settings = await getAdminSettings();
  const privacyPageContent = settings.privacyPageContent;

  // If structured content exists, render it
  if (privacyPageContent && privacyPageContent.sections && privacyPageContent.sections.length > 0) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Hero Section */}
        {(privacyPageContent.heroTitle || privacyPageContent.heroSubtitle) && (
          <div className="text-center mb-12">
            {privacyPageContent.heroTitle && (
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {privacyPageContent.heroTitle}
              </h1>
            )}
            {privacyPageContent.heroSubtitle && (
              <p className="text-lg md:text-xl opacity-80 leading-relaxed">
                {privacyPageContent.heroSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Last Updated - Show at top */}
        {privacyPageContent.lastUpdated && (
          <div className="text-center mb-8 pb-8 border-b">
            <p className="text-sm font-semibold opacity-70">
              Last Updated: {new Date(privacyPageContent.lastUpdated).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-10">
          {privacyPageContent.sections.map((section, index) => (
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
  const privacyContent = settings.staticPages.privacy;
  if (privacyContent && privacyContent.trim()) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <div 
            className="prose prose-lg max-w-none leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:pl-6 [&>ul]:list-disc [&>ol]:mb-4 [&>ol]:pl-6 [&>ol]:list-decimal [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-3"
            dangerouslySetInnerHTML={{ __html: privacyContent }} 
          />
        </div>
      </div>
    );
  }

  // Fallback to default content - SERVER RENDERED STATIC
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-lg md:text-xl opacity-80">
          Learn how we collect, use, and protect your personal information.
        </p>
      </div>

      <div className="text-center mb-8 pb-8 border-b">
        <p className="text-sm font-semibold opacity-70">
          Last Updated: October 2025
        </p>
      </div>

      <div className="space-y-10">
        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">1. Introduction</h2>
          <p className="mb-4 leading-relaxed">
            Welcome to Recipes by Clare. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you
            visit our website.
          </p>
        </section>

        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">2. Information We Collect</h2>
          <p className="mb-4 leading-relaxed">
            We may collect personal information when you:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 leading-relaxed">
            <li>Subscribe to our newsletter</li>
            <li>Contact us through our forms</li>
            <li>Comment on recipes</li>
            <li>Create an account</li>
          </ul>
        </section>

        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">3. How We Use Your Information</h2>
          <p className="mb-4 leading-relaxed">We use collected information to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 leading-relaxed">
            <li>Provide and maintain our website</li>
            <li>Send newsletters (with consent)</li>
            <li>Respond to inquiries</li>
            <li>Improve our content</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">4. Third-Party Services</h2>
          <p className="mb-4 leading-relaxed">We use:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 leading-relaxed">
            <li>
              <strong className="font-semibold">Google Analytics:</strong> Website traffic analysis
            </li>
            <li>
              <strong className="font-semibold">Google AdSense:</strong> Advertisement display
            </li>
            <li>
              <strong className="font-semibold">Social Media:</strong> Sharing features
            </li>
          </ul>
        </section>

        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">5. Data Security</h2>
          <p className="mb-4 leading-relaxed">
            We implement appropriate technical and organizational security
            measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">6. Your Rights</h2>
          <p className="mb-4 leading-relaxed">
            Depending on your location, you may have rights to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 leading-relaxed">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your personal information</li>
            <li>Withdraw consent for data processing</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">7. Cookies</h2>
          <p className="mb-4 leading-relaxed">
            We use cookies and similar tracking technologies to enhance your
            experience. For detailed information, please see our Cookie
            Policy.
          </p>
        </section>

        <section className="bg-stone-100 border border-dashed border-black rounded-[40px] p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">8. Contact Us</h2>
          <p className="leading-relaxed">
            Questions about this policy? Contact us through our contact page.
          </p>
        </section>
      </div>
    </div>
  );
}
