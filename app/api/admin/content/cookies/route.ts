import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// SECURE: Cookies content stored in non-public directory
const CONTENT_FILE_PATH = path.join(process.cwd(), "data", "config", "cookies-content.json");

interface CookiesContent {
  heroTitle: string;
  heroDescription: string;
  mainContent: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string | null;
}

const defaultContent: CookiesContent = {
  heroTitle: "Cookie Policy",
  heroDescription: "Learn how we use cookies to improve your browsing experience and protect your privacy.",
  mainContent: `
    <h2>What Are Cookies?</h2>
    <p>Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better browsing experience by remembering your preferences and analyzing how you use our site.</p>
    
    <h2>How We Use Cookies</h2>
    <p>We use cookies for the following purposes:</p>
    <ul>
      <li><strong>Essential Cookies:</strong> These are necessary for the website to function properly</li>
      <li><strong>Analytics Cookies:</strong> These help us understand how visitors interact with our website</li>
      <li><strong>Preference Cookies:</strong> These remember your settings and preferences</li>
    </ul>
    
    <h2>Managing Your Cookie Preferences</h2>
    <p>You can control and manage cookies in various ways. Most browsers allow you to:</p>
    <ul>
      <li>View what cookies are stored on your device</li>
      <li>Delete cookies individually or all at once</li>
      <li>Block cookies from specific sites</li>
      <li>Block all cookies</li>
    </ul>
    
    <h2>Contact Us</h2>
    <p>If you have any questions about our cookie policy, please contact us at privacy@example.com</p>
  `,
  metaTitle: "Cookie Policy - Recipe Website",
  metaDescription: "Learn about our cookie policy and how we use cookies to enhance your browsing experience on our recipe website.",
  lastUpdated: null,
};

function verifyAuth(request: NextRequest): boolean {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false;
    }

    const token = authHeader.substring(7);
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}

function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadContent(): CookiesContent {
  try {
    if (fs.existsSync(CONTENT_FILE_PATH)) {
      const fileContent = fs.readFileSync(CONTENT_FILE_PATH, "utf8");
      return { ...defaultContent, ...JSON.parse(fileContent) };
    }
  } catch (error) {
    console.error("Error loading cookies content:", error);
  }
  return defaultContent;
}

function saveContent(content: CookiesContent): void {
  try {
    ensureDirectoryExists(CONTENT_FILE_PATH);
    fs.writeFileSync(CONTENT_FILE_PATH, JSON.stringify(content, null, 2));
  } catch (error) {
    console.error("Error saving cookies content:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = loadContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error("Error in GET /api/admin/content/cookies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newContent: CookiesContent = await request.json();
    
    // Validate required fields
    if (!newContent.heroTitle || !newContent.heroDescription || !newContent.mainContent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Add last updated timestamp
    newContent.lastUpdated = new Date().toISOString();
    
    saveContent(newContent);
    
    return NextResponse.json({ 
      success: true, 
      message: "Cookies content updated successfully",
      content: newContent 
    });
  } catch (error) {
    console.error("Error in POST /api/admin/content/cookies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}