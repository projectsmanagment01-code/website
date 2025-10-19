export const dynamic = "force-static";

import Terms from "@/components/main/Terms";
import { getAdminSettings } from "@/lib/admin-settings";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getAdminSettings();
    const termsPageContent = settings.termsPageContent;

    if (termsPageContent && termsPageContent.metaTitle) {
      return {
        title: termsPageContent.metaTitle,
        description: termsPageContent.metaDescription || "Read our terms and conditions for using our website.",
      };
    }
  } catch (error) {
    console.error("Error generating terms metadata:", error);
  }

  return {
    title: "Terms & Conditions",
    description: "Read our terms and conditions for using our website.",
  };
}

export default async function TermsPage({}) {
  return (
    <main className="container-md section-md">
      <Terms />
    </main>
  );
}
