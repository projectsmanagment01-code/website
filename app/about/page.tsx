export const dynamic = "force-static";
import About from "@/components/main/Aboute";
import { getAdminSettings } from "@/lib/admin-settings";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAdminSettings();
  const aboutPageContent = settings.aboutPageContent;

  if (aboutPageContent?.metaTitle || aboutPageContent?.metaDescription) {
    return {
      title: aboutPageContent.metaTitle || "About Us",
      description: aboutPageContent.metaDescription || "Learn more about our story and mission.",
    };
  }

  return {
    title: "About Us",
    description: "Learn more about our story and mission.",
  };
}

export default async function AboutPage() {
  return (
    <main className="container-md section-md">
      <About />
    </main>
  );
}
