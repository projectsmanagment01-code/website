import { NextResponse } from "next/server";
import { getPageContent } from "@/lib/page-content-service";

/**
 * Public API endpoint for contact page content
 */

export async function GET() {
  try {
    const content = await getPageContent('contact');
    
    // Return contact content
    return NextResponse.json(content, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error("Error loading contact content:", error);
    
    // Return default content on error
    return NextResponse.json({
      cards: [
        {
          id: "advertisement",
          title: "Advertisement",
          description: "Looking to collaborate with Recipes By Clare? We'd love to hear from you! Reach out to discover exciting opportunities to showcase your brand through our recipes, articles, and more.",
          email: "ads@recipesbyclare.com",
          icon: "building"
        },
        {
          id: "privacy",
          title: "Privacy Policy",
          description: "Have questions about how we handle your personal data or our privacy practices? Contact us to learn more about our commitment to protecting your privacy. We're here to help.",
          email: "legal@recipesbyclare.com",
          icon: "scale"
        },
        {
          id: "recipes",
          title: "Recipes",
          description: "Curious about a recipe or need inspiration for your next meal? Whether it's a special dish or new ideas you're after, Recipes By Clare is here to guide you. Send us a message and let's talk cooking!",
          email: "contact@recipesbyclare.com",
          icon: "chef"
        }
      ],
      metaTitle: "",
      metaDescription: "",
      lastUpdated: null
    });
  }
}
