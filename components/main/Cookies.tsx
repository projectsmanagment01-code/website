import React from "react";
import { getAdminSettings } from "@/lib/admin-settings";

export default async function Cookies() {
  const settings = await getAdminSettings();
  const cookiesContent = settings.staticPages.cookies;

  // If content exists in settings, render it as HTML
  if (cookiesContent && cookiesContent.trim()) {
    return (
      <div
        className="prose prose-lg max-w-none w-full mx-auto"
        dangerouslySetInnerHTML={{ __html: cookiesContent }}
      />
    );
  }

  // Fallback to default content
  return (
    <div className="w-full mx-auto">
      <div className="bg-stone-100 box-border border border-dashed border-black rounded-[40px] overflow-hidden py-8 pr-8 pl-4 shadow-lg mb-12">
        <div className="text-center mb-8">
          <h2 className="text-[2.28rem] font-bold text-black mb-4">
            Cookie Policy
          </h2>
          <p className="text-lg text-black">
            Learn about how we use cookies and similar technologies on our
            website.
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-black">
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> January 2025
          </p>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">
              What Are Cookies?
            </h3>
            <p className="text-black mb-4">
              Cookies are small text files placed on your device when you visit
              our website. They help us provide you with a better browsing
              experience.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">
              Types of Cookies We Use
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-black mb-2">
                  Essential Cookies
                </h4>
                <p className="text-black mb-2">
                  Necessary for website functionality:
                </p>
                <ul className="list-disc pl-6 text-black mb-4">
                  <li>Authentication cookies</li>
                  <li>Security cookies</li>
                  <li>Session management cookies</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium text-black mb-2">
                  Analytics Cookies
                </h4>
                <p className="text-black mb-2">
                  Help us measure and improve site performance:
                </p>
                <ul className="list-disc pl-6 text-black mb-4">
                  <li>Google Analytics cookies</li>
                  <li>Page view tracking</li>
                  <li>User behavior analysis</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium text-black mb-2">
                  Advertising Cookies
                </h4>
                <p className="text-black mb-2">
                  Used for relevant advertising:
                </p>
                <ul className="list-disc pl-6 text-black mb-4">
                  <li>Google AdSense cookies</li>
                  <li>Targeted advertising</li>
                  <li>Ad personalization</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">
              Managing Cookies
            </h3>
            <p className="text-black mb-4">
              You can control cookies through your browser settings. Most
              browsers allow you to:
            </p>
            <ul className="list-disc pl-6 text-black mb-4">
              <li>View stored cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Block third-party cookies</li>
              <li>Clear cookies when closing browser</li>
              <li>Delete cookies entirely</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">Contact Us</h3>
            <p className="text-black">
              Questions about our cookie usage? Contact us through our contact
              page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
