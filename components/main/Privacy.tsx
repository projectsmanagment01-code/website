import React from "react";
import { getAdminSettings } from "@/lib/admin-settings";

export default async function Privacy() {
  const settings = await getAdminSettings();
  const privacyContent = settings.staticPages.privacy;

  // If content exists in settings, render it as HTML with proper styling
  if (privacyContent && privacyContent.trim()) {
    return (
      <div className="w-full mx-auto">
        <div className="bg-stone-100 box-border border border-dashed border-black rounded-[40px] overflow-hidden py-8 pr-8 pl-4 shadow-lg mb-12">
          <div
            className="prose prose-lg max-w-none text-black"
            dangerouslySetInnerHTML={{ __html: privacyContent }}
          />
        </div>
      </div>
    );
  }

  // Fallback to default content
  return (
    <div className="w-full mx-auto">
      <div className="bg-stone-100 box-border border border-dashed border-black rounded-[40px] overflow-hidden py-8 pr-8 pl-4 shadow-lg mb-12">
        <div className="text-center mb-8">
          <h2 className="text-[2.28rem] font-bold text-black mb-4">
            Privacy Policy
          </h2>
          <p className="text-lg text-black">
            Learn how we collect, use, and protect your personal information.
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-black">
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> January 2025
          </p>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">Introduction</h3>
            <p className="text-black mb-4">
              Welcome to Recipes by Clare. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you
              visit our website.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">
              Information We Collect
            </h3>
            <p className="text-black mb-4">
              We may collect personal information when you:
            </p>
            <ul className="list-disc pl-6 text-black mb-4">
              <li>Subscribe to our newsletter</li>
              <li>Contact us through our forms</li>
              <li>Comment on recipes</li>
              <li>Create an account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">
              How We Use Your Information
            </h3>
            <p className="text-black mb-4">We use collected information to:</p>
            <ul className="list-disc pl-6 text-black mb-4">
              <li>Provide and maintain our website</li>
              <li>Send newsletters (with consent)</li>
              <li>Respond to inquiries</li>
              <li>Improve our content</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">
              Third-Party Services
            </h3>
            <p className="text-black mb-4">We use:</p>
            <ul className="list-disc pl-6 text-black mb-4">
              <li>
                <strong>Google Analytics:</strong> Website traffic analysis
              </li>
              <li>
                <strong>Google AdSense:</strong> Advertisement display
              </li>
              <li>
                <strong>Social Media:</strong> Sharing features
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">Data Security</h3>
            <p className="text-black mb-4">
              We implement appropriate technical and organizational security
              measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">Your Rights</h3>
            <p className="text-black mb-4">
              Depending on your location, you may have rights to:
            </p>
            <ul className="list-disc pl-6 text-black mb-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your personal information</li>
              <li>Withdraw consent for data processing</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">Cookies</h3>
            <p className="text-black mb-4">
              We use cookies and similar tracking technologies to enhance your
              experience. For detailed information, please see our Cookie
              Policy.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">Contact Us</h3>
            <p className="text-black">
              Questions about this policy? Contact us through our contact page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
