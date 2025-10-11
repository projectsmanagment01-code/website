import React from "react";
import { getAdminSettings } from "@/lib/admin-settings";

export default async function Terms() {
  const settings = await getAdminSettings();
  const termsContent = settings.staticPages.terms;

  // If content exists in settings, render it as HTML with proper styling
  if (termsContent && termsContent.trim()) {
    return (
      <div className="w-full mx-auto">
        <div className="bg-stone-100 box-border border border-dashed border-black rounded-[40px] overflow-hidden py-8 pr-8 pl-4 shadow-lg mb-12">
          <div
            className="prose prose-lg max-w-none text-black"
            dangerouslySetInnerHTML={{ __html: termsContent }}
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
            Terms & Conditions
          </h2>
          <p className="text-lg text-black">
            Terms and conditions for using our food blog and services.
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-black">
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> January 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Agreement to Terms
            </h2>
            <p className="text-gray-700 mb-4">
              By accessing and using Recipes by Clare, you accept and agree to
              be bound by the terms and provision of this agreement. If you do
              not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Use License
            </h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily download one copy of the
              materials on Recipes by Clare for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a
              transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Modify or copy the materials</li>
              <li>
                Use the materials for any commercial purpose or for any public
                display
              </li>
              <li>
                Attempt to reverse engineer any software contained on the
                website
              </li>
              <li>
                Remove any copyright or other proprietary notations from the
                materials
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Recipe Usage
            </h2>
            <p className="text-gray-700 mb-4">
              Our recipes are provided for personal, non-commercial use. You
              may:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Cook and prepare recipes for personal and family use</li>
              <li>
                Share recipes with friends and family with proper attribution
              </li>
              <li>Adapt recipes to your dietary needs and preferences</li>
            </ul>
            <p className="text-gray-700 mb-4">
              You may not republish, distribute, or use our recipes for
              commercial purposes without written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              User Content
            </h2>
            <p className="text-gray-700 mb-4">
              By submitting content to our website (comments, reviews, photos),
              you grant us a non-exclusive, royalty-free license to use,
              reproduce, modify, and display such content. You represent that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>
                You own or have the necessary rights to the content you submit
              </li>
              <li>Your content does not infringe on any third party rights</li>
              <li>Your content is not offensive, harmful, or inappropriate</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Prohibited Uses
            </h2>
            <p className="text-gray-700 mb-4">You may not use our website:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>
                For any unlawful purpose or to solicit others to perform
                unlawful acts
              </li>
              <li>
                To violate any international, federal, provincial, or state
                regulations, rules, laws, or local ordinances
              </li>
              <li>
                To infringe upon or violate our intellectual property rights or
                the intellectual property rights of others
              </li>
              <li>
                To harass, abuse, insult, harm, defame, slander, disparage,
                intimidate, or discriminate
              </li>
              <li>To submit false or misleading information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Disclaimer
            </h2>
            <p className="text-gray-700 mb-4">
              The materials on Recipes by Clare are provided on an as is basis.
              Recipes by Clare makes no warranties, expressed or implied, and
              hereby disclaims and negates all other warranties including
              without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of
              rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Limitations
            </h2>
            <p className="text-gray-700 mb-4">
              In no event shall Recipes by Clare or its suppliers be liable for
              any damages (including, without limitation, damages for loss of
              data or profit, or due to business interruption) arising out of
              the use or inability to use the materials on Recipes by Clare,
              even if Recipes by Clare or an authorized representative has been
              notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Privacy Policy
            </h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Please review our Privacy Policy,
              which also governs your use of the website, to understand our
              practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Changes to Terms
            </h2>
            <p className="text-gray-700 mb-4">
              Recipes by Clare may revise these terms of service at any time
              without notice. By using this website, you are agreeing to be
              bound by the then current version of these terms of service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms & Conditions, please
              contact us through our contact page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
