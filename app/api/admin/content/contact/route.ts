import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

const SETTINGS_FILE = path.join(process.cwd(), "uploads", "contact-content.json");

// Default contact content
const defaultContent = {
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
  metaTitle: "Contact Us - Recipes By Clare",
  metaDescription: "Get in touch with Recipes By Clare for collaborations, privacy questions, or recipe inquiries. We're here to help with all your cooking needs.",
  lastUpdated: null
};

async function ensureDirectoryExists() {
  const dir = path.dirname(SETTINGS_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function loadContent() {
  try {
    await ensureDirectoryExists();
    const data = await fs.readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return default content
    return defaultContent;
  }
}

async function saveContent(content: any) {
  await ensureDirectoryExists();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(content, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const content = await loadContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error("Error loading contact content:", error);
    return NextResponse.json(
      { error: "Failed to load contact content" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate the structure
    if (!body.cards || !Array.isArray(body.cards)) {
      return NextResponse.json(
        { error: "Invalid content structure" },
        { status: 400 }
      );
    }

    // Validate each card
    for (const card of body.cards) {
      if (!card.id || !card.title || !card.description || !card.email || !card.icon) {
        return NextResponse.json(
          { error: "Each card must have id, title, description, email, and icon" },
          { status: 400 }
        );
      }
    }

    await saveContent(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving contact content:", error);
    return NextResponse.json(
      { error: "Failed to save contact content" },
      { status: 500 }
    );
  }
}