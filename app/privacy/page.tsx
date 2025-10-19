export const dynamic = "force-static";

import Privacy from "@/components/main/Privacy";
import { getAdminSettings } from "@/lib/admin-settings";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getAdminSettings();
    const privacyPageContent = settings.privacyPageContent;

    if (privacyPageContent && privacyPageContent.metaTitle) {
      return {
        title: privacyPageContent.metaTitle,
        description: privacyPageContent.metaDescription || "Learn how we protect your privacy and handle your data.",
      };
    }
  } catch (error) {
    console.error("Error generating privacy metadata:", error);
  }

  return {
    title: "Privacy Policy",
    description: "Learn how we protect your privacy and handle your data.",
  };
}

export default async function PrivacyPage({}) {
  return (
    <main className="container-md section-md">
      <Privacy />
    </main>
  );
}
